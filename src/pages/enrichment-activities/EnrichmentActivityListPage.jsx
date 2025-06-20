import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import './EnrichmentActivityListPage.css';
// import { getEnrichmentActivities } from './EnrichmentActivityListService';

const EnrichmentActivityListPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    // TODO: Gọi API lấy danh sách hoạt động ngoại khóa
    // getEnrichmentActivities({ search, sort }).then(setActivities).finally(() => setLoading(false));
    setLoading(false);
  }, [search, sort]);

  return (
    <div className="admin-content enrichment-activity-list-page">
      <Card>
        <h1 className="enrichment-title">List of enrichment activities</h1>
        <div className="enrichment-controls">
          <input className="enrichment-search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="enrichment-sort" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="">Sort</option>
            <option value="name">Name</option>
            <option value="date">Date</option>
          </select>
        </div>
        {loading ? <div className="enrichment-loading">Loading...</div> : (
          <ul className="enrichment-list">
            {activities.map(a => (
              <li className="enrichment-item" key={a.id}>{a.name}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default EnrichmentActivityListPage; 