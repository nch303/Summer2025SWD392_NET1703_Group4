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
  const [invoiceInfo, setInvoiceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
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

  // Handle print invoice
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Invoice-${invoiceId}`,
    onAfterPrint: () => toast.success('Đã chuẩn bị tệp in!')
  });

  // Calculate total amount
  const calculateTotal = () => {
    return invoiceDetails.reduce((sum, item) => sum + (item.price || 0), 0);
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

  return (
    <div className="invoice-detail-page">
      <ProcessingSpinner isVisible={loading} message="Đang tải thông tin hóa đơn..." />
      
      <div className="invoice-detail-container">
        <div className="invoice-actions">
          <button onClick={handleGoBack} className="invoice-back-button">
            <i className="fas fa-arrow-left"></i> Trở lại
          </button>
          <div className="invoice-actions-right">
            <button 
              type="button" 
              className="invoice-action-button invoice-print-button" 
              onClick={handleDownloadPdf}
              disabled={loading || pdfLoading}
            >
              <i className="fas fa-file-pdf"></i> {pdfLoading ? 'Đang tải...' : 'Tải hóa đơn PDF'}
            </button>
          </div>
        </div>
        
        <div className="invoice-detail-card" ref={printComponentRef}>
          <div className="invoice-compact-layout">
            {/* Header và thông tin cơ bản - sử dụng invoiceInfo */}
            <div className="invoice-header-compact">
              <div className="left-section">
                <div className="company-logo">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                </div>
                <div className="invoice-info">
                  <h2>Little Stars Preschool</h2>
                  <p>Mã hóa đơn: <strong>{invoiceInfo?.id || 'N/A'}</strong></p>
                  <p>Ngày: <strong>{invoiceInfo?.date ? formatDate(invoiceInfo.date) : 'N/A'}</strong></p>
                  <p>Học sinh: <strong>{invoiceInfo?.childrenName || 'N/A'}</strong></p>
                  <p>Phụ huynh: <strong>{invoiceInfo?.parentName || 'N/A'}</strong></p>
                </div>
              </div>
              <div className="right-section">
                <h1 className="invoice-title">HÓA ĐƠN</h1>
                <div className="invoice-status-compact">
                  <span className={`status-badge ${
                    invoiceInfo?.status?.toLowerCase() === 'success' ? 'status-success' : 
                    invoiceInfo?.status?.toLowerCase() === 'pending' ? 'status-pending' : 
                    'status-other'
                  }`}>
                    <i className={`fas ${
                      invoiceInfo?.status?.toLowerCase() === 'success' ? 'fa-check-circle' : 
                      invoiceInfo?.status?.toLowerCase() === 'pending' ? 'fa-clock' :
                      'fa-info-circle'
                    }`}></i> 
                    {invoiceInfo?.status === 'Success' ? 'Đã thanh toán' : 
                     invoiceInfo?.status === 'Pending' ? 'Chờ thanh toán' : 
                     invoiceInfo?.status || 'Không xác định'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Chi tiết thanh toán */}
            <div className="invoice-content">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th width="5%">#</th>
                    <th className="text-left" width="65%">Chương trình</th>
                    <th className="text-right" width="30%">Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceDetails.map((item, index) => (
                    <tr key={`${item.invoiceID}-${index}`}>
                      <td>{index + 1}</td>
                      <td className="text-left">{item.programName}</td>
                      <td className="text-right">{formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2" className="text-right"><strong>Tổng cộng:</strong></td>
                    <td className="text-right total-amount">{formatCurrency(calculateTotal())}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Footer nhỏ gọn */}
            <div className="invoice-footer-compact">
              <div className="footer-info">
                <p><i className="fas fa-info-circle"></i> Cảm ơn phụ huynh đã thanh toán học phí đúng hạn.</p>
                <p><i className="fas fa-exclamation-circle"></i> Học phí đã thanh toán không được hoàn trả trừ trường hợp đặc biệt.</p>
              </div>
              
              <div className="footer-signatures">
                <div className="signature">
                  <div className="signature-line"></div>
                  <span>Người lập hóa đơn</span>
                </div>
                <div className="signature">
                  <div className="signature-line"></div>
                  <span>Phụ huynh</span>
                </div>
                <div className="barcode-compact">
                  <svg viewBox="0 0 100 30">
                    {[...Array(20)].map((_, i) => (
                      <rect key={i} x={i * 5} y={0} width={Math.random() > 0.3 ? 3 : 1} height="30" fill="#333" />
                    ))}
                  </svg>
                </div>
              </div>
              
              <div className="school-contact">
                <p>Little Stars Preschool | 123 Đường Giáo Dục, TP. HCM | Tel: 028-1234-5678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;