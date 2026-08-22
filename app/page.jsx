'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function TodaySchedule() {
  const [todayShifts, setTodayShifts] = useState<any[]>([]);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    // 偵測台灣當天時間 (Asia/Taipei)
    const twTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
    const twDateObj = new Date(twTime);
    const formattedDate = `${twDateObj.getFullYear()}-${String(twDateObj.getMonth() + 1).padStart(2, '0')}-${String(twDateObj.getDate()).padStart(2, '0')}`;
    setTodayDate(formattedDate);

    const shiftsRef = ref(db, 'shifts');
    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.entries(data).map(([id, val]: any) => ({ id, ...val }));
        setTodayShifts(shiftsArray.filter(shift => shift.date === formattedDate));
      } else {
        setTodayShifts([]);
      }
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 border-l-4 border-orange-500 pl-2">今日班表 ({todayDate})</h1>
      <table className="w-full text-left border-collapse border">
        <thead>
          <tr className="bg-orange-100">
            <th className="p-2 border">日期</th>
            <th className="p-2 border">名稱</th>
            <th className="p-2 border">班別</th>
            <th className="p-2 border">地點</th>
            <th className="p-2 border">時間</th>
          </tr>
        </thead>
        <tbody>
          {todayShifts.map((shift) => (
            <tr key={shift.id} className="hover:bg-gray-50">
              <td className="p-2 border">{shift.date}</td>
              <td className="p-2 border">{shift.name}</td>
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

