import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { getEnrichmentActivityDetail } from './EnrichmentActivityDetailService';

const EnrichmentActivityDetailPage = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Gọi API lấy chi tiết hoạt động ngoại khóa
    // getEnrichmentActivityDetail(id).then(setActivity).finally(() => setLoading(false));
    setLoading(false);
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!activity) return <div>No activity found.</div>;

  return (
    <div className="enrichment-activity-detail-page">
      <h1>{activity.name}</h1>
      <p>{activity.description}</p>
      {/* Thêm các thông tin khác nếu cần */}
    </div>
  );
};

export default EnrichmentActivityDetailPage; 