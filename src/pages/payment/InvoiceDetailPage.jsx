import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getInvoiceDetails, 
  downloadInvoicePdf, 
  getInvoiceInfo 
} from './InvoiceDetailService';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import { useReactToPrint } from 'react-to-print';
import './InvoiceDetailPage.css';

const InvoiceDetailPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const toast = useCustomToast();
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [parsedLineItems, setParsedLineItems] = useState([]);
  const [invoiceInfo, setInvoiceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const printComponentRef = useRef();
  const isMountedRef = useRef(true);

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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Parse the description field to extract line items
  const parseDescriptionLineItems = (description) => {
    if (!description) return [];
    
    const lines = description.split('\n');
    return lines.map(line => {
      // Extract item name and amount using regex
      const match = line.match(/- (.+?)\s*\(([0-9.,]+)\s*đồng\)/i);
      if (match) {
        const itemName = match[1].trim();
        // Remove dots and convert to number
        const amount = parseFloat(match[2].replace(/\./g, ''));
        return { itemName, amount };
      }
      return null;
    }).filter(item => item !== null);
  };

  // Handle print invoice
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Invoice-${invoiceId}`,
    onBeforePrint: () => setPrintLoading(true),
    onAfterPrint: () => {
      setPrintLoading(false);
      toast.success('Invoice printed successfully!');
    }
  });

  // Calculate total amount from parsed line items
  const calculateTotal = () => {
    return parsedLineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  // Add a custom function to handle going back
  const handleGoBack = () => {
    safeNavigate('/payment-history');
  };

  // Add a custom function to handle downloading the PDF
  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      const pdfBlob = await downloadInvoicePdf(invoiceId);
      
      // Create a temporary URL from the blob
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      // Create a temporary anchor tag and trigger the click event to download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(pdfUrl);
      document.body.removeChild(link);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Cannot download invoice. Please try again later.');
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchData = async () => {
      if (!invoiceId) return;
      
      setLoading(true);
      try {
        // Separate the 2 API calls to handle errors separately
        try {
          const detailsData = await getInvoiceDetails(invoiceId, controller.signal);
          if (isMounted && detailsData && Array.isArray(detailsData) && detailsData.length > 0) {
            setInvoiceDetails(detailsData);
            
            // Parse line items from description
            if (detailsData[0].description) {
              const lineItems = parseDescriptionLineItems(detailsData[0].description);
              setParsedLineItems(lineItems);
            }
          }
        } catch (error) {
          // Skip the cancel error
          if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
            console.error('Error fetching invoice details:', error);
          }
        }
        
        try {
          const invoiceData = await getInvoiceInfo(invoiceId);
          if (isMounted && invoiceData) {
            setInvoiceInfo(invoiceData);
          }
        } catch (error) {
          // Skip the cancel error
          if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
            console.error('Error fetching invoice info:', error);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
          console.log('Request cancelled');
          return;
        }
        
        // Use the function form to avoid depending on toast
        if (isMounted) {
          toast.error('An error occurred while loading invoice information.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setTimeout(() => setIsVisible(true), 100);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [invoiceId]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeNavigate = (path) => {
    if (isMountedRef.current) {
      navigate(path);
    }
  };

  // Get formatted status with icon and color
  const getStatusDisplay = () => {
    if (!invoiceInfo || !invoiceInfo.status) return null;
    
    const status = invoiceInfo.status.toLowerCase();
    
    if (status === 'success') {
      return {
        label: 'Paid',
        icon: 'fa-check-circle',
        color: 'var(--success-color)',
        bgColor: 'rgba(76, 175, 80, 0.1)',
        class: 'status-success'
      };
    } else if (status === 'pending') {
      return {
        label: 'Pending',
        icon: 'fa-clock',
        color: 'var(--warning-color)',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        class: 'status-pending'
      };
    } else if (status === 'failed') {
      return {
        label: 'Failed',
        icon: 'fa-times-circle',
        color: 'var(--danger-color)',
        bgColor: 'rgba(244, 67, 54, 0.1)',
        class: 'status-failed'
      };
    } else {
      return {
        label: invoiceInfo.status,
        icon: 'fa-info-circle',
        color: 'var(--text-medium)',
        bgColor: 'rgba(120, 144, 156, 0.1)',
        class: 'status-other'
      };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="invoice-detail-page">
      <ProcessingSpinner isVisible={loading} message="Loading invoice information..." />
      
      <div className="invoice-detail-container">
        <div className={`invoice-premium-actions ${isVisible ? 'visible' : ''}`}>
          <button onClick={handleGoBack} className="invoice-back-button">
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <div className="invoice-actions-right">
            <button 
              type="button" 
              className="invoice-action-button invoice-print-button"
              onClick={handlePrint}
              disabled={loading || printLoading}
            >
              <i className={`fas ${printLoading ? 'fa-spinner fa-spin' : 'fa-print'}`}></i> 
              {printLoading ? 'Printing...' : 'Print invoice'}
            </button>
            <button 
              type="button" 
              className="invoice-action-button invoice-download-button" 
              onClick={handleDownloadPdf}
              disabled={loading || pdfLoading}
            >
              <i className={`fas ${pdfLoading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i> 
              {pdfLoading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
        
        <div className={`invoice-premium-card ${isVisible ? 'visible' : ''}`} ref={printComponentRef}>
          {/* Watermark */}
          <div className="invoice-watermark">
            {status && status.label === 'Đã thanh toán' ? (
              <div className="paid-watermark">
                  <span>PAID</span>
              </div>
            ) : status && status.label === 'Failed' ? (
              <div className="failed-watermark">
                <span>FAILED</span>
              </div>
            ) : status && status.label === 'Pending' ? (
              <div className="pending-watermark">
                <span>PENDING</span>
              </div>
            ) : null}
          </div>
          
          {/* Top decoration */}
          <div className="invoice-top-decoration"></div>
          
          {/* Invoice header */}
          <div className="invoice-premium-header">
            <div className="invoice-brand">
              <div className="brand-logo">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                </svg>
              </div>
              <div className="brand-info">
                <h1>Little Stars Preschool</h1>
                <p>123 Đường Giáo Dục, Quận 1, TP. Hồ Chí Minh</p>
                <p>+84 28 1234 5678 | info@littlestars.edu.vn</p>
              </div>
            </div>
            <div className="invoice-premium-title">
              <h2>INVOICE</h2>
              <div className="invoice-premium-details">
                <div className="invoice-detail-item">
                  <span className="label">Invoice ID:</span>
                  <span className="value">{invoiceInfo?.id || 'N/A'}</span>
                </div>
                <div className="invoice-detail-item">
                  <span className="label">Date:</span>
                  <span className="value">{invoiceInfo?.date ? formatDate(invoiceInfo.date) : 'N/A'}</span>
                </div>
              </div>
              {status && (
                <div className={`invoice-premium-status ${status.class}`}>
                  <i className={`fas ${status.icon}`}></i>
                  <span>{status.label}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Customer information */}
          <div className="invoice-customer-section">
            <div className="section-title">
              <i className="fas fa-user-circle"></i>
              <h3>Customer information</h3>
            </div>
            <div className="customer-info-grid">
              <div className="customer-info-item">
                <span className="label">Child:</span>
                <span className="value highlight">{invoiceInfo?.childrenName || 'N/A'}</span>
              </div>
              <div className="customer-info-item">
                <span className="label">Parent:</span>
                <span className="value">{invoiceInfo?.parentName || 'N/A'}</span>
              </div>
              <div className="customer-info-item">
                <span className="label">Email:</span>
                <span className="value">{invoiceInfo?.parentEmail || 'N/A'}</span>
              </div>
              <div className="customer-info-item">
                <span className="label">Phone:</span>
                <span className="value">{invoiceInfo?.parentPhone || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Invoice items table */}
          <div className="invoice-items-section">
            <div className="section-title">
              <i className="fas fa-file-invoice-dollar"></i>
              <h3>Payment details</h3>
            </div>
            <div className="premium-table-container">
              <table className="premium-invoice-table">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th className="text-left" width="65%">Content</th>
                    <th className="text-center" width="30%">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedLineItems.length > 0 ? (
                    parsedLineItems.map((item, index) => (
                      <tr key={`line-item-${index}`} className="item-row">
                        <td>{index + 1}</td>
                        <td className="text-left item-name">{item.itemName}</td>
                        <td className="text-right item-price">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    invoiceDetails.map((item, index) => (
                      <tr key={`${item.invoiceID}-${index}`} className="item-row">
                        <td>{index + 1}</td>
                        <td className="text-left item-name">
                          {item.programName === null ? item.tuitionFeeName : item.programName}
                        </td>
                        <td className="text-right item-price">{formatCurrency(item.price)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="2" className="text-right"><strong>Total:</strong></td>
                    <td className="text-right total-amount">
                      {parsedLineItems.length > 0 
                        ? formatCurrency(calculateTotal())
                        : formatCurrency(invoiceDetails.reduce((sum, item) => sum + (item.price || 0), 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        
          {/* Footer */}
          <div className="invoice-premium-footer">
            <div className="footer-notes">
              <div className="note-item">
                <i className="fas fa-info-circle"></i>
                <p>This invoice is a proof of payment from Little Stars Preschool.</p>
              </div>
              <div className="note-item">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Tuition fees paid are not refundable except in special cases specified in the terms.</p>
              </div>
            </div>
            
            <div className="footer-signatures">
              <div className="signature-block">
                <div className="signature-line"></div>
                <p className="signature-title">Invoice maker</p>
              </div>
              <div className="signature-block">
                <div className="signature-line"></div>
                <p className="signature-title">Parent</p>
              </div>
            </div>
            
            <div className="invoice-barcode">
              <svg className="barcode-image" viewBox="0 0 200 40">
                {[...Array(40)].map((_, i) => (
                  <rect key={i} x={i * 5} y={0} width={Math.random() > 0.3 ? 2 : 1} height="40" fill="#333" />
                ))}
              </svg>
              <div className="invoice-id-display">{invoiceInfo?.id || 'N/A'}</div>
            </div>
            
            <div className="footer-contact">
              <p>© {new Date().getFullYear()} Little Stars Preschool - All rights reserved</p>
              <div className="social-icons">
                <i className="fab fa-facebook"></i>
                <i className="fab fa-instagram"></i>
                <i className="fab fa-youtube"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;