import React from 'react';

const BalanceDisplay = ({ balance, income, expense }) => {
  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <div className="stat-card stat-card-balance h-100">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="stat-title">Total Balance</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-white" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
          </div>
          <h2 className="stat-value m-0 text-white">
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>
      
      <div className="col-12 col-sm-6 col-md-4">
        <div className="stat-card h-100">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="stat-title text-success-green m-0">Income</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-success-green" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"></path>
            </svg>
          </div>
          <h2 className="stat-value m-0 text-success-green">
            ₹{income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      <div className="col-12 col-sm-6 col-md-4">
        <div className="stat-card h-100">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="stat-title text-danger-red m-0">Expenses</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-danger-red" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"></path>
            </svg>
          </div>
          <h2 className="stat-value m-0 text-danger-red">
            ₹{expense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>
    </div>
  );
};

export default BalanceDisplay;
