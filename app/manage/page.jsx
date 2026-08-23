'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, remove } from 'firebase/database';

export default function Manage() {
  const [shifts, setShifts] = useState([]);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [shift, setShift] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');

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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!date || !name) return alert('請至少填寫日期與名稱');
    await push(ref(db, 'shifts'), { date, name, shift, location, time });
    setDate(''); setName(''); setShift(''); setLocation(''); setTime('');
  };

  const handleDeleteAll = async () => {
    if (confirm('確定要清除所有資料嗎？這無法復原喔！')) {
      await remove(ref(db, 'shifts'));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('確定刪除此筆資料？')) {
      await remove(ref(db, `shifts/${id}`));
    }
  };

  return (
    <div>
      <h1 className="page-title">資料庫管理</h1>

      {/* AI 上傳區塊美化 */}
      <div className="filter-bar">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#d84315', fontWeight: '900' }}>
          ✨ 上傳班表圖 (支援 AI 自動轉換)
        </h2>
        <div className="flex-row" style={{ marginBottom: '15px' }}>
          <select className="form-control" style={{ width: 'auto' }}>
            <option value="gemini">Gemini 模型</option>
            <option value="openai">OpenAI 模型</option>
          </select>
          <input type="text" className="form-control" defaultValue="gemini-1.5-pro-vision" style={{ flex: 1, minWidth: '200px' }} />
        </div>
        <div className="flex-row">
          <input type="file" className="form-control" style={{ flex: 1, background: '#fff' }} />
          <button className="btn" onClick={() => alert('請在此接回您的上傳解析邏輯')}>開始解析圖片</button>
        </div>
      </div>

      {/* 手動新增與清除工具列 */}
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '15px', marginTop: '30px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#333', fontWeight: '900', borderLeft: '4px solid #ff5722', paddingLeft: '10px' }}>手動新增排班</h2>
        <button className="btn-danger" onClick={handleDeleteAll} style={{ borderRadius: '8px' }}>🗑️ 清除所有資料</button>
      </div>

      <form onSubmit={handleAdd} className="flex-row filter-bar" style={{ background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, minWidth: '130px' }} />
        <input type="text" className="form-control" placeholder="名稱" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1, minWidth: '90px' }} />
        <input type="text" className="form-control" placeholder="班別" value={shift} onChange={e => setShift(e.target.value)} style={{ flex: 1, minWidth: '80px' }} />
        <input type="text" className="form-control" placeholder="地點" value={location} onChange={e => setLocation(e.target.value)} style={{ flex: 1, minWidth: '80px' }} />
        <input type="text" className="form-control" placeholder="時間" value={time} onChange={e => setTime(e.target.value)} style={{ flex: 1, minWidth: '100px' }} />
        <button type="submit" className="btn" style={{ minWidth: '100px' }}>+ 新增</button>
      </form>

      {/* 資料表格 */}
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>日期</th>
              <th>名稱</th>
              <th>班別</th>
              <th>地點</th>
              <th>時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s) => (
              <tr key={s.id}>
                <td style={{ color: '#777' }}>{s.date}</td>
                <td style={{ fontWeight: '900', color: '#ff5722' }}>{s.name}</td>
                <td>{s.shift}</td>
                <td>{s.location}</td>
                <td>{s.time}</td>
                <td>
                  <button onClick={() => handleDelete(s.id)} className="btn-danger" style={{ padding: '6px 12px', borderRadius: '8px' }}>刪除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
