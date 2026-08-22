'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function WeeklySchedule() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const [weekRange, setWeekRange] = useState({ start: '', end: '' });

  useEffect(() => {
    // 偵測台灣時間並計算當週(週一至週日)
    const twTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
    const curr = new Date(twTime);
    const first = curr.getDate() - curr.getDay() + 1; // 週一
    const start = new Date(curr.setDate(first)).toISOString().split('T')[0];
    const end = new Date(curr.setDate(first + 6)).toISOString().split('T')[0];
    setWeekRange({ start, end });

    const shiftsRef = ref(db, 'shifts');
    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
        setShifts(shiftsArray);
        setNames(Array.from(new Set(shiftsArray.map(s => s.name))));
      }
    });
  }, []);

  const filteredShifts = shifts.filter(s => 
    s.name === selectedName && s.date >= weekRange.start && s.date <= weekRange.end
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-orange-500 pl-2">
        個人週班表 ({weekRange.start} ~ {weekRange.end})
      </h1>
      <select className="mb-4 p-2 border rounded" value={selectedName} onChange={e => setSelectedName(e.target.value)}>
        <option value="">-- 選擇人員 --</option>
        {names.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
      <table className="w-full text-left border-collapse border">
        <thead>
          <tr className="bg-orange-100">
            <th className="p-2 border">日期</th>
            <th className="p-2 border">班別</th>
            <th className="p-2 border">地點</th>
            <th className="p-2 border">時間</th>
          </tr>
        </thead>
        <tbody>
          {filteredShifts.map((shift) => (
            <tr key={shift.id}>
              <td className="p-2 border">{shift.date}</td>
              <td className="p-2 border">{shift.shift}</td>
              <td className="p-2 border">{shift.location}</td>
              <td className="p-2 border">{shift.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

