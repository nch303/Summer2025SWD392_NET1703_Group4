import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import './SyllabusListPage.css';
// import { getSyllabi } from './SyllabusListService';

const SyllabusListPage = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Gọi API lấy danh sách giáo trình
    // getSyllabi().then(setSyllabi).finally(() => setLoading(false));
    setLoading(false);
  }, []);

  return (
    <div className="admin-content syllabus-list-page">
      <Card>
        <h1 className="syllabus-title">List of syllabi</h1>
        {loading ? <div className="syllabus-loading">Loading...</div> : (
          <ul className="syllabus-list">
            {syllabi.map(s => (
              <li className="syllabus-item" key={s.id}>{s.name}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default SyllabusListPage; 