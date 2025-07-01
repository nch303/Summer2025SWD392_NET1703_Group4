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
      toast.success('In hóa đơn thành công!');
    }
  });

  // Calculate total amount from parsed line items
  const calculateTotal = () => {
    return parsedLineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  // Thêm hàm xử lý riêng
  const handleGoBack = () => {
    safeNavigate('/payment-history');
  };

  // Thêm hàm xử lý tải PDF
  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      const pdfBlob = await downloadInvoicePdf(invoiceId);
      
      // Tạo URL tạm thời từ blob
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      // Tạo thẻ a và trigger sự kiện click để tải xuống
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Dọn dẹp URL tạm thời
      window.URL.revokeObjectURL(pdfUrl);
      document.body.removeChild(link);
      
      toast.success('Đã tải xuống hóa đơn thành công!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Không thể tải xuống hóa đơn. Vui lòng thử lại sau.');
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
        // Tách 2 API call để xử lý lỗi riêng biệt
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
          // Bỏ qua lỗi cancel
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
          // Bỏ qua lỗi cancel
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
        
        // Dùng function form để tránh phụ thuộc vào toast
        if (isMounted) {
          toast.error('Có lỗi xảy ra khi tải thông tin hóa đơn.');
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
        label: 'Đã thanh toán',
        icon: 'fa-check-circle',
        color: 'var(--success-color)',
        bgColor: 'rgba(76, 175, 80, 0.1)',
        class: 'status-success'
      };
    } else if (status === 'pending') {
      return {
        label: 'Chờ thanh toán',
        icon: 'fa-clock',
        color: 'var(--warning-color)',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        class: 'status-pending'
      };
    } else if (status === 'failed') {
      return {
        label: 'Thanh toán thất bại',
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
      <ProcessingSpinner isVisible={loading} message="Đang tải thông tin hóa đơn..." />
      
      <div className="invoice-detail-container">
        <div className={`invoice-premium-actions ${isVisible ? 'visible' : ''}`}>
          <button onClick={handleGoBack} className="invoice-back-button">
            <i className="fas fa-arrow-left"></i> Trở lại
          </button>
          <div className="invoice-actions-right">
            <button 
              type="button" 
              className="invoice-action-button invoice-print-button"
              onClick={handlePrint}
              disabled={loading || printLoading}
            >
              <i className={`fas ${printLoading ? 'fa-spinner fa-spin' : 'fa-print'}`}></i> 
              {printLoading ? 'Đang in...' : 'In hóa đơn'}
            </button>
            <button 
              type="button" 
              className="invoice-action-button invoice-download-button" 
              onClick={handleDownloadPdf}
              disabled={loading || pdfLoading}
            >
              <i className={`fas ${pdfLoading ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i> 
              {pdfLoading ? 'Đang tải...' : 'Tải PDF'}
            </button>
          </div>
        </div>
        
        <div className={`invoice-premium-card ${isVisible ? 'visible' : ''}`} ref={printComponentRef}>
          {/* Watermark */}
          <div className="invoice-watermark">
            {status && status.label === 'Đã thanh toán' ? (
              <div className="paid-watermark">
                <span>ĐÃ THANH TOÁN</span>
              </div>
            ) : status && status.label === 'Thanh toán thất bại' ? (
              <div className="failed-watermark">
                <span>THANH TOÁN THẤT BẠI</span>
              </div>
            ) : status && status.label === 'Chờ thanh toán' ? (
              <div className="pending-watermark">
                <span>CHỜ THANH TOÁN</span>
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
              <h2>HÓA ĐƠN</h2>
              <div className="invoice-premium-details">
                <div className="invoice-detail-item">
                  <span className="label">Mã hóa đơn:</span>
                  <span className="value">{invoiceInfo?.id || 'N/A'}</span>
                </div>
                <div className="invoice-detail-item">
                  <span className="label">Ngày lập:</span>
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
              <h3>Thông tin khách hàng</h3>
            </div>
            <div className="customer-info-grid">
              <div className="customer-info-item">
                <span className="label">Học sinh:</span>
                <span className="value highlight">{invoiceInfo?.childrenName || 'N/A'}</span>
              </div>
              <div className="customer-info-item">
                <span className="label">Phụ huynh:</span>
                <span className="value">{invoiceInfo?.parentName || 'N/A'}</span>
              </div>
              <div className="customer-info-item">
                <span className="label">Email:</span>
                <span className="value">{invoiceInfo?.parentEmail || 'N/A'}</span>
              </div>
              <div className="customer-info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{invoiceInfo?.parentPhone || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Invoice items table */}
          <div className="invoice-items-section">
            <div className="section-title">
              <i className="fas fa-file-invoice-dollar"></i>
              <h3>Chi tiết thanh toán</h3>
            </div>
            <div className="premium-table-container">
              <table className="premium-invoice-table">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th className="text-left" width="65%">Nội dung</th>
                    <th className="text-center" width="30%">Đơn giá</th>
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
                    <td colSpan="2" className="text-right"><strong>Tổng cộng:</strong></td>
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
                <p>Hóa đơn này là bằng chứng thanh toán chính thức từ Little Stars Preschool.</p>
              </div>
              <div className="note-item">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Học phí đã thanh toán không được hoàn trả trừ trường hợp đặc biệt được quy định trong điều khoản.</p>
              </div>
            </div>
            
            <div className="footer-signatures">
              <div className="signature-block">
                <div className="signature-line"></div>
                <p className="signature-title">Người lập hóa đơn</p>
              </div>
              <div className="signature-block">
                <div className="signature-line"></div>
                <p className="signature-title">Phụ huynh</p>
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
              <p>© {new Date().getFullYear()} Little Stars Preschool - Tất cả các quyền được bảo lưu</p>
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