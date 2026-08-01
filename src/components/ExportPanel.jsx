import React, { useState } from 'react';
import { filterTransactionsByRange, downloadCSV, downloadPDF } from '../utils/exportUtils';

const ExportPanel = ({ transactions }) => {
  const [rangeType, setRangeType] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleExport = (format) => {
    const filtered = filterTransactionsByRange(transactions, rangeType, customStart, customEnd);
    if (format === 'csv') {
      downloadCSV(filtered, rangeType, customStart, customEnd);
    } else {
      downloadPDF(filtered, rangeType, customStart, customEnd);
    }
  };

  const filteredCount = filterTransactionsByRange(transactions, rangeType, customStart, customEnd).length;

  return (
    <div className="card export-card mb-4 p-3 p-sm-4 shadow-sm border-0">
      <h5 className="card-title mb-3 d-flex align-items-center">
        <svg className="me-2 text-indigo" width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Export Statement
      </h5>
      
      <div className="range-selector d-flex flex-wrap gap-2 mb-3">
        {[
          { label: 'All Time', value: 'all' },
          { label: '1 Month', value: '1m' },
          { label: '3 Months', value: '3m' },
          { label: '6 Months', value: '6m' },
          { label: '1 Year', value: '1y' },
          { label: 'Custom', value: 'custom' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`btn btn-sm px-3 rounded-pill transition-all ${
              rangeType === opt.value
                ? 'btn-indigo shadow-glow'
                : 'btn-outline-theme'
            }`}
            onClick={() => setRangeType(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {rangeType === 'custom' && (
        <div className="row g-2 mb-3 animate-fade-in">
          <div className="col-12 col-sm-6">
            <label className="form-label small text-secondary-label">Start Date</label>
            <input
              type="date"
              className="form-control form-control-sm input-theme"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label small text-secondary-label">End Date</label>
            <input
              type="date"
              className="form-control form-control-sm input-theme"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3 mt-3 pt-3 border-top border-separator">
        <span className="small text-muted text-center text-sm-start">
          Selected: <strong>{filteredCount}</strong> {filteredCount === 1 ? 'transaction' : 'transactions'}
        </span>
        <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto justify-content-center justify-content-sm-end">
          <button
            type="button"
            className="btn btn-sm btn-outline-theme d-flex align-items-center justify-content-center py-2 px-3 rounded-pill flex-fill flex-sm-grow-0"
            onClick={() => handleExport('csv')}
            disabled={filteredCount === 0}
          >
            Download CSV
          </button>
          <button
            type="button"
            className="btn btn-sm btn-indigo d-flex align-items-center justify-content-center py-2 px-3 rounded-pill flex-fill flex-sm-grow-0"
            onClick={() => handleExport('pdf')}
            disabled={filteredCount === 0}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;
