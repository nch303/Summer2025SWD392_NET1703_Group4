import React, { useState } from 'react';
import { Card } from 'antd';
import './SendAnnouncementPage.css';
// import { sendAnnouncement } from './SendAnnouncementService';

const SendAnnouncementPage = () => {
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Gọi API gửi thông báo
    // sendAnnouncement(form).then(...)
    setLoading(false);
  };

  return (
    <div className="admin-content send-announcement-page">
      <Card>
        <h1 className="announcement-title">Gửi thông báo</h1>
        <form className="announcement-form" onSubmit={handleSubmit}>
          <input className="announcement-input" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <textarea className="announcement-textarea" name="content" placeholder="Content" value={form.content} onChange={handleChange} required />
          <button className="announcement-btn" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Announcement'}</button>
        </form>
      </Card>
    </div>
  );
};

export default SendAnnouncementPage; 