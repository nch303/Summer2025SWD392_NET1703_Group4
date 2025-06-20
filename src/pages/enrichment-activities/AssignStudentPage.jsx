import React, { useState } from 'react';
// import { assignStudentToActivity } from './AssignStudentService';

const AssignStudentPage = () => {
  const [studentId, setStudentId] = useState('');
  const [activityId, setActivityId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Gọi API gán học sinh vào hoạt động
    // assignStudentToActivity({ studentId, activityId }).then(...)
    setLoading(false);
  };

  return (
    <div className="assign-student-page">
      <h1>Gán học sinh vào hoạt động ngoại khóa</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} required />
        <input placeholder="Event ID" value={activityId} onChange={e => setActivityId(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Assigning...' : 'Assign'}</button>
      </form>
    </div>
  );
};

export default AssignStudentPage; 