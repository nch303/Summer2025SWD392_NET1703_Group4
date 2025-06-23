import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewsPage.css';
import { getNewsList } from './NewsService';

const NewsPage = () => {
  // State for news items and pagination
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNewsItems, setFilteredNewsItems] = useState([]);

  // Colors for cards (we'll assign them manually since API doesn't provide colors)
  const cardColors = ['pink', 'blue', 'yellow', 'green', 'purple', 'orange'];

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await getNewsList(page, pageSize);
        setNewsItems(response.data);
        setTotalCount(response.totalCount);
        setTotalPages(Math.ceil(response.totalCount / pageSize));
        setLoading(false);
      } catch (err) {
        setError('Failed to load news items');
        setLoading(false);
        console.error('Error fetching news:', err);
      }
    };

    fetchNews();
  }, [page, pageSize]);

  // Filter news items based on search term
  useEffect(() => {
    if (newsItems) {
      const result = newsItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNewsItems(result);
    }
  }, [searchTerm, newsItems]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearFilters = () => {
    setSearchTerm('');
  };

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Assign color to news item based on its index
  const getColorForIndex = (index) => {
    return cardColors[index % cardColors.length];
  };

  return (
    <div className="news-page-container">
        {/* Decorative elements */}
        <div className="decoration-star star1"></div>
        <div className="decoration-star star2"></div>
        <div className="decoration-cloud cloud1"></div>
        <div className="decoration-cloud cloud2"></div>
        
        <div className="header-container">
          <div className="header-content">
            <h1 className="news-main-title">
              Little Stars News
            </h1>
            <div className="title-underline"></div>
            <p className="intro-text">
              Stay updated with the latest happenings, events, and announcements from our magical world!
            </p>
          </div>
        </div>
        
        <div className="news-content-layout">
          {/* Sidebar with filters */}
          <div className="news-sidebar">
            <div className="sidebar-content">
              <div className="sidebar-section">
                <h2 className="sidebar-title">News Finder</h2>
                <div className="sidebar-search">
                  <div className="search-input-container">
                    <input
                      type="text"
                      placeholder="Search for news..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="search-input"
                    />
                    <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-subtitle">Filter Actions</h3>
                <button className="clear-filters-button" onClick={clearFilters}>
                  <svg className="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  Clear Search
                </button>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-subtitle">Pagination</h3>
                <div className="pagination-controls">
                  <button 
                    className="pagination-button" 
                    onClick={handlePrevPage}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {page} of {totalPages}
                  </span>
                  <button 
                    className="pagination-button" 
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
                <div className="pagination-summary">
                  Showing {filteredNewsItems.length} of {totalCount} news items
                </div>
              </div>

              <div className="sidebar-decoration">
                <div className="sidebar-balloon balloon-1"></div>
                <div className="sidebar-balloon balloon-2"></div>
                <div className="sidebar-balloon balloon-3"></div>
              </div>
            </div>
          </div>
          
          {/* Main content with news grid */}
          <div className="news-main-content">
            {loading ? (
              <div className="loading-container">
                <p>Loading news...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p>{error}</p>
              </div>
            ) : (
              <div className="news-card-grid">
                {filteredNewsItems.length > 0 ? (
                  filteredNewsItems.map((item, index) => (
                    <div key={item.id} className={`news-card card-${getColorForIndex(index)}`}>
                      <div className="news-card-image-container">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="news-card-image" 
                        />
                      </div>
                      <div className="news-card-content">
                        <h2 className="news-card-title">{item.title}</h2>
                        <Link to={`/news/${item.id}`} className={`news-card-button button-${getColorForIndex(index)}`}>
                          Read More
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="button-icon">
                            <path d="M12.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 13H5a1 1 0 010-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <svg className="no-results-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <h3>No news found</h3>
                    <p>Try adjusting your search</p>
                    <button className="clear-filters-button" onClick={clearFilters}>Reset Search</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      <div className="rainbow-footer"></div>
    </div>
  );
};

export default NewsPage;