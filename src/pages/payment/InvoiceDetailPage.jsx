import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getInvoiceDetails, 
  downloadInvoicePdf, 
  getInvoiceInfo 
} from '../../services/PaymentHistoryService';
import { ProcessingSpinner } from '../../components/spinner/ProcessingSpinner';
import { useCustomToast } from '../../components/toast/CustomToast';
import { useReactToPrint } from 'react-to-print';
import styles from './InvoiceDetailPage.module.css';

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
        statusClass: styles.statusSuccess
      };
    } else if (status === 'pending') {
      return {
        label: 'Pending',
        icon: 'fa-clock',
        color: 'var(--warning-color)',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        statusClass: styles.statusPending
      };
    } else if (status === 'failed') {
      return {
        label: 'Failed',
        icon: 'fa-times-circle',
        color: 'var(--danger-color)',
        bgColor: 'rgba(244, 67, 54, 0.1)',
        statusClass: styles.statusFailed
      };
    } else {
      return {
        label: invoiceInfo.status,
        icon: 'fa-info-circle',
        color: 'var(--text-medium)',
        bgColor: 'rgba(120, 144, 156, 0.1)',
        statusClass: styles.statusOther
      };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className={styles.invoiceDetailPage}>
      <ProcessingSpinner isVisible={loading} message="Loading invoice information..." />
      
      <div className={styles.invoiceDetailContainer}>
        <div className={`${styles.invoicePremiumActions} ${isVisible ? styles.visible : ''}`}>
          <button onClick={handleGoBack} className={styles.invoiceBackButton}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <div className={styles.invoiceActionsRight}>
            <button 
              type="button" 
              className={`${styles.invoiceActionButton} ${styles.invoicePrintButton}`}
              onClick={handlePrint}
              disabled={loading || printLoading}
            >
              <i className={`fas ${printLoading ? 'fa-spinner fa-spin' : 'fa-print'}`}></i> 
              {printLoading ? 'Printing...' : 'Print invoice'}
            </button>
            <button 
              type="button" 
              className={`${styles.invoiceActionButton} ${styles.invoiceDownloadButton}`} 
              onClick={handleDownloadPdf}
              disabled={loading || pdfLoading}
            >
              <i className={`fas ${pdfLoading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i> 
              {pdfLoading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>
        
        <div className={`${styles.invoicePremiumCard} ${isVisible ? styles.visible : ''}`} ref={printComponentRef}>
          {/* Watermark */}
          <div className={styles.invoiceWatermark}>
            {status && (
              <>
                {status.label === 'Paid' && (
                  <div className={styles.paidWatermark}>
                    <span>PAID</span>
                  </div>
                )}
                {status.label === 'Failed' && (
                  <div className={styles.failedWatermark}>
                    <span>FAILED</span>
                  </div>
                )}
                {status.label === 'Pending' && (
                  <div className={styles.pendingWatermark}>
                    <span>PENDING</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Top decoration */}
          <div className={styles.invoiceTopDecoration}></div>
          
          {/* Invoice header */}
          <div className={styles.invoicePremiumHeader}>
            <div className={styles.invoiceBrand}>
              <div className={styles.brandLogo}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                </svg>
              </div>
              <div className={styles.brandInfo}>
                <h1>Little Stars Preschool</h1>
                <p>123 Đường Giáo Dục, Quận 1, TP. Hồ Chí Minh</p>
                <p>+84 28 1234 5678 | info@littlestars.edu.vn</p>
              </div>
            </div>
            <div className={styles.invoicePremiumTitle}>
              <h2>INVOICE</h2>
              <div className={styles.invoicePremiumDetails}>
                <div className={styles.invoiceDetailItem}>
                  <span className={styles.label}>Invoice ID:</span>
                  <span className={styles.value}>{invoiceInfo?.id || 'N/A'}</span>
                </div>
                <div className={styles.invoiceDetailItem}>
                  <span className={styles.label}>Date:</span>
                  <span className={styles.value}>{invoiceInfo?.date ? formatDate(invoiceInfo.date) : 'N/A'}</span>
                </div>
              </div>
              {status && (
                <div className={`${styles.invoicePremiumStatus} ${status.statusClass}`}>
                  <i className={`fas ${status.icon}`}></i>
                  <span>{status.label}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Customer information */}
          <div className={styles.invoiceCustomerSection}>
            <div className={styles.invoiceDetailSectionTitle}>
              <i className="fas fa-user-circle"></i>
              <h3>Customer information</h3>
            </div>
            <div className={styles.customerInfoGrid}>
              <div className={styles.customerInfoItem}>
                <span className={styles.label}>Child:</span>
                <span className={`${styles.value} ${styles.highlight}`}>{invoiceInfo?.childrenName || 'N/A'}</span>
              </div>
              <div className={styles.customerInfoItem}>
                <span className={styles.label}>Parent:</span>
                <span className={styles.value}>{invoiceInfo?.parentName || 'N/A'}</span>
              </div>
              <div className={styles.customerInfoItem}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{invoiceInfo?.parentEmail || 'N/A'}</span>
              </div>
              <div className={styles.customerInfoItem}>
                <span className={styles.label}>Phone:</span>
                <span className={styles.value}>{invoiceInfo?.parentPhone || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Invoice items table */}
          <div className={styles.invoiceItemsSection}>
            <div className={styles.invoiceDetailSectionTitle}>
              <i className="fas fa-file-invoice-dollar"></i>
              <h3>Payment details</h3>
            </div>
            <div className={styles.premiumTableContainer}>
              <table className={styles.premiumInvoiceTable}>
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th className={styles.textLeft} width="65%">Content</th>
                    <th className={styles.textCenter} width="30%">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedLineItems.length > 0 ? (
                    parsedLineItems.map((item, index) => (
                      <tr key={`line-item-${index}`} className={styles.itemRow}>
                        <td>{index + 1}</td>
                        <td className={`${styles.itemName} ${styles.textLeft}`}>{item.itemName}</td>
                        <td className={`${styles.itemPrice} ${styles.textRight}`}>{formatCurrency(item.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    invoiceDetails.map((item, index) => (
                      <tr key={`${item.invoiceID}-${index}`} className={styles.itemRow}>
                        <td>{index + 1}</td>
                        <td className={`${styles.itemName} ${styles.textLeft}`}>
                          {item.programName === null ? item.tuitionFeeName : item.programName}
                        </td>
                        <td className={`${styles.itemPrice} ${styles.textRight}`}>{formatCurrency(item.price)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td colSpan="2" className={`${styles.textRight} ${styles.totalAmount}`}><strong>Total:</strong></td>
                    <td className={`${styles.textRight} ${styles.totalAmount}`}>
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
          <div className={styles.invoicePremiumFooter}>
            <div className={styles.footerNotes}>
              <div className={styles.noteItem}>
                <i className="fas fa-info-circle"></i>
                <p>This invoice is a proof of payment from Little Stars Preschool.</p>
              </div>
              <div className={styles.noteItem}>
                <i className="fas fa-exclamation-triangle"></i>
                <p>Tuition fees paid are not refundable except in special cases specified in the terms.</p>
              </div>
            </div>
            
            <div className={styles.footerSignatures}>
              <div className={styles.signatureBlock}>
                <div className={styles.signatureLine}></div>
                <p className={styles.signatureTitle}>Invoice maker</p>
              </div>
              <div className={styles.signatureBlock}>
                <div className={styles.signatureLine}></div>
                <p className={styles.signatureTitle}>Parent</p>
              </div>
            </div>
            
            <div className={styles.invoiceBarcode}>
              <svg className={styles.barcodeImage} viewBox="0 0 200 40">
                {[...Array(40)].map((_, i) => (
                  <rect key={i} x={i * 5} y={0} width={Math.random() > 0.3 ? 2 : 1} height="40" fill="#333" />
                ))}
              </svg>
              <div className={styles.invoiceIdDisplay}>{invoiceInfo?.id || 'N/A'}</div>
            </div>
            
            <div className={styles.footerContact}>
              <p>© {new Date().getFullYear()} Little Stars Preschool - All rights reserved</p>
              <div className={styles.socialIcons}>
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