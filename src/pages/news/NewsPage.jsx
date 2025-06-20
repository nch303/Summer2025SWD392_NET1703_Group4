import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewsPage.css';
import { Card } from 'antd';

const NewsPage = () => {
  // Mock news data - in real app, this would come from an API
  const allNewsItems = [
    {
      id: 1,
      title: 'Annual Art Exhibition',
      date: 'June 15, 2023',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4',
      category: 'Events',
      excerpt: 'Join us for our colorful annual art exhibition featuring creative works from our little stars!',
      color: 'pink'
    },
    {
      id: 2,
      title: 'New Playground Equipment',
      date: 'May 5, 2023',
      image: 'https://images.unsplash.com/photo-1553012547-284d8c582b1f',
      category: 'Updates',
      excerpt: 'We have exciting new playground equipment arriving next month with interactive music features!',
      color: 'blue'
    },
    {
      id: 3,
      title: 'Story Time with Author Visit',
      date: 'April 22, 2023',
      image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290',
      category: 'Events',
      excerpt: 'Children\'s author Jane Smith will visit our school for a special reading session next Thursday.',
      color: 'yellow'
    },
    {
      id: 4,
      title: 'Summer Camp Registration',
      date: 'March 30, 2023',
      image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902',
      category: 'Announcements',
      excerpt: 'Registration for our summer adventure camp is now open! Limited spots available.',
      color: 'green'
    },
    {
      id: 5,
      title: 'Parents\' Night Updates',
      date: 'March 15, 2023',
      image: 'https://images.unsplash.com/photo-1536337005238-94b997371b40',
      category: 'Events',
      excerpt: 'Our monthly parents\' night will include a workshop on creative play techniques.',
      color: 'purple'
    },
    {
      id: 6,
      title: 'Healthy Snack Initiative',
      date: 'February 28, 2023',
      image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af',
      category: 'Health',
      excerpt: 'We\'re launching our new healthy snack program with organic options and allergy-friendly alternatives.',
      color: 'orange'
    },
    {
      id: 7,
      title: 'Music Program Expansion',
      date: 'February 15, 2023',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae',
      category: 'Updates',
      excerpt: 'Our music program is expanding with new instruments and weekly special sessions.',
      color: 'blue'
    },
    {
      id: 8,
      title: 'Community Garden Project',
      date: 'January 20, 2023',
      image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735',
      category: 'Projects',
      excerpt: 'Students will participate in planting our new community garden starting next month.',
      color: 'green'
    }
  ];

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState({});
  const [filteredNewsItems, setFilteredNewsItems] = useState(allNewsItems);

  // Get unique categories from news items
  const categories = [...new Set(allNewsItems.map(item => item.category))];

  // Initialize active categories
  useEffect(() => {
    const initialCategories = {};
    categories.forEach(category => {
      initialCategories[category] = true;
    });
    setActiveCategories(initialCategories);
  }, []);

  // Filter news items when search term or active categories change
  useEffect(() => {
    const result = allNewsItems.filter(item => {
      // Check if search term matches title or excerpt
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

      // Check if item's category is active
      const categoryIsActive = activeCategories[item.category];

      return matchesSearch && categoryIsActive;
    });

    setFilteredNewsItems(result);
  }, [searchTerm, activeCategories]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (category) => {
    setActiveCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    const resetCategories = {};
    categories.forEach(category => {
      resetCategories[category] = true;
    });
    setActiveCategories(resetCategories);
  };

  return (
    <div className="admin-content news-page-container">
      <Card>
        {/* Decorative elements */}
        <div className="decoration-star star1"></div>
        <div className="decoration-star star2"></div>
        <div className="decoration-cloud cloud1"></div>
        <div className="decoration-cloud cloud2"></div>
        
        <div className="header-container">
          <div className="header-content">
            <h1 className="main-title">
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
                <h3 className="sidebar-subtitle">Categories</h3>
                <div className="category-filters">
                  {categories.map(category => (
                    <div key={category} className="category-checkbox">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={activeCategories[category] || false}
                          onChange={() => handleCategoryChange(category)}
                          className="category-input"
                        />
                        <span className="checkbox-custom">
                          <svg className="checkbox-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                        <span className="checkbox-text">{category}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-subtitle">Filter Actions</h3>
                <button className="clear-filters-button" onClick={clearFilters}>
                  <svg className="button-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  Clear All Filters
                </button>
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
            <div className="news-card-grid">
              {filteredNewsItems.length > 0 ? (
                filteredNewsItems.map(item => (
                  <div key={item.id} className={`news-card card-${item.color}`}>
                    <div className="news-card-image-container">
                      <img 
                        src={`${item.image}?w=400&h=250&fit=crop&auto=format`} 
                        alt={item.title} 
                        className="news-card-image" 
                      />
                      <div className="news-card-category">{item.category}</div>
                    </div>
                    <div className="news-card-content">
                      <div className="news-card-date">{item.date}</div>
                      <h2 className="news-card-title">{item.title}</h2>
                      <p className="news-card-excerpt">{item.excerpt}</p>
                      <button className={`news-card-button button-${item.color}`}>
                        Read More
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="button-icon">
                          <path d="M12.293 5.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L16.586 13H5a1 1 0 010-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <svg className="no-results-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <h3>No news found</h3>
                  <p>Try adjusting your search or filter settings</p>
                  <button className="clear-filters-button" onClick={clearFilters}>Reset Filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      <div className="rainbow-footer"></div>
    </div>
  );
};

export default NewsPage;