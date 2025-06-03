import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getUserPaymentHistory, getChildPaymentHistory } from './PaymentHistoryService';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import './PaymentHistoryPage.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PaymentHistoryPage = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const toast = useCustomToast();
  
  const [payments, setPayments] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(childId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const paymentsPerPage = 10;
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
      case 'completed':
      case 'hoàn thành':
        return <span className="payment-status payment-status-completed">Hoàn thành</span>;
      case 'pending':
      case 'chờ xử lý':
        return <span className="payment-status payment-status-pending">Chờ xử lý</span>;
      case 'cancelled':
      case 'hủy':
        return <span className="payment-status payment-status-cancelled">Đã hủy</span>;
      case 'failed':
      case 'thất bại':
        return <span className="payment-status payment-status-failed">Thất bại</span>;
      default:
        return <span className="payment-status">{status}</span>;
    }
  };
  // Fetch payment history
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoading(true);
      try {
        let paymentData;
        
        if (selectedChild && selectedChild !== 'all') {
          paymentData = await getChildPaymentHistory(selectedChild);
        } else {
          paymentData = await getUserPaymentHistory();
        }
        
        // Apply filters if any
        let filteredPayments = paymentData;
        
        // Search term filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredPayments = filteredPayments.filter(payment => 
            payment.description?.toLowerCase().includes(term) ||
            payment.paymentMethod?.toLowerCase().includes(term) ||
            payment.childName?.toLowerCase().includes(term) ||
            payment.invoiceNumber?.toLowerCase().includes(term)
          );
        }
        
        // Date range filter
        if (startDate) {
          const start = new Date(startDate);
          filteredPayments = filteredPayments.filter(payment => 
            new Date(payment.paymentDate) >= start
          );
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59); // End of the day
          filteredPayments = filteredPayments.filter(payment => 
            new Date(payment.paymentDate) <= end
          );
        }
        
        // Sort payments by date (newest first)
        filteredPayments.sort((a, b) => 
          new Date(b.paymentDate) - new Date(a.paymentDate)
        );
        
        setPayments(filteredPayments);
        setTotalPages(Math.ceil(filteredPayments.length / paymentsPerPage));
      } catch (error) {
        console.error('Error fetching payment history:', error);
        toast.error('Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [selectedChild]);

  // Tách việc filter dữ liệu thành effect riêng để không cần gọi API lại
  useEffect(() => {
    const filterPayments = () => {
      // Chỉ lọc nếu đã có dữ liệu
      if (payments.length === 0) return;
      
      let filteredPayments = [...payments];
      
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredPayments = filteredPayments.filter(payment => 
          payment.description?.toLowerCase().includes(term) ||
          payment.paymentMethod?.toLowerCase().includes(term) ||
          payment.childName?.toLowerCase().includes(term) ||
          payment.invoiceNumber?.toLowerCase().includes(term)
        );
      }
      
      // Date range filter
      if (startDate) {
        const start = new Date(startDate);
        filteredPayments = filteredPayments.filter(payment => 
          new Date(payment.paymentDate) >= start
        );
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // End of the day
        filteredPayments = filteredPayments.filter(payment => 
          new Date(payment.paymentDate) <= end
        );
      }
      
      setFilteredPayments(filteredPayments);
      setTotalPages(Math.ceil(filteredPayments.length / paymentsPerPage));
      setCurrentPage(1); // Reset to first page when filtering
    };
    
    filterPayments();
  }, [searchTerm, startDate, endDate, payments]);

  // Handle child selection change
  const handleChildChange = (e) => {
    const value = e.target.value;
    setSelectedChild(value);
    setCurrentPage(1); // Reset to first page when changing child
    
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
    setCurrentPage(1); // Reset to first page when searching
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

  // Tính toán thống kê thanh toán theo trạng thái
  const getPaymentStats = () => {
    if (payments.length === 0) return [];
    
    const statusCounts = payments.reduce((acc, payment) => {
      const status = payment.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const COLORS = {
      'completed': '#4CAF50',
      'hoàn thành': '#4CAF50',
      'pending': '#FF9800',
      'chờ xử lý': '#FF9800',
      'cancelled': '#9E9E9E',
      'hủy': '#9E9E9E',
      'failed': '#F44336',
      'thất bại': '#F44336',
      'unknown': '#2196F3'
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status === 'completed' || status === 'hoàn thành' ? 'Hoàn thành' :
            status === 'pending' || status === 'chờ xử lý' ? 'Chờ xử lý' :
            status === 'cancelled' || status === 'hủy' ? 'Đã hủy' :
            status === 'failed' || status === 'thất bại' ? 'Thất bại' : 'Khác',
      value: count,
      color: COLORS[status] || '#2196F3'
    }));
  };

  // Tổng số tiền đã thanh toán
  const getTotalPaid = () => {
    return payments
      .filter(payment => payment.status?.toLowerCase() === 'completed' || 
                         payment.status?.toLowerCase() === 'hoàn thành')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  };

  return (
    <div className="payment-history-page">
      <ProcessingSpinner isVisible={loading} message="Đang tải lịch sử thanh toán..." />
      
      <div className="payment-history-container">
        <div className="payment-header">
          <h1 className="payment-history-title">Lịch sử thanh toán</h1>
          <div className="payment-view-toggle">
            <button 
              className={`payment-view-toggle-btn ${showStats ? 'active' : ''}`}
              onClick={() => setShowStats(true)}
            >
              <i className="fas fa-chart-pie"></i> Thống kê
            </button>
            <button 
              className={`payment-view-toggle-btn ${!showStats ? 'active' : ''}`}
              onClick={() => setShowStats(false)}
            >
              <i className="fas fa-list"></i> Chi tiết
            </button>
          </div>
        </div>

        {showStats && payments.length > 0 && (
          <div className="payment-stats-container">
            <div className="payment-stats-cards">
              <div className="payment-stat-card payment-total-card">
                <div className="payment-stat-card-icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <div className="payment-stat-card-content">
                  <h3>Tổng đã thanh toán</h3>
                  <p className="payment-stat-value">{formatCurrency(getTotalPaid())}</p>
                </div>
              </div>
              
              <div className="payment-stat-card payment-count-card">
                <div className="payment-stat-card-icon">
                  <i className="fas fa-receipt"></i>
                </div>
                <div className="payment-stat-card-content">
                  <h3>Tổng giao dịch</h3>
                  <p className="payment-stat-value">{payments.length}</p>
                </div>
              </div>
              
              <div className="payment-stat-card payment-complete-card">
                <div className="payment-stat-card-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="payment-stat-card-content">
                  <h3>Hoàn thành</h3>
                  <p className="payment-stat-value">
                    {payments.filter(p => 
                      p.status?.toLowerCase() === 'completed' || 
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
                  <h3>Chờ xử lý</h3>
                  <p className="payment-stat-value">
                    {payments.filter(p => 
                      p.status?.toLowerCase() === 'pending' || 
                      p.status?.toLowerCase() === 'chờ xử lý'
                    ).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="payment-chart-container">
              <h3 className="payment-chart-title">Phân bố trạng thái thanh toán</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getPaymentStats()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {getPaymentStats().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} giao dịch`, 'Số lượng']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="payment-filters">
          <div className="payment-filter-row">
            <div className="payment-filter-group">
              <label htmlFor="childFilter">
                <i className="fas fa-child"></i> Trẻ:
              </label>
              <select 
                id="childFilter" 
                className="payment-filter-select" 
                value={selectedChild}
                onChange={handleChildChange}
              >
                <option value="all">Tất cả</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.fullName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="payment-filter-group payment-search-group">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="payment-search-input" 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div className="payment-filter-row">
            <div className="payment-filter-group payment-date-group">
              <label htmlFor="startDate">
                <i className="fas fa-calendar-alt"></i> Từ:
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
                <i className="fas fa-calendar-alt"></i> Đến:
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
              <i className="fas fa-times"></i> Xóa bộ lọc
            </button>
          </div>
        </div>
        
        {/* Payment Table */}
        <div className="payment-table-container">
          {filteredPayments.length > 0 ? (
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Mã giao dịch</th>
                  <th>Ngày thanh toán</th>
                  <th>Trẻ</th>
                  <th>Mô tả</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map(payment => (
                  <tr key={payment.id} className={`payment-row payment-status-${payment.status?.toLowerCase()}`}>
                    <td className="payment-id">{payment.invoiceNumber}</td>
                    <td>
                      <div className="payment-date">
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(payment.paymentDate)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="payment-child">
                        <span className="payment-child-avatar">{payment.childName?.charAt(0) || '?'}</span>
                        <span>{payment.childName}</span>
                      </div>
                    </td>
                    <td className="payment-description">{payment.description}</td>
                    <td className="payment-amount">{formatCurrency(payment.amount)}</td>
                    <td>
                      <div className="payment-method">
                        <i className={`fas ${
                          payment.paymentMethod?.toLowerCase().includes('card') ? 'fa-credit-card' :
                          payment.paymentMethod?.toLowerCase().includes('cash') ? 'fa-money-bill-wave' :
                          payment.paymentMethod?.toLowerCase().includes('transfer') ? 'fa-university' :
                          'fa-money-check'
                        }`}></i>
                        <span>{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td>{getStatusLabel(payment.status)}</td>
                    <td>
                      <Link 
                        to={`/payment-details/${payment.id}`} 
                        className="payment-detail-link"
                      >
                        <i className="fas fa-file-invoice"></i> Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="payment-no-payments">
              <i className="fas fa-search"></i>
              <p>{loading ? 'Đang tải...' : 'Không có dữ liệu thanh toán nào.'}</p>
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
              title="Trang đầu"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="payment-pagination-button"
              title="Trang trước"
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
              title="Trang sau"
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button 
              onClick={() => paginate(totalPages)} 
              disabled={currentPage === totalPages}
              className="payment-pagination-button payment-last-page"
              title="Trang cuối"
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
