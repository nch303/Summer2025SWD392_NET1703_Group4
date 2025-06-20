import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { getNewsDetail, updateNews } from './NewsEditService';

const NewsEditPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState({ title: '', content: '', image: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // TODO: Gọi API lấy chi tiết tin tức để fill form
    // getNewsDetail(id).then(...)
    setLoading(false);
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Gọi API cập nhật tin tức
    // updateNews(id, form).then(...)
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="news-edit-page">
      <h1>Sửa tin tức</h1>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="image" placeholder="Image Link" value={form.image} onChange={handleChange} />
        <textarea name="content" placeholder="Content" value={form.content} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update'}</button>
      </form>
    </div>
  );
};

export default NewsEditPage; 