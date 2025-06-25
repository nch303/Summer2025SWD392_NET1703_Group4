import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsDetailView } from './NewsService';
import './NewsDetailPage.css';
import { format } from 'date-fns';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const data = await getNewsDetailView(id);
        setNews(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load news details');
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="news-detail-container">
      {loading ? (
        <div className="news-detail-loading">
          <div className="news-detail-spinner"></div>
          <p>Loading news details...</p>
        </div>
      ) : error ? (
        <div className="news-detail-error">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <Link to="/news" className="news-detail-back-button">
            Return to News List
          </Link>
        </div>
      ) : news ? (
        <>
          <div className="news-detail-header" style={{ backgroundImage: `url(${news.banner || news.image})` }}>
            <div className="news-detail-header-overlay">
              <div className="news-detail-title-container">
                <h1 className="news-detail-title">{news.title}</h1>
                <div className="news-detail-meta">
                  <span className="news-detail-date">
                    {formatDate(news.publishDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="news-detail-content-wrapper">
            <div className="news-detail-content">
              <div 
                className="news-detail-body" 
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
              
              <div className="news-detail-actions">
                <Link to="/news" className="news-detail-back-button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="news-detail-button-icon">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to News
                </Link>
              </div>
            </div>
            
            <div className="news-detail-sidebar">
              <div className="news-detail-image-container">
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className="news-detail-image" 
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="news-detail-not-found">
          <h2>News Not Found</h2>
          <p>The news item you're looking for doesn't exist or has been removed.</p>
          <Link to="/news" className="news-detail-back-button">
            Return to News List
          </Link>
        </div>
      )}
      
      <div className="news-detail-rainbow-footer"></div>
    </div>
  );
};

export default NewsDetailPage; 