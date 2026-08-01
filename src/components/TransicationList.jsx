import React, { useState } from 'react';

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically compile categories present in transactions
  const uniqueCategories = ['All', ...new Set(transactions.map(t => t.category).filter(Boolean))];

  // Filter transactions by category AND search query
  const filtered = transactions.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = 
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort transactions by date descending
  const sorted = [...filtered].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="card p-3 p-sm-4 shadow-sm border-0 h-100 d-flex flex-column">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <h5 className="card-title m-0 d-flex align-items-center">
          <svg className="me-2 text-indigo" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path>
          </svg>
          Transaction History
        </h5>
        
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto justify-content-sm-end flex-grow-1 flex-md-grow-0">
          {/* Search Input */}
          <div className="search-wrapper search-wrapper-responsive flex-grow-1 animate-fade-in">
            <svg className="search-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z"></path>
            </svg>
            <input
              type="text"
              className="form-control form-control-sm search-input"
              placeholder="Search description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="form-select form-select-sm select-responsive"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-5 text-muted animate-fade-in flex-grow-1 d-flex flex-column justify-content-center align-items-center">
          <svg className="mb-2 text-secondary-label" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path>
          </svg>
          <p className="m-0">No transactions found.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 flex-grow-1" style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
          {sorted.map(item => (
            <div
              key={item.id}
              className={`transaction-card card p-3 shadow-sm border-0 animate-fade-in ${
                item.type === 'Income' ? 'income' : 'expense'
              }`}
            >
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '42px', height: '42px', backgroundColor: item.type === 'Income' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)' }}>
                    {item.type === 'Income' ? (
                      <svg className="text-success-green" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"></path>
                      </svg>
                    ) : (
                      <svg className="text-danger-red" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"></path>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h6 className="m-0 font-weight-bold">
                      {item.description || 'No description'}
                    </h6>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className={`badge category-badge ${item.type === 'Income' ? 'badge-income' : 'badge-expense'}`}>
                        {item.category}
                      </span>
                      <span className="small text-muted">
                        {item.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-3 border-top border-sm-top-0 pt-2 pt-sm-0 border-separator">
                  <span className={`h5 m-0 font-weight-bold ${
                    item.type === 'Income' ? 'text-success-green' : 'text-danger-red'
                  }`}>
                    {item.type === 'Income' ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-theme rounded-circle p-2 d-flex align-items-center justify-content-center"
                      onClick={() => onEdit(item.id)}
                      title="Edit"
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
                      </svg>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-theme text-danger-red rounded-circle p-2 d-flex align-items-center justify-content-center"
                      onClick={() => onDelete(item.id)}
                      title="Delete"
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
