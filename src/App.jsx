import './App.css';
import { useEffect, useState } from 'react';
import CreateForm from './components/CreateForm';
import TransicationList from './components/TransicationList';
import BalanceDisplay from './components/BalanceDisplay';
import ExportPanel from './components/ExportPanel';

function App() {
  const [trackers, setTrackers] = useState([]);
  const [activeTrackerId, setActiveTrackerId] = useState(null);
  const [showSelectionScreen, setShowSelectionScreen] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [editableTransaction, setEditableTransaction] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // default to premium dark theme

  // States for tracker selection UI
  const [newTrackerName, setNewTrackerName] = useState("");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    // 1. Theme configuration
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme !== null) {
      setDarkMode(savedTheme === "true");
    } else {
      setDarkMode(true); // default to dark
    }

    // 2. Load trackers and migration
    const legacyTransactions = localStorage.getItem("transactions");
    let loadedTrackers = JSON.parse(localStorage.getItem("trackers"));

    if (legacyTransactions && !loadedTrackers) {
      // Legacy user has data, migrate them!
      try {
        const personalTransactions = JSON.parse(legacyTransactions);
        
        // Save their existing transactions under transactions_personal
        localStorage.setItem("transactions_personal", JSON.stringify(personalTransactions));
        
        // Remove legacy key
        localStorage.removeItem("transactions");
        
        // Initialize trackers with "Personal"
        loadedTrackers = [{ id: 'personal', name: 'Personal' }];
        localStorage.setItem("trackers", JSON.stringify(loadedTrackers));
        
        // Set active tracker
        localStorage.setItem("activeTrackerId", "personal");
      } catch (e) {
        console.error("Migration error:", e);
      }
    } else if (!loadedTrackers || loadedTrackers.length === 0) {
      // New user, create a default "Personal" tracker
      loadedTrackers = [{ id: 'personal', name: 'Personal' }];
      localStorage.setItem("trackers", JSON.stringify(loadedTrackers));
    }
    
    setTrackers(loadedTrackers);

    // 3. Determine active tracker
    const savedActiveTrackerId = localStorage.getItem("activeTrackerId");
    const trackerSelectedThisSession = sessionStorage.getItem("trackerSelectedThisSession") === "true";
    
    const activeTrackerExists = savedActiveTrackerId && loadedTrackers.some(t => t.id === savedActiveTrackerId);

    if (activeTrackerExists) {
      setActiveTrackerId(savedActiveTrackerId);
      const savedTransactions = JSON.parse(localStorage.getItem(`transactions_${savedActiveTrackerId}`));
      setTransactions(savedTransactions || []);
      if (trackerSelectedThisSession) {
        setShowSelectionScreen(false);
      } else {
        setShowSelectionScreen(true);
      }
    } else {
      setShowSelectionScreen(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  const selectTracker = (id) => {
    setActiveTrackerId(id);
    localStorage.setItem("activeTrackerId", id);
    sessionStorage.setItem("trackerSelectedThisSession", "true");
    
    const savedTransactions = JSON.parse(localStorage.getItem(`transactions_${id}`));
    setTransactions(savedTransactions || []);
    setShowSelectionScreen(false);
  };

  const createTracker = (name) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const id = 'tracker_' + Date.now();
    const newTracker = { id, name: cleanName };
    const updatedTrackers = [...trackers, newTracker];
    setTrackers(updatedTrackers);
    localStorage.setItem("trackers", JSON.stringify(updatedTrackers));
    
    // Auto-select it
    selectTracker(id);
  };

  const renameTracker = (id, newName) => {
    const cleanName = newName.trim();
    if (!cleanName) return;
    const updatedTrackers = trackers.map(t => 
      t.id === id ? { ...t, name: cleanName } : t
    );
    setTrackers(updatedTrackers);
    localStorage.setItem("trackers", JSON.stringify(updatedTrackers));
  };

  const moveTracker = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= trackers.length) return;

    const updated = [...trackers];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setTrackers(updated);
    localStorage.setItem("trackers", JSON.stringify(updated));
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...trackers];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, item);

    setDraggedIndex(index);
    setTrackers(updated);
    localStorage.setItem("trackers", JSON.stringify(updated));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const deleteTracker = (id) => {
    if (trackers.length <= 1) {
      alert("You must have at least one tracker.");
      return;
    }
    
    const trackerToDelete = trackers.find(t => t.id === id);
    if (!trackerToDelete) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${trackerToDelete.name}" and all its transaction history? This cannot be undone.`);
    if (!confirmDelete) return;

    const updatedTrackers = trackers.filter(t => t.id !== id);
    setTrackers(updatedTrackers);
    localStorage.setItem("trackers", JSON.stringify(updatedTrackers));

    localStorage.removeItem(`transactions_${id}`);

    if (activeTrackerId === id) {
      setActiveTrackerId(null);
      localStorage.removeItem("activeTrackerId");
      sessionStorage.removeItem("trackerSelectedThisSession");
      setTransactions([]);
      setShowSelectionScreen(true);
    }
  };

  const getTrackerStats = (trackerId) => {
    try {
      const data = localStorage.getItem(`transactions_${trackerId}`);
      if (!data) return { balance: 0, income: 0, expense: 0 };
      const txs = JSON.parse(data);
      if (!Array.isArray(txs)) return { balance: 0, income: 0, expense: 0 };
      
      const income = txs.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = txs.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
      return { balance: income - expense, income, expense };
    } catch (e) {
      console.error(e);
      return { balance: 0, income: 0, expense: 0 };
    }
  };

  const addTransaction = (transaction) => {
    if (!activeTrackerId) return;
    const updated = [...transactions, { ...transaction, id: Date.now() }];
    setTransactions(updated);
    localStorage.setItem(`transactions_${activeTrackerId}`, JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    if (!activeTrackerId) return;
    const updated = transactions.filter((transaction) => transaction.id !== id);
    setTransactions(updated);
    localStorage.setItem(`transactions_${activeTrackerId}`, JSON.stringify(updated));
  };

  const handleEdit = (id) => {
    const transactionToEdit = transactions.find((transaction) => transaction.id === id);
    setEditableTransaction(transactionToEdit);
    
    // Smooth scroll to form for better mobile UX
    setTimeout(() => {
      const formElement = document.getElementById('create-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleUpdate = (updatedTransaction) => {
    if (!activeTrackerId) return;
    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    );
    setTransactions(updatedTransactions);
    localStorage.setItem(`transactions_${activeTrackerId}`, JSON.stringify(updatedTransactions));
    setEditableTransaction(null);
  };

  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const expenseRatio = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0;
  
  const expenseTransactions = transactions.filter(t => t.type === 'Expense');
  const categoriesMap = {};
  expenseTransactions.forEach(t => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + Number(t.amount);
  });
  const categoryBreakdown = Object.entries(categoriesMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const activeTracker = trackers.find(t => t.id === activeTrackerId);

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header */}
      <header className="dashboard-header">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="bg-indigo-light p-2 rounded-3 text-indigo d-flex align-items-center justify-content-center">
            <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007v.008H3.75V4.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3 16.25h.008v.008H3v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM6 20.25h.008v.008H6v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3m18 0c0-1.66-4.03-3-9-3s-9 1.34-9 3m18 0V4c0-1.66-4.03-3-9-3S3 2.34 3 4v8M3 4c0 1.66 4.03 3 9 3s9-1.34 9-3m-9 15c-1.34 0-2.61-.1-3.79-.29M12 18a9.001 9.001 0 01-9-9"></path>
            </svg>
          </div>
          <h1 className="brand-title">Avsar FinSight</h1>
          {!showSelectionScreen && activeTracker && (
            <span 
              className="badge bg-indigo-light text-indigo rounded-pill px-3 py-2 ms-sm-2 fs-7 d-flex align-items-center gap-1 cursor-pointer hover-scale transition-all animate-fade-in"
              onClick={() => {
                setShowSelectionScreen(true);
                sessionStorage.removeItem("trackerSelectedThisSession");
              }}
              title="Click to Switch Tracker"
              style={{ border: '1px solid rgba(79, 70, 229, 0.2)' }}
            >
              {activeTracker.name}
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="ms-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
              </svg>
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {!showSelectionScreen && (
            <button
              type="button"
              className="btn btn-sm btn-outline-theme rounded-pill px-3 py-2 me-2 d-flex align-items-center gap-1 hover-scale transition-all"
              onClick={() => {
                setShowSelectionScreen(true);
                sessionStorage.removeItem("trackerSelectedThisSession");
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
              </svg>
              <span className="d-none d-sm-inline">Switch Tracker</span>
            </button>
          )}
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
        </div>
      </header>

      {showSelectionScreen ? (
        <div className="tracker-selection-screen animate-fade-in py-4">
          <div className="text-center mb-5">
            <h2 className="selection-title">Select a Tracker Profile</h2>
            <p className="text-muted selection-subtitle">
              Manage independent budgets, income, and expense records for personal, work, or travel.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {trackers.map((tracker, index) => {
              const stats = getTrackerStats(tracker.id);
              const isSelected = tracker.id === activeTrackerId;
              const isDragging = index === draggedIndex;
              
              return (
                <div 
                  key={tracker.id} 
                  className="col-12 col-md-6 col-lg-4"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={`card tracker-card h-100 transition-all ${isSelected ? 'border-indigo-glow' : ''} ${isDragging ? 'dragging' : ''}`}>
                    <div className="card-body d-flex flex-column p-4">
                      
                      {/* Tracker Card Header / Name */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        {renamingId === tracker.id ? (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              renameTracker(tracker.id, renameValue);
                              setRenamingId(null);
                            }} 
                            className="d-flex gap-2 w-100 animate-fade-in"
                          >
                            <input 
                              type="text" 
                              className="form-control form-control-sm"
                              value={renameValue} 
                              onChange={(e) => setRenameValue(e.target.value)}
                              autoFocus
                              required
                              maxLength={25}
                            />
                            <button type="submit" className="btn btn-sm btn-indigo px-3 rounded-pill">Save</button>
                            <button type="button" className="btn btn-sm btn-outline-theme px-2 rounded-circle" onClick={() => setRenamingId(null)}>×</button>
                          </form>
                        ) : (
                          <>
                            <div className="d-flex align-items-center gap-1">
                              <div className="drag-handle text-secondary-label cursor-grab me-1" title="Drag to reorder" style={{ opacity: 0.5, cursor: 'grab' }}>
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7-10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/>
                                </svg>
                              </div>
                              <h4 className="tracker-name m-0" onClick={() => selectTracker(tracker.id)}>
                                {tracker.name}
                              </h4>
                            </div>
                            <div className="d-flex gap-1 tracker-actions align-items-center">
                              {index > 0 && (
                                <button 
                                  className="btn btn-link btn-sm text-secondary-label p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTracker(index, -1);
                                  }}
                                  title="Move Left/Up"
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path>
                                  </svg>
                                </button>
                              )}
                              {index < trackers.length - 1 && (
                                <button 
                                  className="btn btn-link btn-sm text-secondary-label p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveTracker(index, 1);
                                  }}
                                  title="Move Right/Down"
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path>
                                  </svg>
                                </button>
                              )}
                              <button 
                                className="btn btn-link btn-sm text-secondary-label p-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenamingId(tracker.id);
                                  setRenameValue(tracker.name);
                                }}
                                title="Rename Tracker"
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
                                </svg>
                              </button>
                              {trackers.length > 1 && (
                                <button 
                                  className="btn btn-link btn-sm text-danger-red p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTracker(tracker.id);
                                  }}
                                  title="Delete Tracker"
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Tracker Stats Preview */}
                      <div className="tracker-stats-preview my-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)' }} onClick={() => selectTracker(tracker.id)}>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="small text-secondary-label">Total Balance:</span>
                          <strong className={`small ${stats.balance >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                            ₹{stats.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1 text-xs">
                          <span className="small text-muted">Income:</span>
                          <span className="small text-success-green">₹{stats.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="d-flex justify-content-between text-xs">
                          <span className="small text-muted">Expenses:</span>
                          <span className="small text-danger-red">₹{stats.expense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Select button */}
                      <button 
                        className={`btn btn-sm w-100 py-2 rounded-pill mt-auto ${isSelected ? 'btn-indigo shadow-glow' : 'btn-outline-theme'}`}
                        onClick={() => selectTracker(tracker.id)}
                      >
                        {isSelected ? 'Currently Selected (Open)' : 'Open Tracker'}
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Tracker Card */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card tracker-card h-100 border-dashed d-flex flex-column justify-content-center p-4">
                <h5 className="card-title text-center mb-3">Add New Tracker</h5>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newTrackerName.trim()) {
                      createTracker(newTrackerName);
                      setNewTrackerName("");
                    }
                  }}
                >
                  <div className="mb-3">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Travel, Business, Joint Account"
                      value={newTrackerName}
                      onChange={(e) => setNewTrackerName(e.target.value)}
                      required
                      maxLength={25}
                    />
                  </div>
                  <button type="submit" className="btn btn-indigo btn-sm w-100 py-2 rounded-pill shadow-glow">
                    Create & Open
                  </button>
                </form>

                {/* Quick presets for tracker suggestions */}
                <div className="mt-3">
                  <p className="small text-muted mb-2 text-center">Suggestions:</p>
                  <div className="d-flex flex-wrap gap-1 justify-content-center">
                    {['Personal', 'Business', 'Travel', 'Savings'].map(preset => (
                      <button 
                        key={preset}
                        className="btn btn-xs btn-outline-theme rounded-pill py-1 px-2 text-xs hover-scale"
                        onClick={() => createTracker(preset)}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Overview Stats & Main Grid */
        <div className="animate-fade-in">
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
              <ExportPanel transactions={transactions} trackerName={activeTracker ? activeTracker.name : ''} />

              {/* Mini Analytics Panel */}
              {transactions.length > 0 && (
                <div className="card p-3 p-sm-4 border-0 mb-4 shadow-sm animate-fade-in">
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
      )}
    </div>
  );
}

export default App;
