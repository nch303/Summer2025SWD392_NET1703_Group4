// src/pages/staff-children-management/ChildrenManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllChildren } from './ChildrenManagementService';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import ChildDetailModal from './ChildDetailModal';
import './ChildrenManagement.css';

const ChildrenManagement = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });

  const childrenPerPage = 5;
  const toast = useCustomToast();
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Calculate age
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch children data
  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      try {
        const data = await getAllChildren();
        setChildren(data);
        setTotalPages(Math.ceil(data.length / childrenPerPage));
      } catch (error) {
        toast.error('Cannot load student list. Please try again later.');
        console.error('Error fetching children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [fetchTrigger]);

  // Handle search and filter
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleGenderFilter = (e) => {
    setSelectedGender(e.target.value);
    setCurrentPage(1);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Show child details
  const handleViewDetails = (child) => {
    setSelectedChild(child);
    setShowDetailModal(true);
  };

  // Apply filters and sorting
  const filteredChildren = children
    .filter(child =>
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (child.parentName && child.parentName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(child => selectedGender === '' || child.gender === selectedGender)
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination
  const indexOfLastChild = currentPage * childrenPerPage;
  const indexOfFirstChild = indexOfLastChild - childrenPerPage;
  const currentChildren = filteredChildren.slice(indexOfFirstChild, indexOfLastChild);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGender('');
    setSortConfig({ key: 'name', direction: 'asc' });
    setCurrentPage(1);
  };

  // Get gender display
  const getGenderDisplay = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'other': return 'Other';
      default: return 'Other';
    }
  };

  // Thay vì gọi fetchChildren trực tiếp, sử dụng hàm này
  const refreshData = () => {
    setFetchTrigger(prev => prev + 1);
  };

  return (
    <div className="staff-children-page">
      <ProcessingSpinner isVisible={loading} message="Loading student list..." />

      <div className="staff-children-filters">
        <div className="staff-children-filter-row">
          <div className="staff-children-filter-group staff-children-search-group">
            <input
              type="text"
              placeholder="Search by name or parent..."
              className="staff-children-search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="staff-children-filter-group">
            <label htmlFor="genderFilter">Gender:</label>
            <select
              id="genderFilter"
              className="staff-children-filter-select"
              value={selectedGender}
              onChange={handleGenderFilter}
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            className="staff-children-filter-reset-button"
            onClick={handleResetFilters}
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      <div className="staff-children-stats">
        <div className="staff-children-stat-card">
          <div className="staff-children-stat-title">Total students</div>
          <div className="staff-children-stat-value">{children.length}</div>
        </div>
        <div className="staff-children-stat-card">
          <div className="staff-children-stat-title">Male students</div>
          <div className="staff-children-stat-value">
            {children.filter(child => child.gender === 'Male').length}
          </div>
        </div>
        <div className="staff-children-stat-card">
          <div className="staff-children-stat-title">Female students</div>
          <div className="staff-children-stat-value">
            {children.filter(child => child.gender === 'Female').length}
          </div>
        </div>
      </div>

      <div className="staff-children-table-container">
        {currentChildren.length > 0 ? (
          <table className="staff-children-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('name')}>
                  Name
                  {sortConfig.key === 'name' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th>Avatar</th>
                <th onClick={() => requestSort('birthday')}>
                  Birthday / Age
                  {sortConfig.key === 'birthday' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => requestSort('gender')}>
                  Gender
                  {sortConfig.key === 'gender' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th onClick={() => requestSort('city')}>
                  City
                  {sortConfig.key === 'city' && (
                    <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentChildren.map(child => (
                <tr key={child.id}>
                  <td className="staff-children-child-name">{child.name}</td>
                  <td className="staff-children-child-avatar">
                    {child.avatar ? (
                      <img
                        src={child.avatar}
                        alt={`Avatar of ${child.name}`}
                        onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
                      />
                    ) : (
                      <div className="staff-children-avatar-placeholder">
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="staff-children-birth-info">
                      <div>{formatDate(child.birthday)}</div>
                      <div className="staff-children-age">{calculateAge(child.birthday)} years</div>
                    </div>
                  </td>
                  <td>{getGenderDisplay(child.gender)}</td>
                  <td>{child.city || 'Not specified'}</td>
                  <td className="staff-children-actions-cell">
                    <button
                      className="staff-children-action-btn staff-children-view-btn"
                      onClick={() => handleViewDetails(child)}
                      title="View details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <Link
                      to={`/staff/children/edit/${child.id}`}
                      className="staff-children-action-btn staff-children-edit-btn"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className="staff-children-action-btn staff-children-delete-btn"
                      onClick={() => {/* Handle delete */ }}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="staff-children-no-data">
            {loading ? (
              <p>Loading data...</p>
            ) : (
              <>
                <i className="fas fa-child"></i>
                <p>No students found.</p>
              </>
            )}
          </div>
        )}
      </div>

      {filteredChildren.length > 0 && (
        <div className="staff-children-pagination">
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="staff-children-pagination-button staff-children-first-page"
          >
            <i className="fas fa-angle-double-left"></i>
          </button>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="staff-children-pagination-button"
          >
            <i className="fas fa-angle-left"></i>
          </button>

          <div className="staff-children-pagination-info">
            <span className="staff-children-current-page">{currentPage}</span>
            <span className="staff-children-total-pages">/ {totalPages}</span>
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="staff-children-pagination-button"
          >
            <i className="fas fa-angle-right"></i>
          </button>
          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="staff-children-pagination-button staff-children-last-page"
          >
            <i className="fas fa-angle-double-right"></i>
          </button>
        </div>
      )}

      {/* Child detail modal */}
      {selectedChild && (
        <ChildDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          child={selectedChild}
        />
      )}
    </div>
  );
};

export default ChildrenManagement;