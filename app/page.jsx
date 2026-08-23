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
    <div>
      <h1 className="page-title">今日班表 ({todayDate})</h1>
      
      {todayShifts.length === 0 ? (
        <p style={{ color: '#888', marginTop: '20px' }}>今日目前無排班資料，快去好好休息吧！☕</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>名稱</th>
                <th>班別</th>
                <th>地點</th>
                <th>時間</th>
              </tr>
            </thead>
            <tbody>
              {todayShifts.map((shift) => (
                <tr key={shift.id}>
                  <td style={{ fontWeight: '900', color: '#ff5722' }}>{shift.name}</td>
                  <td>{shift.shift}</td>
                  <td>{shift.location}</td>
                  <td>{shift.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
