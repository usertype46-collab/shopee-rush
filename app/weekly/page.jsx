'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function WeeklySchedule() {
  const [shifts, setShifts] = useState([]);
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [weekRange, setWeekRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const today = new Date();
    const first = today.getDate() - today.getDay(); 
    const last = first + 6; 

    const startDate = new Date(today.setDate(first));
    const endDate = new Date(today.setDate(last));

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    setWeekRange({ start: startStr, end: endStr });

    const shiftsRef = ref(db, 'shifts');
    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        
        const thisWeekShifts = shiftsArray.filter(shift => shift.date >= startStr && shift.date <= endStr);
        thisWeekShifts.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setShifts(thisWeekShifts);
        setNames(Array.from(new Set(shiftsArray.map(s => s.name))));
      } else {
        setShifts([]);
        setNames([]);
      }
    });
  }, []);

  const filteredShifts = selectedName ? shifts.filter(s => s.name === selectedName) : shifts;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-2">
        本週班表 ({weekRange.start} ~ {weekRange.end})
      </h1>
      
      <div className="mb-4">
        <select 
          className="p-2 border rounded shadow-sm bg-white" 
          value={selectedName} 
          onChange={e => setSelectedName(e.target.value)}
        >
          <option value="">-- 查看所有人 --</option>
          {names.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>

      {filteredShifts.length === 0 ? (
        <p className="text-gray-500">本週目前無排班資料。</p>
      ) : (
        <table className="w-full text-left border-collapse border mt-4">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2 border">日期</th>
              <th className="p-2 border">名稱</th>
              <th className="p-2 border">班別</th>
              <th className="p-2 border">地點</th>
              <th className="p-2 border">時間</th>
            </tr>
          </thead>
          <tbody>
            {filteredShifts.map((shift) => (
              <tr key={shift.id} className="bg-white hover:bg-blue-50">
                <td className="p-2 border">{shift.date}</td>
                <td className="p-2 border font-bold">{shift.name}</td>
                <td className="p-2 border">{shift.shift}</td>
                <td className="p-2 border">{shift.location}</td>
                <td className="p-2 border">{shift.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
