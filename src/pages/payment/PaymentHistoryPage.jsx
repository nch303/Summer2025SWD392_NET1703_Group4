import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getUserPaymentHistory, getChildPaymentHistory } from './PaymentHistoryService';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import './PaymentHistoryPage.css';
import { useUser } from '../../contexts/UserContext';

const PaymentHistoryPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const toast = useCustomToast();
  const { currentUser } = useUser();

  const [payments, setPayments] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(childId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const paymentsPerPage = 5;
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [showStats, setShowStats] = useState(true);

  // Format currency to VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'hoàn thành':
        return <span className="payment-status payment-status-completed">Completed</span>;
      case 'pending':
      case 'chờ xử lý':
        return <span className="payment-status payment-status-pending">Pending</span>;
      case 'cancelled':
      case 'hủy':
        return <span className="payment-status payment-status-cancelled">Cancelled</span>;
      case 'failed':
      case 'thất bại':
        return <span className="payment-status payment-status-failed">Failed</span>;
      case 'refunded':
        return <span className="payment-status payment-status-refunded">Refunded</span>;
      default:
        return <span className="payment-status">{status}</span>;
    }
  };

  // Total amount paid
  const getTotalPaid = () => {
    return payments
      .filter(payment =>
        payment.status?.toLowerCase() === 'completed' ||
        payment.status?.toLowerCase() === 'success' ||
        payment.status?.toLowerCase() === 'hoàn thành')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  };

  // Fetch payment history and update state
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoading(true);
      try {
        let paymentData;

        if (selectedChild && selectedChild !== 'all') {
          paymentData = await getChildPaymentHistory(selectedChild);
        } else {
          paymentData = await getUserPaymentHistory(currentUser?.id);
        }

        if (paymentData && Array.isArray(paymentData)) {
          setFilteredPayments(paymentData); // Set initial data
          setPayments(paymentData);
          setTotalPages(Math.ceil(paymentData.length / paymentsPerPage));
        } else {
          setFilteredPayments([]);
          setPayments([]);
          setTotalPages(0);
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
        toast.error('Cannot load payment history. Please try again later.');
        setFilteredPayments([]);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchPaymentHistory();
    }
  }, [selectedChild, currentUser]);

  // Separate the filter data into a separate effect to avoid calling the API again
  useEffect(() => {
    const filterPayments = () => {
      // Only filter if there is data
      if (payments.length === 0) return;

      let filteredPayments = [...payments];

      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredPayments = filteredPayments.filter(payment =>
          // Search in the description
          payment.description?.toLowerCase().includes(term) ||
          payment.name?.toLowerCase().includes(term) ||

          // Search in the payment method
          (payment.paymentMethod?.toLowerCase().includes(term)) ||

          // Search by child name
          payment.childrenName?.toLowerCase().includes(term) ||
          payment.childName?.toLowerCase().includes(term) ||

          // Search by parent name
          payment.parentName?.toLowerCase().includes(term) ||

          // Search by transaction ID
          payment.id?.toLowerCase().includes(term)
        );
      }

      // Date range filter
      if (startDate) {
        const start = new Date(startDate);
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = new Date(payment.date || payment.paymentDate);
          return paymentDate >= start;
        });
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // End of the day (23:59:59)
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = new Date(payment.date || payment.paymentDate);
          return paymentDate <= end;
        });
      }

      // Sort payments by date (newest first) (descending order)
      filteredPayments.sort((a, b) => {
        const dateA = new Date(a.date || a.paymentDate);
        const dateB = new Date(b.date || b.paymentDate);
        return dateB - dateA;
      });

      setFilteredPayments(filteredPayments);
      setTotalPages(Math.ceil(filteredPayments.length / paymentsPerPage));
      setCurrentPage(1); // Reset to first page when filtering (page 1)
    };

    filterPayments();
  }, [searchTerm, startDate, endDate, payments]);

  // Handle child selection change
  const handleChildChange = (e) => {
    const value = e.target.value;
    setSelectedChild(value);
    setCurrentPage(1); // Reset to first page when changing child (page 1)

    // Update URL if a specific child is selected
    if (value && value !== 'all') {
      navigate(`/payment-history/${value}`);
    } else {
      navigate('/payment-history');
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching (page 1)
  };

  // Handle date filter changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  };

  // Calculate current payments to display based on pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedChild('all');
    navigate('/payment-history');
  };

  // Add this function to the component
  const shortenTransactionId = (id) => {
    if (!id) return 'N/A';

    // If id is a UUID (dash-separated)
    if (id.includes('-')) {
      const parts = id.split('-');
      return `${parts[0].slice(0, 6)}...${parts[parts.length - 1].slice(-4)}`;
    }

    // If id is a long string
    if (id.length > 10) {
      return `${id.slice(0, 6)}...${id.slice(-4)}`;
    }

    return id;
  };

  return (
    <div className="payment-history-page">
      <ProcessingSpinner isVisible={loading} message="Loading payment history..." />

      <div className="payment-history-container">
        <div className="payment-header">
          <h1 className="payment-history-title">Payment history</h1>
        </div>

        {showStats && payments.length > 0 && (
          <div className="payment-stats-container">
            <div className="payment-stats-cards">
              <div className="payment-stat-card payment-total-card">
                <div className="payment-stat-card-icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <div className="payment-stat-card-content">
                  <h3>Total paid</h3>
                  <p className="payment-stat-value">{formatCurrency(getTotalPaid())}</p>
                </div>
              </div>

              <div className="payment-stat-card payment-count-card">
                <div className="payment-stat-card-icon">
                  <i className="fas fa-receipt"></i>
                </div>
                <div className="payment-stat-card-content">
                  <h3>Total transactions</h3>
                  <p className="payment-stat-value">{payments.length}</p>
                </div>
              </div>

              <div className="payment-stat-card payment-complete-card">
                <div className="payment-stat-card-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="payment-stat-card-content">
                  <h3>Completed</h3>
                  <p className="payment-stat-value">
                    {payments.filter(p =>
                      p.status?.toLowerCase() === 'completed' ||
                      p.status?.toLowerCase() === 'success' ||
                      p.status?.toLowerCase() === 'hoàn thành'
                    ).length}
                  </p>
                </div>
              </div>

              <div className="payment-stat-card payment-pending-card">
                <div className="payment-stat-card-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="payment-stat-card-content">
                  <h3>Pending</h3>
                  <p className="payment-stat-value">
                    {payments.filter(p =>
                      p.status?.toLowerCase() === 'pending' ||
                      p.status?.toLowerCase() === 'chờ xử lý'
                    ).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="payment-filters">
          <div className="payment-filter-row">
            <div className="payment-filter-group">
              <label htmlFor="childFilter">
                <i className="fas fa-child"></i> Child:
              </label>
              <select
                id="childFilter"
                className="payment-filter-select"
                value={selectedChild}
                onChange={handleChildChange}
              >
                <option value="all">All</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="payment-filter-group payment-search-group">
              <div className="payment-search-wrapper">
                <input
                  type="text"
                  placeholder="Search by child name, transaction ID..."
                  className="payment-search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Just reuse the existing filter logic by triggering a state update (searchTerm)
                      setSearchTerm(searchTerm);
                    }
                  }}
                />
                <button className="payment-search-button" onClick={() => setSearchTerm(searchTerm)}>
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="payment-filter-row">
            <div className="payment-filter-group payment-date-group">
              <label htmlFor="startDate">
                <i className="fas fa-calendar-alt"></i> From:
              </label>
              <input
                type="date"
                id="startDate"
                className="payment-date-input"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>

            <div className="payment-filter-group payment-date-group">
              <label htmlFor="endDate">
                <i className="fas fa-calendar-alt"></i> To:
              </label>
              <input
                type="date"
                id="endDate"
                className="payment-date-input"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>

            <button
              className="payment-filter-clear-button"
              onClick={clearFilters}
            >
              <i className="fas fa-times"></i> Clear
            </button>
          </div>
        </div>

        {/* Payment Table */}
        <div className="payment-table-container">
          {filteredPayments.length > 0 ? (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Payment date</th>
                  <th>Child</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map(payment => (
                  <tr key={payment.id} className={`payment-row payment-status-${payment.status?.toLowerCase()}`}>
                    <td className="payment-id">
                      <span title={payment.id}>{shortenTransactionId(payment.id)}</span>
                    </td>
                    <td>
                      <div className="payment-date">
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(payment.date || payment.paymentDate)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="payment-child">
                        <span className="payment-child-avatar">{payment.childrenName?.charAt(0) || payment.childName?.charAt(0) || '?'}</span>
                        <span>{payment.childrenName || payment.childName}</span>
                      </div>
                    </td>
                    <td className="payment-description">{payment.description || payment.name}</td>
                    <td className="payment-amount">{formatCurrency(payment.amount)}</td>
                    <td>
                      <div className="payment-method">
                        <i className={`fas ${payment.paymentMethod?.toLowerCase().includes('card') ? 'fa-credit-card' :
                            payment.paymentMethod?.toLowerCase().includes('cash') ? 'fa-money-bill-wave' :
                              payment.paymentMethod?.toLowerCase().includes('transfer') ? 'fa-university' :
                                'fa-money-check'
                          }`}></i>
                        <span>{payment.paymentMethod || 'VNPay'}</span>
                      </div>
                    </td>
                    <td>{getStatusLabel(payment.status)}</td>
                    <td>
                      <Link
                        to={`/invoice-detail/${payment.id}`}
                        className="payment-detail-link"
                      >
                        <i className="fas fa-file-invoice"></i> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="payment-no-payments">
              <i className="fas fa-search"></i>
              <p>{loading ? 'Loading...' : 'No payment data.'}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="payment-pagination">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className="payment-pagination-button payment-first-page"
              title="First page"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="payment-pagination-button"
              title="Previous page"
            >
              <i className="fas fa-angle-left"></i>
            </button>

            <div className="payment-pagination-info">
              <span className="payment-current-page">{currentPage}</span>
              <span className="payment-total-pages">/ {totalPages}</span>
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="payment-pagination-button"
              title="Next page"
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
              className="payment-pagination-button payment-last-page"
              title="Last page"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
