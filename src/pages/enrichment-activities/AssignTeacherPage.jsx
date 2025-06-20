import React, { useState } from 'react';
// import { assignTeacherToActivity } from './AssignTeacherService';

const AssignTeacherPage = () => {
  const [teacherId, setTeacherId] = useState('');
  const [activityId, setActivityId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Gọi API gán giáo viên vào hoạt động
    // assignTeacherToActivity({ teacherId, activityId }).then(...)
    setLoading(false);
  };

  return (
    <div className="assign-teacher-page">
      <h1>Gán giáo viên vào hoạt động ngoại khóa</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Teacher ID" value={teacherId} onChange={e => setTeacherId(e.target.value)} required />
        <input placeholder="Event ID" value={activityId} onChange={e => setActivityId(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Assigning...' : 'Assign'}</button>
      </form>
    </div>
  );
};

export default AssignTeacherPage; 