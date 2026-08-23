'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function TodaySchedule() {
  const [todayShifts, setTodayShifts] = useState([]);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    setTodayDate(formattedDate);

    const shiftsRef = ref(db, 'shifts');
    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        const filtered = shiftsArray.filter(shift => shift.date === formattedDate);
        setTodayShifts(filtered);
      } else {
        setTodayShifts([]);
      }
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-orange-500 pl-2">今日班表 ({todayDate})</h1>
      
      {todayShifts.length === 0 ? (
        <p className="text-gray-500">今日目前無排班資料。</p>
      ) : (
        <table className="w-full text-left border-collapse border mt-4">
          <thead>
            <tr className="bg-orange-100">
              <th className="p-2 border">名稱</th>
              <th className="p-2 border">班別</th>
              <th className="p-2 border">地點</th>
              <th className="p-2 border">時間</th>
            </tr>
          </thead>
          <tbody>
            {todayShifts.map((shift) => (
              <tr key={shift.id} className="bg-white hover:bg-orange-50">
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
