import React, { useState } from 'react';
// import { createEnrichmentActivity } from './EnrichmentActivityCreateService';

const EnrichmentActivityCreatePage = () => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Gọi API tạo hoạt động ngoại khóa
    // createEnrichmentActivity(form).then(...)
    setLoading(false);
  };

  return (
    <div className="enrichment-activity-create-page">
      <h1>Tạo hoạt động ngoại khóa</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Event Name" value={form.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</button>
      </form>
    </div>
  );
};

export default EnrichmentActivityCreatePage; 