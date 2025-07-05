import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getAwaitingRefundInvoices, processRefund } from './StaffRefundService';
import ProcessingSpinner from '../../components/spinner/ProcessingSpinner';
import './StaffRefundList.css';

const StaffRefundList = () => {
  const [refundInvoices, setRefundInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedInvoices, setPaginatedInvoices] = useState([]);

  const fetchRefundInvoices = async () => {
    setLoading(true);
    try {
      const data = await getAwaitingRefundInvoices();
      setRefundInvoices(data || []);
      setFilteredInvoices(data || []);
    } catch (error) {
      setMessage({ text: 'Error fetching refund invoices', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundInvoices();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, dateRange, minAmount, maxAmount]);
  
  // Update paginated invoices whenever filtered invoices or pagination settings change
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedInvoices(filteredInvoices.slice(startIndex, endIndex));
    
    // Reset to page 1 if the current page would be empty
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const handleProcessRefund = async (invoiceId) => {
    setProcessing(true);
    try {
      await processRefund(invoiceId);
      setMessage({ text: 'Refund processed successfully', type: 'success' });
      // Refresh the list after processing
      fetchRefundInvoices();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      setMessage({ text: 'Error processing refund', type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSearch = () => {
    let filtered = [...refundInvoices];
    
    // Text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => 
        (invoice.name && invoice.name.toLowerCase().includes(term)) ||
        (invoice.parentName && invoice.parentName.toLowerCase().includes(term)) ||
        (invoice.childrenName && invoice.childrenName.toLowerCase().includes(term)) ||
        (invoice.id && invoice.id.toLowerCase().includes(term))
      );
    }
    
    // Date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filtered = filtered.filter(invoice => new Date(invoice.date) >= fromDate);
    }
    
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(invoice => new Date(invoice.date) <= toDate);
    }
    
    // Amount range filter
    if (minAmount) {
      const min = parseFloat(minAmount);
      filtered = filtered.filter(invoice => Math.abs(invoice.amount) >= min);
    }
    
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      filtered = filtered.filter(invoice => Math.abs(invoice.amount) <= max);
    }
    
    setFilteredInvoices(filtered);
    setCurrentPage(1); // Reset to page 1 whenever search results change
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
    setMinAmount('');
    setMaxAmount('');
    setFilteredInvoices(refundInvoices);
    setCurrentPage(1);
  };

  const formatAmount = (amount) => {
    return Math.abs(amount).toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to page 1 when changing items per page
  };
  
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  
  // Generate page numbers for pagination display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are less than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      if (currentPage <= 3) {
        // If current page is near the start
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // If current page is near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // If current page is in the middle
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="refund-list-container">
      <div className="refund-header">
        <div className="refund-title-section">
          <h1>Refund Management</h1>
          <p className="refund-subtitle">Manage awaiting refund requests</p>
        </div>
        
        <button 
          className="refund-refresh-button"
          onClick={fetchRefundInvoices}
          disabled={loading || processing}
        >
          <FontAwesomeIcon icon="sync" className={loading ? 'fa-spin' : ''} /> 
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {message.text && (
        <div className={`refund-message ${message.type} refund-message-animated`}>
          <FontAwesomeIcon 
            icon={message.type === 'success' ? 'check-circle' : 'exclamation-circle'} 
          /> 
          {message.text}
          <button 
            className="refund-close-message" 
            onClick={() => setMessage({ text: '', type: '' })}
          >
            <FontAwesomeIcon icon="times" />
          </button>
        </div>
      )}

      <div className="refund-search-section">
        <div className="refund-search-container">
          <div className="refund-search-row">
            <div className="refund-search-field">
              <label htmlFor="searchTerm">
                <FontAwesomeIcon icon="search" /> Search
              </label>
              <input
                id="searchTerm"
                type="text"
                placeholder="Search by name, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="refund-search-input"
              />
            </div>

            <div className="refund-amount-range">
              <label>
                <FontAwesomeIcon icon="money-bill-wave" /> Amount Range
              </label>
              <div className="refund-range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="refund-amount-input"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="refund-amount-input"
                />
              </div>
            </div>
          </div>

          <div className="search-row">
            <div className="refund-date-range">
              <label>
                <FontAwesomeIcon icon="calendar-alt" /> Date Range
              </label>
              <div className="refund-date-inputs">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="refund-date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="refund-date-input"
                />
                <button className="refund-clear-filters" onClick={clearFilters}>
                <FontAwesomeIcon icon="times-circle" /> Clear Filters
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="refund-loading-container">
          <ProcessingSpinner />
          <p>Loading refund list...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="refund-no-data">
          <FontAwesomeIcon icon="info-circle" size="2x" />
          <p>{refundInvoices.length === 0 ? 
            'No refund invoices found' : 
            'No results match your search criteria'}
          </p>
          {refundInvoices.length > 0 && 
            <button className="refund-reset-search" onClick={clearFilters}>
              Reset filters
            </button>
          }
        </div>
      ) : (
        <>
          <div className="refund-results-summary">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredInvoices.length)} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} refund requests
          </div>
          
          <div className="refund-table-container">
            <table className="refund-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Name</th>
                  <th>Parent</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="refund-invoice-row">
                    <td>
                      <div className="refund-id-cell">
                        {invoice.id.substring(0, 8)}...
                      </div>
                    </td>
                    <td>{invoice.name}</td>
                    <td>{invoice.parentName || 'N/A'}</td>
                    <td>{invoice.childrenName || 'N/A'}</td>
                    <td className="refund-amount">{formatAmount(invoice.amount)}</td>
                    <td>{formatDate(invoice.date)}</td>
                    <td>
                      {invoice.status === 'Awaiting' ? (
                        <span className="refund-status refund-awaiting-refund">
                          <FontAwesomeIcon icon="clock" /> {invoice.status}
                        </span>
                      ) : (
                        <span className="refund-status refund-processed-refund">
                          <FontAwesomeIcon icon="check-circle" /> {invoice.status}
                        </span>
                      )}
                    </td>
                    <td>
                      {invoice.status === 'Awaiting' ? (
                      <button 
                        className="refund-process-refund-button"
                        onClick={() => handleProcessRefund(invoice.id)}
                        disabled={processing}
                      >
                        {processing ? (
                          <>
                            <FontAwesomeIcon icon="spinner" spin /> Processing
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon="hand-holding-dollar" /> Process
                          </>
                        )}
                      </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination controls */}
          <div className="refund-pagination">
            <div className="refund-pagination-info">
              <select 
                className="refund-pagination-select" 
                value={itemsPerPage} 
                onChange={handleItemsPerPageChange}
              >
                <option value="5">5 / page</option>
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </select>
            </div>
            
            <div className="refund-pagination-controls">
              <button 
                className="refund-pagination-btn" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
              >
                <FontAwesomeIcon icon="angle-double-left" />
              </button>
              
              <button 
                className="refund-pagination-btn" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <FontAwesomeIcon icon="angle-left" />
              </button>
              
              <div className="refund-pagination-pages">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? 
                    <span key={`ellipsis-${index}`} className="refund-pagination-ellipsis">...</span> :
                    <button 
                      key={`page-${page}`}
                      className={`refund-pagination-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                ))}
              </div>
              
              <button 
                className="refund-pagination-btn" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <FontAwesomeIcon icon="angle-right" />
              </button>
              
              <button 
                className="refund-pagination-btn" 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(totalPages)}
              >
                <FontAwesomeIcon icon="angle-double-right" />
              </button>
            </div>
          </div>
        </>
      )}

      {processing && <ProcessingSpinner overlay />}
    </div>
  );
};

export default StaffRefundList;
