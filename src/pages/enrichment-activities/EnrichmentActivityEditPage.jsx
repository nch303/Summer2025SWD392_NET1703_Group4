import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { getEnrichmentActivityDetail, updateEnrichmentActivity } from './EnrichmentActivityEditService';

const EnrichmentActivityEditPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Gọi API lấy chi tiết hoạt động để fill form
    // getEnrichmentActivityDetail(id).then(...)
    setLoading(false);
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Gọi API cập nhật hoạt động ngoại khóa
    // updateEnrichmentActivity(id, form).then(...)
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="enrichment-activity-edit-page">
      <h1>Sửa hoạt động ngoại khóa</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Event Name" value={form.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update'}</button>
      </form>
    </div>
  );
};

export default EnrichmentActivityEditPage; 