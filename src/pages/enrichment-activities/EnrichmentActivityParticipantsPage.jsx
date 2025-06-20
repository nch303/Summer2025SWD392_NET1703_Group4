import React, { useEffect, useState } from 'react';
// import { getEnrichmentActivityParticipants } from './EnrichmentActivityParticipantsService';

const EnrichmentActivityParticipantsPage = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Gọi API lấy danh sách người tham gia hoạt động ngoại khóa
    // getEnrichmentActivityParticipants().then(setParticipants).finally(() => setLoading(false));
    setLoading(false);
  }, []);

  return (
    <div className="enrichment-activity-participants-page">
      <h1>List of enrichment activity participants</h1>
      {loading ? <div>Loading...</div> : (
        <ul>
          {participants.map(p => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EnrichmentActivityParticipantsPage; 