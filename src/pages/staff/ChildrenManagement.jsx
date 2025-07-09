// src/pages/staff-children-management/ChildrenManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllChildren } from '../../services/StaffService';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import ChildDetailModal from './ChildDetailModal';
import styles from './ChildrenManagement.module.css';

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
    <div className={styles.staffChildrenPage}>
      <ProcessingSpinner isVisible={loading} message="Loading student list..." />

      <div className={styles.staffChildrenFilters}>
        <div className={styles.staffChildrenFilterRow}>
          <div className={`${styles.staffChildrenFilterGroup} ${styles.staffChildrenSearchGroup}`}>
            <input
              type="text"
              placeholder="Search by name or parent..."
              className={styles.staffChildrenSearchInput}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className={styles.staffChildrenFilterGroup}>
            <label htmlFor="genderFilter">Gender:</label>
            <select
              id="genderFilter"
              className={styles.staffChildrenFilterSelect}
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
            className={styles.staffChildrenFilterResetButton}
            onClick={handleResetFilters}
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      <div className={styles.staffChildrenStats}>
        <div className={styles.staffChildrenStatCard}>
          <div className={styles.staffChildrenStatTitle}>Total students</div>
          <div className={styles.staffChildrenStatValue}>{children.length}</div>
        </div>
        <div className={styles.staffChildrenStatCard}>
          <div className={styles.staffChildrenStatTitle}>Male students</div>
          <div className={styles.staffChildrenStatValue}>
            {children.filter(child => child.gender === 'Male').length}
          </div>
        </div>
        <div className={styles.staffChildrenStatCard}>
          <div className={styles.staffChildrenStatTitle}>Female students</div>
          <div className={styles.staffChildrenStatValue}>
            {children.filter(child => child.gender === 'Female').length}
          </div>
        </div>
      </div>

      <div className={styles.staffChildrenTableContainer}>
        {currentChildren.length > 0 ? (
          <table className={styles.staffChildrenTable}>
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
                  <td className={styles.staffChildrenChildName}>{child.name}</td>
                  <td className={styles.staffChildrenChildAvatar}>
                    {child.avatar ? (
                      <img
                        src={child.avatar}
                        alt={`Avatar of ${child.name}`}
                        onError={(e) => { e.target.src = '/images/default-avatar.png'; }}
                      />
                    ) : (
                      <div className={styles.staffChildrenAvatarPlaceholder}>
                        {child.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className={styles.staffChildrenBirthInfo}>
                      <div>{formatDate(child.birthday)}</div>
                      <div className={styles.staffChildrenAge}>{calculateAge(child.birthday)} years</div>
                    </div>
                  </td>
                  <td>{getGenderDisplay(child.gender)}</td>
                  <td>{child.city || 'Not specified'}</td>
                  <td className={styles.staffChildrenActionsCell}>
                    <button
                      className={`${styles.staffChildrenActionBtn} ${styles.staffChildrenViewBtn}`}
                      onClick={() => handleViewDetails(child)}
                      title="View details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <Link
                      to={`/staff/children/edit/${child.id}`}
                      className={`${styles.staffChildrenActionBtn} ${styles.staffChildrenEditBtn}`}
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <button
                      className={`${styles.staffChildrenActionBtn} ${styles.staffChildrenDeleteBtn}`}
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
          <div className={styles.staffChildrenNoData}>
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
        <div className={styles.staffChildrenPagination}>
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className={`${styles.staffChildrenPaginationButton} ${styles.staffChildrenFirstPage}`}
          >
            <i className="fas fa-angle-double-left"></i>
          </button>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.staffChildrenPaginationButton}
          >
            <i className="fas fa-angle-left"></i>
          </button>

          <div className={styles.staffChildrenPaginationInfo}>
            <span className={styles.staffChildrenCurrentPage}>{currentPage}</span>
            <span className={styles.staffChildrenTotalPages}>/ {totalPages}</span>
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.staffChildrenPaginationButton}
          >
            <i className="fas fa-angle-right"></i>
          </button>
          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className={`${styles.staffChildrenPaginationButton} ${styles.staffChildrenLastPage}`}
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