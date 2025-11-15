import React, { useState, useEffect } from 'react';
import {
  Plus, Minus, Calendar, Tag, CreditCard, Camera, Edit2, Trash2,
  Search, Filter, DollarSign, TrendingUp, PieChart, BarChart3,
  Users, Repeat, AlertCircle, Settings, ChevronRight, X, Check,
  Download, Upload, FileText, Sparkles, Menu
} from 'lucide-react';

const FinanceManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [recurringBills, setRecurringBills] = useState([]);
  const [debts, setDebts] = useState([]);
  const [notebooks, setNotebooks] = useState([{ id: 'default', name: '個人帳本', active: true }]);

  const [view, setView] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedNotebook, setSelectedNotebook] = useState('default');
  const [dateFilter, setDateFilter] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    paymentMethod: 'cash',
    photo: null
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '📦',
    color: '#6b7280',
    type: 'expense'
  });

  useEffect(() => {
    loadData();
    initializeDefaultCategories();
  }, []);

  const loadData = async () => {
    try {
      const txns = await window.storage.get('transactions');
      const cats = await window.storage.get('categories');
      const bgt = await window.storage.get('budgets');
      const bills = await window.storage.get('recurringBills');
      const dbt = await window.storage.get('debts');
      const books = await window.storage.get('notebooks');

      if (txns && txns.value) setTransactions(JSON.parse(txns.value));
      if (cats && cats.value) setCategories(JSON.parse(cats.value));
      if (bgt && bgt.value) setBudgets(JSON.parse(bgt.value));
      if (bills && bills.value) setRecurringBills(JSON.parse(bills.value));
      if (dbt && dbt.value) setDebts(JSON.parse(dbt.value));
      if (books && books.value) setNotebooks(JSON.parse(books.value));
    } catch (error) {
      console.log('初次使用，載入預設設定');
    }
  };

  const initializeDefaultCategories = async () => {
    try {
      const existing = await window.storage.get('categories');
      if (!existing || !existing.value) {
        const defaultCats = [
          { id: 'food', name: '飲食', icon: '🍜', color: '#ef4444', type: 'expense' },
          { id: 'transport', name: '交通', icon: '🚗', color: '#3b82f6', type: 'expense' },
          { id: 'entertainment', name: '娛樂', icon: '🎮', color: '#8b5cf6', type: 'expense' },
          { id: 'shopping', name: '購物', icon: '🛍️', color: '#ec4899', type: 'expense' },
          { id: 'medical', name: '醫療', icon: '🏥', color: '#10b981', type: 'expense' },
          { id: 'education', name: '教育', icon: '📚', color: '#f59e0b', type: 'expense' },
          { id: 'housing', name: '居住', icon: '🏠', color: '#6366f1', type: 'expense' },
          { id: 'salary', name: '薪資', icon: '💰', color: '#10b981', type: 'income' },
          { id: 'investment', name: '投資', icon: '📈', color: '#06b6d4', type: 'income' },
          { id: 'other', name: '其他', icon: '📦', color: '#6b7280', type: 'both' }
        ];
        setCategories(defaultCats);
        await window.storage.set('categories', JSON.stringify(defaultCats));
      }
    } catch (error) {
      console.error('初始化類別失敗', error);
    }
  };

  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('保存失敗', error);
    }
  };

  const handleTransaction = async () => {
    if (!formData.amount || !formData.category) {
      alert('請填寫金額和類別');
      return;
    }

    const transaction = {
      id: editingItem ? editingItem.id : Date.now(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      note: formData.note,
      paymentMethod: formData.paymentMethod,
      photo: formData.photo,
      notebook: selectedNotebook,
      timestamp: editingItem ? editingItem.timestamp : Date.now()
    };

    let updated;
    if (editingItem) {
      updated = transactions.map(t => t.id === editingItem.id ? transaction : t);
    } else {
      updated = [transaction, ...transactions];
    }

    setTransactions(updated);
    await saveData('transactions', updated);
    closeModal();
  };

  const deleteTransaction = async (id) => {
    if (!confirm('確定要刪除這筆記錄嗎？')) return;
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await saveData('transactions', updated);
  };

  const deleteCategory = async (id) => {
    const hasTransactions = transactions.some(t => t.category === id);
    if (hasTransactions) {
      alert('此類別有交易記錄，無法刪除');
      return;
    }
    if (!confirm('確定要刪除此類別嗎？')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await saveData('categories', updated);
  };

  const handleCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('請輸入類別名稱');
      return;
    }

    const category = {
      id: editingItem ? editingItem.id : `custom_${Date.now()}`,
      name: categoryForm.name.trim(),
      icon: categoryForm.icon,
      color: categoryForm.color,
      type: categoryForm.type
    };

    let updated;
    if (editingItem) {
      updated = categories.map(c => c.id === editingItem.id ? category : c);
    } else {
      updated = [...categories, category];
    }

    setCategories(updated);
    await saveData('categories', updated);
    closeModal();
  };

  const setBudget = async (category, amount) => {
    const newBudgets = { ...budgets };
    newBudgets[category] = parseFloat(amount);
    setBudgets(newBudgets);
    await saveData('budgets', newBudgets);
  };

  const openModal = (type, item) => {
    setModalType(type);
    setEditingItem(item || null);

    if (type === 'category') {
      if (item) {
        setCategoryForm({
          name: item.name,
          icon: item.icon,
          color: item.color,
          type: item.type
        });
      } else {
        setCategoryForm({
          name: '',
          icon: '📦',
          color: '#6b7280',
          type: 'expense'
        });
      }
    } else {
      if (item) {
        setFormData({
          type: item.type,
          amount: item.amount,
          category: item.category,
          date: item.date,
          note: item.note,
          paymentMethod: item.paymentMethod,
          photo: item.photo
        });
      } else {
        setFormData({
          type: 'expense',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          note: '',
          paymentMethod: 'cash',
          photo: null
        });
      }
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const getStats = () => {
    const filtered = filterTransactions();
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const categoryStats = {};
    filtered.forEach(t => {
      if (t.type === 'expense') {
        categoryStats[t.category] = (categoryStats[t.category] || 0) + t.amount;
      }
    });

    return { income, expense, balance: income - expense, categoryStats };
  };

  const filterTransactions = () => {
    let filtered = transactions.filter(t => t.notebook === selectedNotebook);

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    filtered = filtered.filter(t => {
      const txDate = new Date(t.date);
      if (dateFilter === 'today') return txDate >= startOfDay;
      if (dateFilter === 'week') return txDate >= startOfWeek;
      if (dateFilter === 'month') return txDate >= startOfMonth;
      return true;
    });

    if (searchQuery) {
      filtered = filtered.filter(t => {
        const cat = categories.find(c => c.id === t.category);
        return t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (cat && cat.name.includes(searchQuery));
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const stats = getStats();
  const filtered = filterTransactions();

  const renderDashboard = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-emerald-700 bg-emerald-950 bg-opacity-20 p-4">
          <div className="text-xs text-gray-500 mb-1">totalIncome</div>
          <div className="text-2xl font-bold text-emerald-400">${stats.income.toFixed(0)}</div>
          <div className="text-xs text-gray-600">// 本期收入</div>
        </div>

        <div className="border border-red-700 bg-red-950 bg-opacity-20 p-4">
          <div className="text-xs text-gray-500 mb-1">totalExpense</div>
          <div className="text-2xl font-bold text-red-400">${stats.expense.toFixed(0)}</div>
          <div className="text-xs text-gray-600">// 本期支出</div>
        </div>

        <div className="border border-blue-700 bg-blue-950 bg-opacity-20 p-4">
          <div className="text-xs text-gray-500 mb-1">balance</div>
          <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            ${stats.balance.toFixed(0)}
          </div>
          <div className="text-xs text-gray-600">// 本期結餘</div>
        </div>
      </div>

      <div className="border border-gray-700 bg-gray-950 p-4">
        <div className="text-sm mb-4 text-gray-300">categoryExpense.chart()</div>
        {Object.entries(stats.categoryStats).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(stats.categoryStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([catId, amount]) => {
                const cat = categories.find(c => c.id === catId);
                const percentage = (amount / stats.expense) * 100;
                return (
                  <div key={catId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">
                        {cat ? cat.icon : '📦'} {cat ? cat.name : catId}
                      </span>
                      <span className="text-gray-500">
                        <span className="text-emerald-400">${amount.toFixed(0)}</span>
                        <span className="ml-2">({percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: cat ? cat.color : '#6b7280'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">暫無支出數據</div>
        )}
      </div>

      {Object.keys(budgets).length > 0 && (
        <div className="border border-yellow-700 bg-yellow-950 bg-opacity-20 p-4">
          <div className="text-sm mb-3 text-yellow-400">budgetAlerts()</div>
          <div className="space-y-2">
            {Object.entries(budgets).map(([catId, budget]) => {
              const spent = stats.categoryStats[catId] || 0;
              const percentage = (spent / budget) * 100;
              const cat = categories.find(c => c.id === catId);
              return (
                <div key={catId} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">{cat ? cat.icon : '📦'} {cat ? cat.name : catId}</span>
                    <span className={percentage > 80 ? 'text-red-400' : 'text-gray-500'}>
                      ${spent.toFixed(0)} / ${budget}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentage > 100 ? 'bg-red-500' :
                        percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-600" size={16} />
          <input
            type="text"
            placeholder="搜尋交易…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">全部</option>
          <option value="today">今天</option>
          <option value="week">本週</option>
          <option value="month">本月</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="border border-gray-700 bg-gray-950 p-8 text-center text-gray-600">
            暫無交易記錄
          </div>
        ) : (
          filtered.map(tx => {
            const cat = categories.find(c => c.id === tx.category);
            return (
              <div key={tx.id} className="border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{cat ? cat.icon : '📦'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-200 font-medium">{cat ? cat.name : tx.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          tx.type === 'income' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'
                        }`}>
                          {tx.type === 'income' ? '收入' : '支出'}
                        </span>
                      </div>
                      {tx.note && <div className="text-sm text-gray-500 mb-1">{tx.note}</div>}
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod === 'cash' ? '💵 現金' : tx.paymentMethod === 'card' ? '💳 信用卡' : '🏦 轉帳'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount}
                    </span>
                    <button
                      onClick={() => openModal('transaction', tx)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderBudgets = () => (
    <div className="space-y-4">
      <div className="border border-gray-700 bg-gray-950 p-4">
        <h3 className="text-gray-300 mb-4">設定類別預算</h3>
        <div className="space-y-3">
          {categories.filter(c => c.type === 'expense' || c.type === 'both').map(cat => (
            <div key={cat.id} className="flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-gray-300 flex-1">{cat.name}</span>
              <input
                type="number"
                placeholder="預算金額"
                value={budgets[cat.id] || ''}
                onChange={(e) => setBudget(cat.id, e.target.value)}
                className="w-32 px-3 py-1 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4">
      <div className="border border-gray-700 bg-gray-950 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-300">類別管理</h3>
          <button
            onClick={() => openModal('category', null)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            <Plus size={14} />
            新增類別
          </button>
        </div>
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 p-2 bg-gray-900 rounded hover:bg-gray-800">
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-gray-300 flex-1">{cat.name}</span>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: cat.color }}></div>
              <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">
                {cat.type === 'income' ? '收入' : cat.type === 'expense' ? '支出' : '通用'}
              </span>
              <button
                onClick={() => openModal('category', cat)}
                className="text-blue-400 hover:text-blue-300 p-1"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-700 bg-gray-950 p-4">
        <h3 className="text-gray-300 mb-4">帳本管理</h3>
        <div className="space-y-2">
          {notebooks.map(book => (
            <div key={book.id} className="flex items-center gap-3 p-2 bg-gray-900 rounded">
              <span className="text-gray-300 flex-1">{book.name}</span>
              {book.active && <span className="text-xs text-green-400 px-2 py-1 bg-green-900 rounded">使用中</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono">
      <div className="max-w-6xl mx-auto p-4">
        <div className="border border-gray-700 bg-gray-950 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                <span className="text-purple-400">class</span> <span className="text-yellow-400">FinanceManager</span>
              </h1>
              <p className="text-xs text-gray-600">// Professional expense tracking system</p>
            </div>
            <button
              onClick={() => openModal('transaction', null)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
            >
              <Plus size={16} />
              新增交易
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
              view === 'dashboard'
                ? 'border border-blue-500 bg-blue-950 bg-opacity-30 text-blue-400'
                : 'border border-gray-700 bg-gray-950 text-gray-500 hover:text-gray-400'
            }`}
          >
            <BarChart3 size={16} />
            dashboard()
          </button>
          <button
            onClick={() => setView('transactions')}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
              view === 'transactions'
                ? 'border border-blue-500 bg-blue-950 bg-opacity-30 text-blue-400'
                : 'border border-gray-700 bg-gray-950 text-gray-500 hover:text-gray-400'
            }`}
          >
            <FileText size={16} />
            transactions[]
          </button>
          <button
            onClick={() => setView('budgets')}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
              view === 'budgets'
                ? 'border border-blue-500 bg-blue-950 bg-opacity-30 text-blue-400'
                : 'border border-gray-700 bg-gray-950 text-gray-500 hover:text-gray-400'
            }`}
          >
            <DollarSign size={16} />
            budgets
          </button>
          <button
            onClick={() => setView('settings')}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition ${
              view === 'settings'
                ? 'border border-blue-500 bg-blue-950 bg-opacity-30 text-blue-400'
                : 'border border-gray-700 bg-gray-950 text-gray-500 hover:text-gray-400'
            }`}
          >
            <Settings size={16} />
            settings
          </button>
        </div>

        <div className="min-h-96">
          {view === 'dashboard' && renderDashboard()}
          {view === 'transactions' && renderTransactions()}
          {view === 'budgets' && renderBudgets()}
          {view === 'settings' && renderSettings()}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-950 border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 bg-gray-950">
                <h3 className="text-gray-200">
                  {modalType === 'category'
                    ? (editingItem ? '編輯類別' : '新增類別')
                    : (editingItem ? '編輯交易' : '新增交易')}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {modalType === 'category' ? (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">類別名稱</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="例如：早餐、計程車"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">圖示 Emoji</label>
                    <div className="grid grid-cols-8 gap-2">
                      {['🍜', '🚗', '🎮', '🛍️', '🏥', '📚', '🏠', '💰', '📈', '✈️', '🎬', '☕', '🍕', '🚇', '💊', '📱'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setCategoryForm({ ...categoryForm, icon: emoji })}
                          className={`text-2xl p-2 rounded ${
                            categoryForm.icon === emoji ? 'bg-blue-900 border-2 border-blue-500' : 'bg-gray-900 hover:bg-gray-800'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      placeholder="或直接輸入 emoji"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">顏色</label>
                    <div className="grid grid-cols-8 gap-2 mb-2">
                      {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#6b7280'].map(color => (
                        <button
                          key={color}
                          onClick={() => setCategoryForm({ ...categoryForm, color: color })}
                          className={`w-8 h-8 rounded ${
                            categoryForm.color === color ? 'ring-2 ring-white' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="w-full h-10 bg-gray-900 border border-gray-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-2">類別類型</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCategoryForm({ ...categoryForm, type: 'expense' })}
                        className={`flex-1 py-2 text-sm ${
                          categoryForm.type === 'expense'
                            ? 'bg-red-900 text-red-400 border border-red-600'
                            : 'bg-gray-900 text-gray-500 border border-gray-700'
                        }`}
                      >
                        支出
                      </button>
                      <button
                        onClick={() => setCategoryForm({ ...categoryForm, type: 'income' })}
                        className={`flex-1 py-2 text-sm ${
                          categoryForm.type === 'income'
                            ? 'bg-emerald-900 text-emerald-400 border border-emerald-600'
                            : 'bg-gray-900 text-gray-500 border border-gray-700'
                        }`}
                      >
                        收入
                      </button>
                      <button
                        onClick={() => setCategoryForm({ ...categoryForm, type: 'both' })}
                        className={`flex-1 py-2 text-sm ${
                          categoryForm.type === 'both'
                            ? 'bg-blue-900 text-blue-400 border border-blue-600'
                            : 'bg-gray-900 text-gray-500 border border-gray-700'
                        }`}
                      >
                        通用
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 bg-gray-800 text-gray-400 hover:bg-gray-700 text-sm"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleCategory}
                      className="flex-1 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      {editingItem ? '更新' : '新增'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                      className={`flex-1 py-2 text-sm ${
                        formData.type === 'expense'
                          ? 'bg-red-900 text-red-400 border border-red-600'
                          : 'bg-gray-900 text-gray-500 border border-gray-700'
                      }`}
                    >
                      支出
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                      className={`flex-1 py-2 text-sm ${
                        formData.type === 'income'
                          ? 'bg-emerald-900 text-emerald-400 border border-emerald-600'
                          : 'bg-gray-900 text-gray-500 border border-gray-700'
                      }`}
                    >
                      收入
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">金額</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">類別</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">選擇類別</option>
                      {categories
                        .filter(c => c.type === formData.type || c.type === 'both')
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">日期</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">支付方式</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="cash">💵 現金</option>
                      <option value="card">💳 信用卡</option>
                      <option value="transfer">🏦 轉帳</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">備註</label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="新增備註..."
                      rows="2"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-gray-300 text-sm focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 bg-gray-800 text-gray-400 hover:bg-gray-700 text-sm"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleTransaction}
                      className="flex-1 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      {editingItem ? '更新' : '新增'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceManager;