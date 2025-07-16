import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './NewsPage.module.css';
import { getNewsList } from '../../services/NewsService';

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

  // Helper function to get the correct CSS module class
  const getCardColorClass = (index) => {
    const color = getColorForIndex(index);
    switch (color) {
      case 'pink': return styles.cardPink;
      case 'blue': return styles.cardBlue;
      case 'yellow': return styles.cardYellow;
      case 'green': return styles.cardGreen;
      case 'purple': return styles.cardPurple;
      case 'orange': return styles.cardOrange;
      default: return styles.cardPink;
    }
  };

  const getButtonColorClass = (index) => {
    const color = getColorForIndex(index);
    switch (color) {
      case 'pink': return styles.buttonPink;
      case 'blue': return styles.buttonBlue;
      case 'yellow': return styles.buttonYellow;
      case 'green': return styles.buttonGreen;
      case 'purple': return styles.buttonPurple;
      case 'orange': return styles.buttonOrange;
      default: return styles.buttonPink;
    }
  };

  return (
    <div className={styles.newsPageContainer}>
        {/* Decorative elements */}
        <div className={`${styles.decorationStar} ${styles.star1}`}></div>
        <div className={`${styles.decorationStar} ${styles.star2}`}></div>
        <div className={`${styles.decorationCloud} ${styles.cloud1}`}></div>
        <div className={`${styles.decorationCloud} ${styles.cloud2}`}></div>
        
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <h1 className={styles.newsMainTitle}>
              Little Stars News
            </h1>
            <div className={styles.titleUnderline}></div>
            <p className={styles.introText}>
              Stay updated with the latest happenings, events, and announcements from our magical world!
            </p>
          </div>
        </div>
        
        <div className={styles.newsContentLayout}>
          {/* Sidebar with filters */}
          <div className={styles.newsSidebar}>
            <div className={styles.sidebarContent}>
              <div className={styles.sidebarSection}>
                <h2 className={styles.sidebarTitle}>News Finder</h2>
                <div className={styles.sidebarSearch}>
                  <div className={styles.searchInputContainer}>
                    <input
                      type="text"
                      placeholder="Search for news..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className={styles.searchInput}
                    />
                    <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarSubtitle}>Filter Actions</h3>
                <button className={styles.clearFiltersButton} onClick={clearFilters}>
                  <svg className={styles.buttonIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  Clear Search
                </button>
              </div>

              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarSubtitle}>Pagination</h3>
                <div className={styles.paginationControls}>
                  <button 
                    className={styles.paginationButton} 
                    onClick={handlePrevPage}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <span className={styles.paginationInfo}>
                    Page {page} of {totalPages}
                  </span>
                  <button 
                    className={styles.paginationButton} 
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </div>
                <div className={styles.paginationSummary}>
                  Showing {filteredNewsItems.length} of {totalCount} news items
                </div>
              </div>

              <div className={styles.sidebarDecoration}>
                <div className={`${styles.sidebarBalloon} ${styles.balloon1}`}></div>
                <div className={`${styles.sidebarBalloon} ${styles.balloon2}`}></div>
                <div className={`${styles.sidebarBalloon} ${styles.balloon3}`}></div>
              </div>
            </div>
          </div>
          
          {/* Main content with news grid */}
          <div className={styles.newsMainContent}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <p>Loading news...</p>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <p>{error}</p>
              </div>
            ) : (
              <div className={styles.newsCardGrid}>
                {filteredNewsItems.length > 0 ? (
                  filteredNewsItems.map((item, index) => (
                    <div key={item.id} className={`${styles.newsCard} ${getCardColorClass(index)}`}>
                      <div className={styles.newsCardImageContainer}>
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className={styles.newsCardImage} 
                        />
                      </div>
                      <div className={styles.newsCardContent}>
                        <h2 className={styles.newsCardTitle}>{item.title}</h2>
                        <Link to={`/news/${item.id}`} className={`${styles.newsCardButton} ${getButtonColorClass(index)}`}>
                          Read More
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.buttonIcon}>
                            <path d="M12.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 13H5a1 1 0 010-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noResults}>
                    <svg className={styles.noResultsIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    <h3>No news found</h3>
                    <p>Try adjusting your search</p>
                    <button className={styles.clearFiltersButton} onClick={clearFilters}>Reset Search</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      <div className={styles.rainbowFooter}></div>
    </div>
  );
};

export default NewsPage;