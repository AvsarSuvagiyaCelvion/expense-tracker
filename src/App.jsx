import './App.css';
import { useEffect, useState } from 'react';
import CreateForm from './components/CreateForm';
import TransicationList from './components/TransicationList';
import BalanceDisplay from './components/BalanceDisplay';
import ExportPanel from './components/ExportPanel';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [editableTransaction, setEditableTransaction] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // default to premium dark theme

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem("transactions"));
    if (savedTransactions) {
      setTransactions(savedTransactions);
    }
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      setDarkMode(savedTheme === "true");
    } else {
      setDarkMode(true); // default to dark
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  const addTransaction = (transaction) => {
    setTransactions([...transactions, { ...transaction, id: Date.now() }]);
  };

  const handleDelete = (id) => {
    const updated = transactions.filter((transaction) => transaction.id !== id);
    setTransactions(updated);
  };

  const handleEdit = (id) => {
    const transactionToEdit = transactions.find((transaction) => transaction.id === id);
    setEditableTransaction(transactionToEdit);
  };

  const handleUpdate = (updatedTransaction) => {
    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    );
    setTransactions(updatedTransactions);
    setEditableTransaction(null);
  };

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  // Analytics calculation
  const expenseRatio = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;
  
  const expenseTransactions = transactions.filter(t => t.type === 'Expense');
  const categoriesMap = {};
  expenseTransactions.forEach(t => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + Number(t.amount);
  });
  const categoryBreakdown = Object.entries(categoriesMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-indigo-light p-2 rounded-3 text-indigo d-flex align-items-center justify-content-center">
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007v.008H3.75V4.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3 16.25h.008v.008H3v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM6 20.25h.008v.008H6v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3m18 0c0-1.66-4.03-3-9-3s-9 1.34-9 3m18 0V4c0-1.66-4.03-3-9-3S3 2.34 3 4v8M3 4c0 1.66 4.03 3 9 3s9-1.34 9-3m-9 15c-1.34 0-2.61-.1-3.79-.29M12 18a9.001 9.001 0 01-9-9"></path>
            </svg>
          </div>
          <h1 className="brand-title">FinSight</h1>
        </div>
        <div className="theme-toggle-container">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"></path>
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"></path>
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Overview Stats */}
      <BalanceDisplay balance={balance} income={totalIncome} expense={totalExpense} />

      {/* Main Grid */}
      <div className="row g-4">
        {/* Left Side: Create form & Utilities */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-4">
          <CreateForm
            onAdd={addTransaction}
            onUpdate={handleUpdate}
            editable={editableTransaction}
          />
          <ExportPanel transactions={transactions} />

          {/* Mini Analytics Panel */}
          {transactions.length > 0 && (
            <div className="card p-4 border-0 mb-4 shadow-sm animate-fade-in">
              <h5 className="card-title mb-3 d-flex align-items-center">
                <svg className="me-2 text-indigo" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"></path>
                </svg>
                Insights & Budget
              </h5>
              
              <div className="mb-4">
                <div className="d-flex justify-content-between small text-secondary-label mb-1">
                  <span>Expense to Income Ratio</span>
                  <strong>{expenseRatio.toFixed(1)}%</strong>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${expenseRatio}%`, 
                      backgroundColor: expenseRatio > 80 ? 'var(--expense-red)' : 'var(--indigo-primary)' 
                    }}
                  />
                </div>
                {expenseRatio > 90 && (
                  <div className="alert alert-danger py-2 px-3 mt-2 mb-0 small border-0 rounded-3 text-danger-red" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    Warning: You've spent most of your income!
                  </div>
                )}
              </div>

              {categoryBreakdown.length > 0 && (
                <div>
                  <h6 className="small text-secondary-label mb-2 uppercase font-weight-bold">Top Expense Categories</h6>
                  <div className="d-flex flex-column gap-2">
                    {categoryBreakdown.slice(0, 3).map((item) => {
                      const share = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
                      return (
                        <div key={item.name} className="category-bar-row">
                          <div className="category-bar-label">
                            <span>{item.name}</span>
                            <span className="text-muted">₹{item.amount.toFixed(2)} ({share.toFixed(0)}%)</span>
                          </div>
                          <div className="progress-bar-container" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${share}%`, 
                                backgroundColor: 'var(--text-secondary)' 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: List of Transactions */}
        <div className="col-12 col-lg-7 d-flex flex-column">
          <TransicationList
            transactions={transactions}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
