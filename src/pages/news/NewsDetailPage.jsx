import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsDetailView } from '../../services/NewsService';
import styles from './NewsDetailPage.module.css';
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
    <div className={styles.newsDetailContainer}>
      {loading ? (
        <div className={styles.newsDetailLoading}>
          <div className={styles.newsDetailSpinner}></div>
          <p>Loading news details...</p>
        </div>
      ) : error ? (
        <div className={styles.newsDetailError}>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <Link to="/news" className={styles.newsDetailBackButton}>
            Return to News List
          </Link>
        </div>
      ) : news ? (
        <>
          <div className={styles.newsDetailHeader} style={{ backgroundImage: `url(${news.banner || news.image})` }}>
            <div className={styles.newsDetailHeaderOverlay}>
              <div className={styles.newsDetailTitleContainer}>
                <h1 className={styles.newsDetailTitle}>{news.title}</h1>
                <div className={styles.newsDetailMeta}>
                  <span className={styles.newsDetailDate}>
                    {formatDate(news.publishDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.newsDetailContentWrapper}>
            <div className={styles.newsDetailContent}>
              <div 
                className={styles.newsDetailBody} 
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
              
              <div className={styles.newsDetailActions}>
                <Link to="/news" className={styles.newsDetailBackButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.newsDetailButtonIcon}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to News
                </Link>
              </div>
            </div>
            
            <div className={styles.newsDetailSidebar}>
              <div className={styles.newsDetailImageContainer}>
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className={styles.newsDetailImage} 
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.newsDetailNotFound}>
          <h2>News Not Found</h2>
          <p>The news item you're looking for doesn't exist or has been removed.</p>
          <Link to="/news" className={styles.newsDetailBackButton}>
            Return to News List
          </Link>
        </div>
      )}
      
      <div className={styles.newsDetailRainbowFooter}></div>
    </div>
  );
};

export default NewsDetailPage; 