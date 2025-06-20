import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './staffDashboard.css';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h2>Staff Dashboard</h2>
          <div className="dashboard-breadcrumb">
            <Link to="/">Home</Link> / <span>Staff Dashboard</span>
          </div>
        </div>
        <div className="dashboard-actions">
          <div className="search-container">
            <input type="text" placeholder="Search staff..." className="search-input" />
            <button className="search-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
        <button 
          className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
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
            <div className="card-trend positive">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14l5-5 5 5H7z" />
              </svg>
              <span>+5% this month</span>
            </div>
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
            <div className="card-trend positive">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14l5-5 5 5H7z" />
              </svg>
              <span>90% attendance</span>
            </div>
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
            <div className="card-trend negative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
              <span>-1 since yesterday</span>
            </div>
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
            <div className="card-trend positive">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14l5-5 5 5H7z" />
              </svg>
              <span>+2 from last month</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-widgets">
        <div className="widget widget-attendance">
          <div className="widget-header">
            <h3>Staff Attendance (Last 30 Days)</h3>
            <div className="widget-actions">
              <button className="widget-action active">30d</button>
              <button className="widget-action">90d</button>
              <button className="widget-action">1y</button>
              <button className="widget-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="chart-area">
            <div className="chart-container">
              <div className="chart-placeholder">
                <svg className="placeholder-chart" viewBox="0 0 500 200">
                  <path d="M0,150 C100,100 200,190 300,120 C400,50 500,80 500,150" stroke="#4a6cf7" strokeWidth="3" fill="none" />
                  <path d="M0,150 C100,100 200,190 300,120 C400,50 500,80 500,150 L500,200 L0,200 Z" fill="url(#blueGradient)" fillOpacity="0.2" />
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4a6cf7" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#4a6cf7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{backgroundColor: "#4a6cf7"}}></span>
                    <span>Present</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{backgroundColor: "#ffab00"}}></span>
                    <span>On Leave</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="widget widget-distribution">
          <div className="widget-header">
            <h3>Staff Distribution</h3>
            <div className="widget-actions">
              <button className="widget-action active">Department</button>
              <button className="widget-action">Role</button>
              <button className="widget-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="chart-area">
            <div className="donut-chart-container">
              <svg className="donut-chart" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="transparent" stroke="#4a6cf7" strokeWidth="30" strokeDasharray="251.2 502.4" strokeDashoffset="0"></circle>
                <circle cx="100" cy="100" r="80" fill="transparent" stroke="#54d62c" strokeWidth="30" strokeDasharray="125.6 502.4" strokeDashoffset="-251.2"></circle>
                <circle cx="100" cy="100" r="80" fill="transparent" stroke="#ffab00" strokeWidth="30" strokeDasharray="75.36 502.4" strokeDashoffset="-376.8"></circle>
                <circle cx="100" cy="100" r="80" fill="transparent" stroke="#a46bf5" strokeWidth="30" strokeDasharray="50.24 502.4" strokeDashoffset="-452.16"></circle>
                <text x="100" y="100" textAnchor="middle" dy="0.3em" className="donut-chart-text">42</text>
                <text x="100" y="120" textAnchor="middle" dy="0.3em" className="donut-chart-subtext">Staff</text>
              </svg>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{backgroundColor: "#4a6cf7"}}></span>
                  <span>Teachers (50%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{backgroundColor: "#54d62c"}}></span>
                  <span>Admin (25%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{backgroundColor: "#ffab00"}}></span>
                  <span>Support (15%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{backgroundColor: "#a46bf5"}}></span>
                  <span>Other (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-table-section">
        <div className="table-header">
          <h3>Recently Added Staff</h3>
          <div className="table-actions">
            <div className="table-filter">
              <select className="filter-select">
                <option>All Staff</option>
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </select>
            </div>
            <Link to="/staff/list" className="view-all-btn">View All</Link>
          </div>
        </div>
        
        <div className="table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="staff-info">
                    <div className="staff-avatar">JD</div>
                    <div className="staff-details">
                      <span className="staff-name">John Doe</span>
                      <span className="staff-email">john.doe@example.com</span>
                    </div>
                  </div>
                </td>
                <td>Lead Teacher</td>
                <td>Kindergarten</td>
                <td>May 15, 2023</td>
                <td><span className="staff-status status-active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon edit-icon" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button className="action-icon view-icon" title="View Profile">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="staff-info">
                    <div className="staff-avatar">JS</div>
                    <div className="staff-details">
                      <span className="staff-name">Jane Smith</span>
                      <span className="staff-email">jane.smith@example.com</span>
                    </div>
                  </div>
                </td>
                <td>Assistant Teacher</td>
                <td>Preschool</td>
                <td>Jun 2, 2023</td>
                <td><span className="staff-status status-active">Active</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon edit-icon" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button className="action-icon view-icon" title="View Profile">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="staff-info">
                    <div className="staff-avatar">RJ</div>
                    <div className="staff-details">
                      <span className="staff-name">Robert Johnson</span>
                      <span className="staff-email">robert.j@example.com</span>
                    </div>
                  </div>
                </td>
                <td>Administrator</td>
                <td>Admin</td>
                <td>Jun 10, 2023</td>
                <td><span className="staff-status status-leave">On Leave</span></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-icon edit-icon" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button className="action-icon view-icon" title="View Profile">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;