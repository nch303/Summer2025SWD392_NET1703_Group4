import React, { useState } from 'react';
// import { createNews } from './NewsCreateService';

const NewsCreatePage = () => {
  const [form, setForm] = useState({ title: '', content: '', image: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Gọi API tạo tin tức mới
    // createNews(form).then(...)
    setLoading(false);
  };

  return (
    <div className="news-create-page">
      <h1>Create new news</h1>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="image" placeholder="Image Link" value={form.image} onChange={handleChange} />
        <textarea name="content" placeholder="Content" value={form.content} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default NewsCreatePage; 