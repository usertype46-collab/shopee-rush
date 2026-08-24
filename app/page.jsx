'use client';
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, get, set, remove, push, update } from 'firebase/database';
import { Calendar, Users, Database, Upload, Trash2, Plus, Edit3, Save, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

export default function ShopeeScheduleApp() {
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // 篩選與編輯狀態
  const [selectedStaff, setSelectedStaff] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 模型設定
  const [modelCode, setModelCode] = useState('meta/llama-3.2-90b-vision-instruct');
  const [customModels, setCustomModels] = useState([
    { code: 'meta/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', function: '高精度多模態圖像解析' },
    { code: 'nvidia/neva-22b', name: 'Neva 22B', function: '快速表格與文字辨識' }
  ]);
  const [newModelCodeInput, setNewModelCodeInput] = useState('');

  // 取得台灣當前日期 (YYYY-MM-DD)
  const getTaiwanToday = () => {
    const now = new Date();
    const taiwanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
    return taiwanTime.toISOString().split('T')[0];
  };

  const [currentDate, setCurrentDate] = useState(getTaiwanToday());

  // 載入 Firebase 資料
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const dbRef = ref(db, 'schedules');
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setSchedules(list);
        
        const names = [...new Set(list.map(item => item.name))].filter(Boolean);
        setStaffList(names);
        if (names.length > 0 && !selectedStaff) setSelectedStaff(names[0]);
      } else {
        setSchedules([]);
        setStaffList([]);
      }
    } catch (err) {
      console.error("載入資料失敗", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 圖片轉 Base64 並上傳解析
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/parse-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: reader.result, modelCode })
        });
        const result = await res.json();
        if (result.success && result.data) {
          for (const item of result.data) {
            const newRef = push(ref(db, 'schedules'));
            await set(newRef, item);
          }
          alert('✨ 班表圖片成功透過 Nvidia 模型轉換並同步至 Firebase！');
          fetchSchedules();
        } else {
          alert('解析失敗: ' + (result.error || '未知錯誤'));
        }
      } catch (err) {
        alert('上傳發生錯誤: ' + err.message);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // 新增自訂模型代碼
  const handleAddModelCode = () => {
    if (!newModelCodeInput) return;
    const inferredName = newModelCodeInput.split('/').pop() || 'Custom Model';
    const newModel = {
      code: newModelCodeInput,
      name: inferredName,
      function: '自定義雲端AI模型代碼'
    };
    setCustomModels([...customModels, newModel]);
    setModelCode(newModelCodeInput);
    setNewModelCodeInput('');
  };

  // 清除全部資料庫
  const handleClearDatabase = async () => {
    if (confirm('⚠️ 警告：確定要清空資料庫所有班表資料嗎？此動作無法復原！')) {
      await set(ref(db, 'schedules'), null);
      setSchedules([]);
      setStaffList([]);
      alert('資料庫已全部清空。');
    }
  };

  // 儲存修改
  const handleSaveEdit = async (id) => {
    await update(ref(db, `schedules/${id}`), editForm);
    setEditingId(null);
    fetchSchedules();
  };

  // 刪除單筆
  const handleDelete = async (id) => {
    if (confirm('確定要刪除這筆班表紀錄嗎？')) {
      await remove(ref(db, `schedules/${id}`));
      fetchSchedules();
    }
  };

  // 計算本週範圍
  const getWeekRange = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  const todaySchedules = schedules.filter(item => item.date === currentDate);
  const weekRange = getWeekRange(currentDate);
  const weeklySchedules = schedules.filter(item => 
    item.name === selectedStaff && item.date >= weekRange.start && item.date <= weekRange.end
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* 頂部導覽列 */}
      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">蝦皮門市智慧班表管理系統</h1>
              <p className="text-xs text-orange-100">Shopee Store Schedule & AI Management Hub</p>
            </div>
          </div>
          <div className="flex bg-orange-700/60 p-1.5 rounded-xl backdrop-blur-md space-x-1 shadow-inner">
            <button 
              onClick={() => setActiveTab('today')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'today' ? 'bg-white text-orange-600 shadow-md' : 'text-white hover:bg-white/10'}`}>
              <Calendar size={17} /> 今日班表
            </button>
            <button 
              onClick={() => setActiveTab('weekly')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'weekly' ? 'bg-white text-orange-600 shadow-md' : 'text-white hover:bg-white/10'}`}>
              <Users size={17} /> 個人週班表
            </button>
            <button 
              onClick={() => setActiveTab('db')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'db' ? 'bg-white text-orange-600 shadow-md' : 'text-white hover:bg-white/10'}`}>
              <Database size={17} /> 資料庫管理
            </button>
          </div>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        {loading && (
          <div className="flex flex-col justify-center items-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm mb-6">
            <RefreshCw className="animate-spin text-orange-600 w-10 h-10 mb-3" />
            <span className="text-base font-semibold text-slate-600">AI 雲端運算與資料庫同步中，請稍候...</span>
          </div>
        )}

        {/* 1. 今日班表頁面 */}
        {!loading && activeTab === 'today' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <span>📅 今日即時班表</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">自動偵測台灣當天時間，呈現代班人員、班別與地點資訊</p>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-sm font-semibold text-slate-600">檢視日期：</span>
                <input 
                  type="date" 
                  value={currentDate} 
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 uppercase text-xs tracking-wider border-b border-slate-200">
                      <th className="p-4 font-semibold">日期</th>
                      <th className="p-4 font-semibold">門市人員</th>
                      <th className="p-4 font-semibold">班別類型</th>
                      <th className="p-4 font-semibold">排班地點</th>
                      <th className="p-4 font-semibold">排班時間</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {todaySchedules.length > 0 ? (
                      todaySchedules.map((item, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/40 transition-colors">
                          <td className="p-4 text-slate-600 font-medium">{item.date}</td>
                          <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                              {item.name ? item.name.slice(0, 1) : '員'}
                            </div>
                            {item.name}
                          </td>
                          <td className="p-4">
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {item.shiftType}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 font-medium">{item.location}</td>
                          <td className="p-4 text-slate-600 font-mono">{item.time}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-16 text-slate-400">
                          <p className="text-base font-medium">今日尚無排班資料</p>
                          <p className="text-xs text-slate-400 mt-1">請至「資料庫管理」上傳班表圖片以自動解析生成資料</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. 個人週班表頁面 */}
        {!loading && activeTab === 'weekly' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">👤 個人週班表總覽</h2>
                <p className="text-sm text-slate-500 mt-1">本週區間：<span className="font-semibold text-orange-600">{weekRange.start} ~ {weekRange.end}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-600">選擇人員：</label>
                <select 
                  value={selectedStaff} 
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm">
                  {staffList.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 uppercase text-xs tracking-wider border-b border-slate-200">
                      <th className="p-4 font-semibold">日期</th>
                      <th className="p-4 font-semibold">姓名</th>
                      <th className="p-4 font-semibold">班別</th>
                      <th className="p-4 font-semibold">地點 / 狀態</th>
                      <th className="p-4 font-semibold">時間</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {weeklySchedules.length > 0 ? (
                      weeklySchedules.map((item, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/40 transition-colors">
                          <td className="p-4 text-slate-600 font-medium">{item.date}</td>
                          <td className="p-4 font-bold text-slate-900">{item.name}</td>
                          <td className="p-4">
                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {item.shiftType}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 font-medium">{item.location}</td>
                          <td className="p-4 text-slate-600 font-mono">{item.time}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-16 text-slate-400">
                          該人員在本週無排班或皆為休假記錄。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. 資料庫與模型管理頁面 */}
        {!loading && activeTab === 'db' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">⚙️ 資料庫與 AI 模型管理中心</h2>
                <p className="text-sm text-slate-500 mt-1">管理班表資料庫、上傳圖片自動解析，或擴充 Nvidia 雲端運算模型代碼</p>
              </div>
              <button 
                onClick={handleClearDatabase} 
                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-red-200 shadow-sm">
                <Trash2 size={17} /> 清除資料庫所有資料
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 圖片上傳區 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                    <Upload className="text-orange-600" size={20} /> 上傳班表圖片轉換 Excel / 資料庫
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    支援上傳如 `17086.jpg` / `17072.jpg` 等排班圖片。系統將透過後端 Nvidia 雲端 AI 模型自動擷取並寫入 Firebase。
                  </p>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors bg-slate-50">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 模型代碼管理區 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                    <Cpu className="text-orange-600" size={20} /> Nvidia 雲端模型解析設定
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    可自行新增並切換模型代碼，系統會自動解析模型代碼名稱及對應功能。
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">當前使用模型：</label>
                      <select 
                        value={modelCode} 
                        onChange={(e) => setModelCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-500">
                        {customModels.map((m, idx) => (
                          <option key={idx} value={m.code}>{m.name} — {m.function}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="新增模型代碼 (例如 nvidia/Llama-3-...)" 
                        value={newModelCodeInput}
                        onChange={(e) => setNewModelCodeInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500"
                      />
                      <button onClick={handleAddModelCode} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1">
                        <Plus size={16} /> 新增
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 資料庫逐筆維護表格 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle className="text-emerald-600" size={20} /> 資料庫逐筆檢視與編輯管理
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 uppercase text-xs tracking-wider border-b border-slate-200">
                      <th className="p-4 font-semibold">日期</th>
                      <th className="p-4 font-semibold">姓名</th>
                      <th className="p-4 font-semibold">班別</th>
                      <th className="p-4 font-semibold">地點</th>
                      <th className="p-4 font-semibold">時間</th>
                      <th className="p-4 font-semibold text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {schedules.length > 0 ? (
                      schedules.map((item) => (
                        <tr key={item.id} className="hover:bg-orange-50/40 transition-colors">
                          {editingId === item.id ? (
                            <>
                              <td className="p-3"><input type="date" value={editForm.date || ''} onChange={e => setEditForm({...editForm, date: e.target.value})} className="border border-slate-300 p-1.5 rounded-lg w-full text-xs" /></td>
                              <td className="p-3"><input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border border-slate-300 p-1.5 rounded-lg w-full text-xs" /></td>
                              <td className="p-3"><input type="text" value={editForm.shiftType || ''} onChange={e => setEditForm({...editForm, shiftType: e.target.value})} className="border border-slate-300 p-1.5 rounded-lg w-full text-xs" /></td>
                              <td className="p-3"><input type="text" value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} className="border border-slate-300 p-1.5 rounded-lg w-full text-xs" /></td>
                              <td className="p-3"><input type="text" value={editForm.time || ''} onChange={e => setEditForm({...editForm, time: e.target.value})} className="border border-slate-300 p-1.5 rounded-lg w-full text-xs" /></td>
                              <td className="p-3 text-center space-x-1">
                                <button onClick={() => handleSaveEdit(item.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition"><Save size={15} /></button>
                                <button onClick={() => setEditingId(null)} className="bg-slate-400 hover:bg-slate-500 text-white p-2 rounded-lg transition">取消</button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-4 text-slate-600 font-medium">{item.date}</td>
                              <td className="p-4 font-bold text-slate-900">{item.name}</td>
                              <td className="p-4"><span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-xs font-semibold">{item.shiftType}</span></td>
                              <td className="p-4 text-slate-700 font-medium">{item.location}</td>
                              <td className="p-4 text-slate-600 font-mono">{item.time}</td>
                              <td className="p-4 text-center space-x-3">
                                <button onClick={() => { setEditingId(item.id); setEditForm(item); }} className="text-blue-600 hover:text-blue-800 transition"><Edit3 size={18} /></button>
                                <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:text-rose-800 transition"><Trash2 size={18} /></button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-16 text-slate-400">
                          目前資料庫中無任何班表資料。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 頁尾 */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400">
        蝦皮門市智慧班表系統 © 2026 — Powered by Next.js, Firebase & Nvidia Cloud Vision AI
      </footer>
    </div>
  );
}
