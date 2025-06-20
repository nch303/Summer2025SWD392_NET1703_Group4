import React, { useState } from 'react';
import { Card } from 'antd';
import './ReportsPage.css';
// import { generateReport } from './ReportsService';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  // const [reportUrl, setReportUrl] = useState('');

  const handleExport = () => {
    setLoading(true);
    // TODO: Gọi API xuất báo cáo
    // generateReport().then(url => setReportUrl(url)).finally(() => setLoading(false));
    setLoading(false);
  };

  return (
    <div className="admin-content reports-page">
      <Card>
        <h1 className="reports-title">Export detailed report</h1>
        <button className="reports-btn" onClick={handleExport} disabled={loading}>{loading ? 'Exporting...' : 'Export Report'}</button>
        {/* {reportUrl && <a href={reportUrl} download>Download Report</a>} */}
      </Card>
    </div>
  );
};

export default ReportsPage; 