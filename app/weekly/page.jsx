'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function WeeklySchedule() {
  const [weeklyShifts, setWeeklyShifts] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const shiftsRef = ref(db, 'shifts');
    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        shiftsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
        setWeeklyShifts(shiftsArray);
        
        // 抓出所有不重複的人名供選單使用
        const uniquePeople = [...new Set(shiftsArray.map(s => s.name))].filter(Boolean);
        setPeople(uniquePeople);
      } else {
        setWeeklyShifts([]);
        setPeople([]);
      }
    });
  }, []);

  const filteredShifts = selectedPerson 
    ? weeklyShifts.filter(shift => shift.name === selectedPerson)
    : weeklyShifts;

  return (
    <div>
      <h1 className="page-title">本週班表</h1>
      
      {/* 篩選工具列 */}
      <div className="filter-bar flex-row">
        <label style={{ fontWeight: 'bold', color: '#d84315' }}>篩選人員：</label>
        <select 
          className="form-control" 
          value={selectedPerson} 
          onChange={(e) => setSelectedPerson(e.target.value)}
        >
          <option value="">-- 查看所有人 --</option>
          {people.map(person => (
            <option key={person} value={person}>{person}</option>
          ))}
        </select>
      </div>

      {filteredShifts.length === 0 ? (
        <p style={{ color: '#888', marginTop: '20px' }}>本週目前無排班資料。</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>名稱</th>
                <th>班別</th>
                <th>地點</th>
                <th>時間</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift) => (
                <tr key={shift.id}>
                  <td style={{ color: '#777' }}>{shift.date}</td>
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
