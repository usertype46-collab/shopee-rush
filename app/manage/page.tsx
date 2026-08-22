'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, set, update, remove } from 'firebase/database';

export default function ManageSchedule() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState('');
  
  // 2026 AI 模型設定
  const [provider, setProvider] = useState('GEMINI');
  const [modelCode, setModelCode] = useState('gemini-1.5-pro-vision');
  
  // 逐筆編輯狀態
  const [editId, setEditId] = useState('');
  const [editForm, setEditForm] = useState<any>({});
  
  // 新增狀態
  const [newForm, setNewForm] = useState({ date: '', name: '', shift: '', location: '', time: '' });

  useEffect(() => {
    const shiftsRef = ref(db, 'shifts');
    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
        setShifts(shiftsArray);
        setNames(Array.from(new Set(shiftsArray.map(s => s.name))));
      } else {
        setShifts([]);
        setNames([]);
      }
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    alert(`正在呼叫後端使用 ${provider} 模型 (${modelCode}) 解析班表...`);
    
    // 呼叫後端 API
    const res = await fetch('/api/parse-image', {
      method: 'POST',
      body: JSON.stringify({ imageBase64: 'mock_base64', modelName: modelCode, provider }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await res.json();
    if (result.success) {
      result.data.forEach((item: any) => {
        const newRef = push(ref(db, 'shifts'));
        set(newRef, { date: item.date, name: item.name, shift: item.shift, location: item.location, time: item.time });
      });
      alert('圖片解析成功並匯入資料庫！');
    }
  };

  const handleAdd = () => {
    if (!newForm.date || !newForm.name) return alert('日期與名稱必填');
    const newRef = push(ref(db, 'shifts'));
    set(newRef, newForm);
    setNewForm({ date: '', name: '', shift: '', location: '', time: '' });
  };

  const handleSaveEdit = (id: string) => {
    update(ref(db, `shifts/${id}`), editForm);
    setEditId('');
  };

  const handleDelete = (id: string) => {
    if (confirm('確定刪除此筆資料？')) remove(ref(db, `shifts/${id}`));
  };

  const handleClearAll = () => {
    if (confirm('警告：確定清除資料庫「所有資料」？此動作無法復原！')) remove(ref(db, 'shifts'));
  };

  const filteredShifts = selectedName ? shifts.filter(s => s.name === selectedName) : shifts;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-orange-500 pl-2">資料庫管理</h1>
      
      {/* 模型與解析區 */}
      <div className="bg-gray-100 p-4 rounded mb-6 border">
        <h2 className="font-bold mb-2">上傳班表圖 (支援 2026 AI 轉換)</h2>
        <div className="flex gap-2 mb-2">
          <select className="p-2 border" value={provider} onChange={e => setProvider(e.target.value)}>
            <option value="GEMINI">Gemini 模型</option>
            <option value="NVIDIA">NVIDIA 雲端</option>
          </select>
          <input 
            type="text" 
            className="p-2 border flex-grow" 
            placeholder="自訂模型代碼" 
            value={modelCode} 
            onChange={e => setModelCode(e.target.value)} 
          />
        </div>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="p-2 border bg-white" />
      </div>

      <div className="flex justify-between items-center mb-2">
        <select className="p-2 border rounded" value={selectedName} onChange={e => setSelectedName(e.target.value)}>
          <option value="">-- 查看所有人 --</option>
          {names.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
        <button onClick={handleClearAll} className="bg-red-500 text-white px-4 py-2 rounded">清除所有資料</button>
      </div>

      <table className="w-full text-left border-collapse border">
        <thead>
          <tr className="bg-orange-100">
            <th className="p-2 border">日期</th>
            <th className="p-2 border">名稱</th>
            <th className="p-2 border">班別</th>
            <th className="p-2 border">地點</th>
            <th className="p-2 border">時間</th>
            <th className="p-2 border">操作</th>
          </tr>
        </thead>
        <tbody>
          {/* 新增列 */}
          <tr className="bg-green-50">
            <td className="p-1 border"><input type="date" className="w-full p-1" value={newForm.date} onChange={e=>setNewForm({...newForm, date: e.target.value})} /></td>
            <td className="p-1 border"><input type="text" placeholder="名稱" className="w-full p-1" value={newForm.name} onChange={e=>setNewForm({...newForm, name: e.target.value})} /></td>
            <td className="p-1 border"><input type="text" placeholder="休假/班別" className="w-full p-1" value={newForm.shift} onChange={e=>setNewForm({...newForm, shift: e.target.value})} /></td>
            <td className="p-1 border"><input type="text" placeholder="地點" className="w-full p-1" value={newForm.location} onChange={e=>setNewForm({...newForm, location: e.target.value})} /></td>
            <td className="p-1 border"><input type="text" placeholder="時間" className="w-full p-1" value={newForm.time} onChange={e=>setNewForm({...newForm, time: e.target.value})} /></td>
            <td className="p-1 border"><button onClick={handleAdd} className="bg-green-500 text-white px-2 py-1 rounded w-full">新增</button></td>
          </tr>
          
          {/* 資料列 */}
          {filteredShifts.map((shift) => (
            <tr key={shift.id}>
              {editId === shift.id ? (
                <>
                  <td className="p-1 border"><input className="w-full border p-1" value={editForm.date} onChange={e=>setEditForm({...editForm, date: e.target.value})} /></td>
                  <td className="p-1 border"><input className="w-full border p-1" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})} /></td>
                  <td className="p-1 border"><input className="w-full border p-1" value={editForm.shift} onChange={e=>setEditForm({...editForm, shift: e.target.value})} /></td>
                  <td className="p-1 border"><input className="w-full border p-1" value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} /></td>
                  <td className="p-1 border"><input className="w-full border p-1" value={editForm.time} onChange={e=>setEditForm({...editForm, time: e.target.value})} /></td>
                  <td className="p-1 border flex gap-1">
                    <button onClick={() => handleSaveEdit(shift.id)} className="bg-blue-500 text-white px-2 py-1 rounded">儲存</button>
                    <button onClick={() => setEditId('')} className="bg-gray-400 text-white px-2 py-1 rounded">取消</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2 border">{shift.date}</td>
                  <td className="p-2 border">{shift.name}</td>
                  <td className="p-2 border">{shift.shift}</td>
                  <td className="p-2 border">{shift.location}</td>
                  <td className="p-2 border">{shift.time}</td>
                  <td className="p-2 border flex gap-2">
                    <button onClick={() => { setEditId(shift.id); setEditForm(shift); }} className="text-blue-500">修改</button>
                    <button onClick={() => handleDelete(shift.id)} className="text-red-500">刪除</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

