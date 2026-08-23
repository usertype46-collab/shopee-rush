'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, remove } from 'firebase/database';

export default function Manage() {
  const [shifts, setShifts] = useState([]);
  
  // ================= 1. 表單狀態 =================
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [shift, setShift] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');

  // ================= 2. AI 辨識狀態 =================
  const [provider, setProvider] = useState('gemini');
  const [modelName, setModelName] = useState('gemini-1.5-pro-vision');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // 🌟 [智能聯動] 自動辨識品牌並切換對應的最佳模型
  useEffect(() => {
    if (provider === 'gemini') {
      setModelName('gemini-1.5-pro-vision');
    } else if (provider === 'nvidia') {
      setModelName('nvidia/llama-3.2-90b-vision-instruct'); // Nvidia 視覺辨識模型
    }
  }, [provider]);

  // ================= 3. 讀取 Firebase =================
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

  // ================= 4. 操作功能 (新增 / 刪除) =================
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!date || !name) return alert('⚠️ 請至少填寫「日期」與「名稱」');
    await push(ref(db, 'shifts'), { date, name, shift, location, time });
    setDate(''); setName(''); setShift(''); setLocation(''); setTime('');
  };

  const handleDeleteAll = async () => {
    if (confirm('🚨 警告：確定要清除所有排班資料嗎？此動作無法復原！')) {
      await remove(ref(db, 'shifts'));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('確定刪除此筆排班資料？')) {
      await remove(ref(db, `shifts/${id}`));
    }
  };

  // ================= 5. 圖片轉碼與送出給後端 =================
  const handleParseImage = async () => {
    if (!imageFile) return alert('請先選擇一張班表截圖檔案！');
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        const base64 = reader.result;
        
        // 呼叫我們的後端 API，金鑰將由伺服器自動辨識讀取
        const res = await fetch('/api/parse-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, provider, modelName })
        });
        
        const result = await res.json();
        
        if (result.success) {
          alert('✅ AI 引擎解析成功！(請至後端將資料陣列寫入 Firebase)');
          setImageFile(null); // 清空已上傳的圖片
        } else {
          alert('❌ 解析失敗: ' + result.error);
        }
        setIsUploading(false);
      };
    } catch (error) {
      console.error(error);
      alert('發生未知的上傳錯誤。');
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">資料庫與 AI 引擎管理</h1>

      {/* 🚀 AI 上傳區塊 (智能模型與金鑰聯動) */}
      <div className="filter-bar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#d84315', fontWeight: '900' }}>
            ✨ AI 班表圖片解析
          </h2>
          <span style={{ fontSize: '0.8rem', background: '#e0f7fa', color: '#006064', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
            🔒 金鑰狀態：伺服器自動讀取中
          </span>
        </div>
        
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
            style={{ flex: 1, minWidth: '200px', backgroundColor: '#fff8f5' }} 
            title="系統已為您自動辨識最佳模型"
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
            style={{ background: isUploading ? '#ccc' : 'var(--primary)' }}
          >
            {isUploading ? '🧠 AI 運算解析中...' : '🚀 開始辨識'}
          </button>
        </div>
      </div>

      {/* 📝 手動新增與清除工具列 */}
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '15px', marginTop: '30px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#333', fontWeight: '900', borderLeft: '4px solid #ff5722', paddingLeft: '10px' }}>手動新增排班</h2>
        <button className="btn-danger" onClick={handleDeleteAll} style={{ borderRadius: '8px', fontWeight: 'bold' }}>
          🗑️ 清除所有資料
        </button>
      </div>

      <form onSubmit={handleAdd} className="flex-row filter-bar" style={{ background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, minWidth: '130px' }} required />
        <input type="text" className="form-control" placeholder="名稱 (必填)" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1, minWidth: '90px' }} required />
        <input type="text" className="form-control" placeholder="班別" value={shift} onChange={e => setShift(e.target.value)} style={{ flex: 1, minWidth: '80px' }} />
        <input type="text" className="form-control" placeholder="地點" value={location} onChange={e => setLocation(e.target.value)} style={{ flex: 1, minWidth: '80px' }} />
        <input type="text" className="form-control" placeholder="時間" value={time} onChange={e => setTime(e.target.value)} style={{ flex: 1, minWidth: '100px' }} />
        <button type="submit" className="btn" style={{ minWidth: '100px' }}>+ 新增資料</button>
      </form>

      {/* 📊 資料管理表格 */}
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>名稱</th>
              <th>班別</th>
              <th>地點</th>
              <th>時間</th>
              <th style={{ textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#999', padding: '30px' }}>目前資料庫無任何資料</td>
              </tr>
            ) : (
              shifts.map((s) => (
                <tr key={s.id}>
                  <td style={{ color: '#777' }}>{s.date}</td>
                  <td style={{ fontWeight: '900', color: '#ff5722' }}>{s.name}</td>
                  <td>{s.shift}</td>
                  <td>{s.location}</td>
                  <td>{s.time}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDelete(s.id)} className="btn-danger" style={{ padding: '6px 14px', borderRadius: '8px' }}>刪除</button>
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
