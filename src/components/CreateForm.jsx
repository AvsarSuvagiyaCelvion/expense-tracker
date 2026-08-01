import React, { useState, useEffect } from 'react';

const STANDARD_CATEGORIES = ['Food', 'Rent', 'Salary', 'Entertainment', 'Utilities', 'Travel', 'Shopping', 'Other'];

const CreateForm = ({ onAdd, onUpdate, editable }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food',
    customCategory: '',
    type: 'Income',
    date: '',
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  useEffect(() => {
    if (editable) {
      const isStandard = STANDARD_CATEGORIES.includes(editable.category);
      setFormData({
        amount: editable.amount,
        description: editable.description,
        category: isStandard ? editable.category : 'Other',
        customCategory: isStandard ? '' : editable.category,
        type: editable.type,
        date: editable.date,
      });
      setIsCustomCategory(!isStandard);
    }
  }, [editable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      if (value === 'Other') {
        setIsCustomCategory(true);
        setFormData(prev => ({ ...prev, category: value }));
      } else {
        setIsCustomCategory(false);
        setFormData(prev => ({ ...prev, category: value, customCategory: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) {
      alert('Please fill in both Amount and Date.');
      return;
    }

    const finalCategory = isCustomCategory 
      ? (formData.customCategory.trim() || 'Other') 
      : formData.category;

    const newTransaction = {
      amount: Number(formData.amount),
      description: formData.description.trim(),
      category: finalCategory,
      type: formData.type,
      date: formData.date,
      id: editable ? editable.id : Date.now(),
    };

    if (editable) {
      onUpdate(newTransaction);
    } else {
      onAdd(newTransaction);
    }

    setFormData({
      amount: '',
      description: '',
      category: 'Food',
      customCategory: '',
      type: 'Income',
      date: '',
    });
    setIsCustomCategory(false);
  };

  const handleClear = () => {
    setFormData({
      amount: '',
      description: '',
      category: 'Food',
      customCategory: '',
      type: 'Income',
      date: '',
    });
    setIsCustomCategory(false);
  };

  return (
    <div className="card p-4 shadow-sm mb-4 border-0">
      <h5 className="card-title mb-3 d-flex align-items-center">
        <svg className="me-2 text-indigo" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
        </svg>
        {editable ? 'Edit Transaction' : 'Add Transaction'}
      </h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-secondary-label">Transaction Type</label>
          <div className="d-flex gap-2">
            <button
              type="button"
              className={`btn btn-sm flex-fill rounded-pill py-2 transition-all ${
                formData.type === 'Income'
                  ? 'btn-indigo shadow-glow'
                  : 'btn-outline-theme'
              }`}
              onClick={() => setFormData({ ...formData, type: 'Income' })}
            >
              Income
            </button>
            <button
              type="button"
              className={`btn btn-sm flex-fill rounded-pill py-2 transition-all ${
                formData.type === 'Expense'
                  ? 'btn-indigo shadow-glow'
                  : 'btn-outline-theme'
              }`}
              onClick={() => setFormData({ ...formData, type: 'Expense' })}
            >
              Expense
            </button>
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-12 col-sm-6">
            <label className="form-label text-secondary-label">Amount (₹)</label>
            <input
              name="amount"
              type="number"
              className="form-control"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label text-secondary-label">Date</label>
            <input
              name="date"
              type="date"
              className="form-control input-theme"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-secondary-label">Category</label>
          <select
            name="category"
            value={formData.category}
            className="form-select mb-2"
            onChange={handleChange}
          >
            {STANDARD_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {isCustomCategory && (
            <input
              name="customCategory"
              type="text"
              className="form-control animate-fade-in"
              placeholder="Enter Custom Category Name"
              value={formData.customCategory}
              onChange={handleChange}
              required
            />
          )}
        </div>

        <div className="mb-4">
          <label className="form-label text-secondary-label">Description (Optional)</label>
          <input
            name="description"
            className="form-control"
            placeholder="Add description details..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-indigo flex-fill py-2 rounded-pill shadow-glow">
            {editable ? 'Update' : 'Save Transaction'}
          </button>
          <button type="button" className="btn btn-outline-theme px-3 rounded-pill" onClick={handleClear}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateForm;
