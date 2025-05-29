import React from 'react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h2>Staff Dashboard</h2>
        <div className="dashboard-breadcrumb">
          <Link to="/">Home</Link> / <span>Staff Dashboard</span>
        </div>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <div className="card-info">
            <h3>42</h3>
            <p>Total Staff</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon icon-green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
            </svg>
          </div>
          <div className="card-info">
            <h3>38</h3>
            <p>Present Today</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon icon-orange">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 13.48l-4-4c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4 4c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </div>
          <div className="card-info">
            <h3>4</h3>
            <p>On Leave</p>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-icon icon-purple">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
            </svg>
          </div>
          <div className="card-info">
            <h3>5</h3>
            <p>New This Month</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-charts">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Staff Attendance (Last 30 Days)</h3>
          </div>
          <div className="chart-placeholder">
            [Attendance Chart Visualization]
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h3>Staff Department Distribution</h3>
          </div>
          <div className="chart-placeholder">
            [Department Distribution Chart]
          </div>
        </div>
      </div>
      
      <div className="recent-staff">
        <div className="recent-staff-header">
          <h3>Recently Added Staff</h3>
          <Link to="/staff/list" className="view-all-btn">View All</Link>
        </div>
        
        <table className="staff-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Join Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="staff-avatar">JD</div>
                  <span style={{ marginLeft: '10px' }}>John Doe</span>
                </div>
              </td>
              <td>Lead Teacher</td>
              <td>Kindergarten</td>
              <td>May 15, 2023</td>
              <td><span className="staff-status status-active">Active</span></td>
            </tr>
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="staff-avatar">JS</div>
                  <span style={{ marginLeft: '10px' }}>Jane Smith</span>
                </div>
              </td>
              <td>Assistant Teacher</td>
              <td>Preschool</td>
              <td>Jun 2, 2023</td>
              <td><span className="staff-status status-active">Active</span></td>
            </tr>
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="staff-avatar">RJ</div>
                  <span style={{ marginLeft: '10px' }}>Robert Johnson</span>
                </div>
              </td>
              <td>Administrator</td>
              <td>Admin</td>
              <td>Jun 10, 2023</td>
              <td><span className="staff-status status-leave">On Leave</span></td>
            </tr>
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="staff-avatar">MW</div>
                  <span style={{ marginLeft: '10px' }}>Maria Wilson</span>
                </div>
              </td>
              <td>Nurse</td>
              <td>Health</td>
              <td>Jul 3, 2023</td>
              <td><span className="staff-status status-active">Active</span></td>
            </tr>
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="staff-avatar">TB</div>
                  <span style={{ marginLeft: '10px' }}>Thomas Brown</span>
                </div>
              </td>
              <td>Janitor</td>
              <td>Maintenance</td>
              <td>Jul 15, 2023</td>
              <td><span className="staff-status status-inactive">Inactive</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffDashboard;