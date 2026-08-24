'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, remove } from 'firebase/database';

export default function Manage() {
  // ================= 1. 系統狀態 =================
  const [shifts, setShifts] = useState([]);
  const [sysLog, setSysLog] = useState({ type: 'info', text: '系統準備就緒，等待指令...' });

  // ================= 2. AI 解析與暫存狀態 =================
  const [provider, setProvider] = useState('gemini');
  const [modelName, setModelName] = useState('gemini-1.5-pro-vision');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stagedData, setStagedData] = useState([]); // 暫存區 (人工編輯用)

  // 🌟 [智能聯動] 自動辨識品牌並切換對應模型 (可手動覆寫)
  useEffect(() => {
    if (provider === 'gemini') setModelName('gemini-1.5-pro-vision');
    if (provider === 'nvidia') setModelName('nvidia/llama-3.2-90b-vision-instruct');
    setSysLog({ type: 'info', text: `🔄 引擎切換至 ${provider.toUpperCase()}，預設模型代碼已自動掛載。` });
  }, [provider]);

  // ================= 3. Firebase 資料讀取 =================
  useEffect(() => {
    const shiftsRef = ref(db, 'shifts');
    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        shiftsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
        setShifts(shiftsArray);
      } else {
        setShifts([]);
      }
    });
  }, []);

  // ================= 4. 圖片解析呼叫 =================
  const handleParseImage = async () => {
    if (!imageFile) {
      setSysLog({ type: 'error', text: '❌ 錯誤：請先選擇要解析的班表圖片。' });
      return;
    }
    
    setIsUploading(true);
    setSysLog({ type: 'info', text: `🧠 正在連接 ${provider.toUpperCase()} AI 引擎，讀取圖像中...` });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        const base64 = reader.result;
        
        const res = await fetch('/api/parse-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, provider, modelName })
        });
        
        const result = await res.json();
        
        if (result.success) {
          setStagedData(result.data);
          setSysLog({ type: 'success', text: result.message + ' 👉 請在下方校對資料後點擊「確認寫入」。' });
          setImageFile(null); // 清空選擇檔案
        } else {
          setSysLog({ type: 'error', text: `❌ 錯誤：${result.error}` });
        }
        setIsUploading(false);
      };
    } catch (error) {
      setSysLog({ type: 'error', text: '❌ 發生嚴重錯誤：無法連線至解析伺服器。' });
      setIsUploading(false);
    }
  };

  // ================= 5. 暫存區資料操作 (人工校對) =================
  const handleStagedChange = (index, field, value) => {
    const newData = [...stagedData];
    newData[index][field] = value;
    setStagedData(newData);
  };

  const removeStagedRow = (index) => {
    const newData = [...stagedData];
    newData.splice(index, 1);
    setStagedData(newData);
  };

  const confirmAndSaveStaged = async () => {
    if (stagedData.length === 0) return;
    setSysLog({ type: 'info', text: '💾 正在將校對後的資料寫入資料庫...' });
    
    // 檢查完整性
    const isIncomplete = stagedData.some(s => !s.date || !s.name);
    if (isIncomplete) {
      setSysLog({ type: 'error', text: '⚠️ 寫入失敗：部分資料缺少「日期」或「名稱」，請補齊後再試。' });
      return;
    }

    try {
      for (const item of stagedData) {
        await push(ref(db, 'shifts'), {
          date: item.date, name: item.name, shift: item.shift, location: item.location, time: item.time
        });
      }
      setStagedData([]); // 清空暫存區
      setSysLog({ type: 'success', text: `🎉 成功！已將 ${stagedData.length} 筆資料完美寫入 Firebase 資料庫。` });
    } catch (err) {
      setSysLog({ type: 'error', text: `❌ 寫入資料庫失敗：${err.message}` });
    }
  };

  // ================= 6. 手動新增與一般刪除 =================
  const [manual, setManual] = useState({ date: '', name: '', shift: '', location: '', time: '' });
  
  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manual.date || !manual.name) return alert('請至少填寫日期與名稱');
    await push(ref(db, 'shifts'), manual);
    setManual({ date: '', name: '', shift: '', location: '', time: '' });
    setSysLog({ type: 'success', text: `✅ 手動新增成功：${manual.name} 的排班。` });
  };

  const handleDeleteAll = async () => {
    if (confirm('🚨 確定清除所有排班資料？')) {
      await remove(ref(db, 'shifts'));
      setSysLog({ type: 'info', text: '🗑️ 所有排班資料已清除。' });
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm('確定刪除此筆排班資料？')) {
      await remove(ref(db, `shifts/${id}`));
      setSysLog({ type: 'info', text: `🗑️ 已刪除 ${name} 的排班。` });
    }
  };

  // ================= 7. 渲染 UI =================
  return (
    <div>
      <h1 className="page-title">資料庫與 AI 智能管理中心</h1>

      {/* 🚀 區塊 1: 系統訊息窗 (Console Log) */}
      <div style={{ 
        backgroundColor: sysLog.type === 'error' ? '#fdecea' : sysLog.type === 'success' ? '#e8f5e9' : '#e3f2fd',
        borderLeft: `6px solid ${sysLog.type === 'error' ? '#f44336' : sysLog.type === 'success' ? '#4caf50' : '#2196f3'}`,
        padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: '700', fontSize: '0.95rem',
        color: '#333', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        {sysLog.text}
      </div>

      {/* 🚀 區塊 2: AI 上傳與參數設定 */}
      <div className="filter-bar">
        <h2 style={{ fontSize: '1.2rem', color: '#d84315', fontWeight: '900', marginBottom: '15px' }}>
          ✨ AI 班表圖片解析
        </h2>
        
        <div className="flex-row" style={{ marginBottom: '15px' }}>
          <select 
            className="form-control" 
            value={provider} 
            onChange={(e) => setProvider(e.target.value)}
            style={{ width: 'auto', fontWeight: 'bold', color: '#ff5722' }}
          >
            <option value="gemini">Google Gemini 引擎</option>
            <option value="nvidia">Nvidia NIM 引擎</option>
          </select>
          <input 
            type="text" 
            className="form-control" 
            value={modelName} 
            onChange={(e) => setModelName(e.target.value)}
            style={{ flex: 1, minWidth: '200px', backgroundColor: '#fff', fontFamily: 'monospace', color: '#555' }} 
            placeholder="AI 辨識模型代碼"
          />
        </div>
        <div className="flex-row">
          <input 
            type="file" 
            accept="image/*"
            className="form-control" 
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{ flex: 1, background: '#fff' }} 
          />
          <button 
            className="btn" 
            onClick={handleParseImage} 
            disabled={isUploading}
            style={{ background: isUploading ? '#ccc' : 'var(--primary)', minWidth: '130px' }}
          >
            {isUploading ? '解析中...' : '🚀 開始解析'}
          </button>
        </div>
      </div>

      {/* 🚀 區塊 3: 暫存校對區 (當 AI 有結果時才會顯示) */}
      {stagedData.length > 0 && (
        <div style={{ background: '#fff9c4', padding: '20px', borderRadius: '16px', marginBottom: '30px', border: '2px dashed #fbc02d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#f57f17', fontWeight: '900' }}>
              🔍 解析結果校對區 (尚未寫入)
            </h2>
            <button className="btn" onClick={confirmAndSaveStaged} style={{ background: '#4caf50' }}>
              💾 確認無誤，寫入資料庫
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#795548', marginBottom: '10px', fontWeight: 'bold' }}>
            系統提示：您可以直接點擊下方表格內的文字進行修改。若該筆資料錯誤，可點擊最右側移除。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ background: '#fff' }}>
              <thead>
                <tr>
                  <th>日期 (必填)</th><th>名稱 (必填)</th><th>班別</th><th>地點</th><th>時間</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                {stagedData.map((item, index) => (
                  <tr key={index}>
                    <td><input type="date" className="form-control" value={item.date || ''} onChange={(e) => handleStagedChange(index, 'date', e.target.value)} style={{ padding: '6px', fontSize: '0.9rem' }}/></td>
                    <td><input type="text" className="form-control" value={item.name || ''} onChange={(e) => handleStagedChange(index, 'name', e.target.value)} style={{ padding: '6px', fontSize: '0.9rem', width: '80px' }}/></td>
                    <td><input type="text" className="form-control" value={item.shift || ''} onChange={(e) => handleStagedChange(index, 'shift', e.target.value)} style={{ padding: '6px', fontSize: '0.9rem', width: '80px' }}/></td>
                    <td><input type="text" className="form-control" value={item.location || ''} onChange={(e) => handleStagedChange(index, 'location', e.target.value)} style={{ padding: '6px', fontSize: '0.9rem', width: '90px' }}/></td>
                    <td><input type="text" className="form-control" value={item.time || ''} onChange={(e) => handleStagedChange(index, 'time', e.target.value)} style={{ padding: '6px', fontSize: '0.9rem', width: '100px' }}/></td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => removeStagedRow(index)} className="btn-danger" style={{ padding: '6px 10px', borderRadius: '8px' }}>移除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚀 區塊 4: 手動新增與資料庫檢視 */}
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '15px', marginTop: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#333', fontWeight: '900', borderLeft: '4px solid #ff5722', paddingLeft: '10px' }}>正式資料庫管理</h2>
        <button className="btn-danger" onClick={handleDeleteAll} style={{ borderRadius: '8px', fontWeight: 'bold' }}>
          🗑️ 清除所有資料
        </button>
      </div>

      <form onSubmit={handleManualAdd} className="flex-row filter-bar" style={{ background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <input type="date" className="form-control" value={manual.date} onChange={e => setManual({...manual, date: e.target.value})} style={{ flex: 1, minWidth: '130px' }} required />
        <input type="text" className="form-control" placeholder="名稱(必填)" value={manual.name} onChange={e => setManual({...manual, name: e.target.value})} style={{ flex: 1, minWidth: '90px' }} required />
        <input type="text" className="form-control" placeholder="班別" value={manual.shift} onChange={e => setManual({...manual, shift: e.target.value})} style={{ flex: 1, minWidth: '80px' }} />
        <input type="text" className="form-control" placeholder="地點" value={manual.location} onChange={e => setManual({...manual, location: e.target.value})} style={{ flex: 1, minWidth: '80px' }} />
        <input type="text" className="form-control" placeholder="時間" value={manual.time} onChange={e => setManual({...manual, time: e.target.value})} style={{ flex: 1, minWidth: '100px' }} />
        <button type="submit" className="btn" style={{ minWidth: '100px' }}>+ 手動新增</button>
      </form>

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th><th>名稱</th><th>班別</th><th>地點</th><th>時間</th><th style={{ textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999', padding: '30px' }}>目前資料庫無任何資料</td></tr>
            ) : (
              shifts.map((s) => (
                <tr key={s.id}>
                  <td style={{ color: '#777' }}>{s.date}</td>
                  <td style={{ fontWeight: '900', color: '#ff5722' }}>{s.name}</td>
                  <td>{s.shift}</td>
                  <td>{s.location}</td>
                  <td>{s.time}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDelete(s.id, s.name)} className="btn-danger" style={{ padding: '6px 14px', borderRadius: '8px' }}>刪除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
