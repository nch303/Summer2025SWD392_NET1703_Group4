import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: 'https://vinschool.edu.vn/wp-content/uploads/2025/04/29/banner-web-01-1-scaled.jpg',
    },
    {
      image: 'https://vinschool.edu.vn/wp-content/uploads/2024/10/31/Web-banner-2048x917-VN.png', // Replace with your actual image path
    },
    {
      image: 'https://vinschool.edu.vn/wp-content/uploads/2023/09/20/MicrosoftTeams-image-scaled.jpg', // Replace with your actual image path
    }
  ];
  
  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 10000);
    
    return () => clearInterval(slideInterval);
  }, [slides.length]);
  
  // Handle manual navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="home-container">
      {/* Hero Slideshow */}
      <div className="slideshow-container">
        <div className="slides-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide, index) => (
            <div className="slide" key={index}>
              <div className="slide-image-container">
                <div className="slide-overlay"></div>
                <img src={slide.image} alt={slide.title} className="slide-image" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button className="slide-arrow prev-arrow" onClick={prevSlide}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button className="slide-arrow next-arrow" onClick={nextSlide}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        
        {/* Dots indicators */}
        <div className="slide-dots">
          {slides.map((_, index) => (
            <button 
              key={index} 
              className={`slide-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></button>
          ))}
        </div>
        
        {/* Bottom rainbow decoration */}
        <div className="slide-rainbow"></div>
        
        {/* Remove cloud elements */}

      </div>

      
      <div className="content-container">
        <div className="header-container">
          <div className="header-content">
            <h1 className="main-title">
              Welcome to Little Stars
            </h1>
            <h2 className="subtitle">
              Preschool Enrollment System
            </h2>
            <div className="title-underline"></div>
            <p className="intro-text">
              Where little dreams grow big! Manage student enrollments, classes, and activities in our magical learning world.
            </p>
          </div>
        </div>
        
        {/* Animation figures */}
        <div className="bounce-ball"></div>
        <div className="pulse-ball"></div>
        
        <div className="card-grid">
          <div className="card card-blue">
            <div className="card-icon icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="card-title title-blue">Student Adventures</h2>
            <p className="card-text">
              Register new explorers, track their learning journeys, and guide their growth
            </p>
            <div className="card-link-container">
              <Link to="/students" className="card-link link-blue">
                Meet Our Stars
              </Link>
            </div>
          </div>
          
          <div className="card card-green">
            <div className="card-icon icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="card-title title-green">Magic Classrooms</h2>
            <p className="card-text">
              Create wonder-filled learning spaces, assign teachers, and craft magical schedules
            </p>
            <div className="card-link-container">
              <Link to="/classes" className="card-link link-green">
                Explore Classes
              </Link>
            </div>
          </div>
          
          <div className="card card-purple">
            <div className="card-icon icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="card-title title-purple">Enrollment Journey</h2>
            <p className="card-text">
              Guide families through their enrollment adventure from application to welcome day
            </p>
            <div className="card-link-container">
              <Link to="/enrollment" className="card-link link-purple">
                Start Journey
              </Link>
            </div>
          </div>
        </div>
        
        <div className="stats-container">
          <h2 className="stats-title">Our Learning Garden</h2>
          <div className="stats-grid">
            <div className="stat-item stat-yellow">
              <div className="stat-icon icon-stat-yellow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="stat-number number-yellow">125</div>
              <div className="stat-label">Happy Learners</div>
            </div>
            
            <div className="stat-item stat-green">
              <div className="stat-icon icon-stat-green">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="stat-number number-green">12</div>
              <div className="stat-label">Discovery Rooms</div>
            </div>
            
            <div className="stat-item stat-blue">
              <div className="stat-icon icon-stat-blue">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="stat-number number-blue">8</div>
              <div className="stat-label">Guide Teachers</div>
            </div>
            
            <div className="stat-item stat-pink">
              <div className="stat-icon icon-stat-pink">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-number number-pink">15</div>
              <div className="stat-label">Waiting Friends</div>
            </div>
          </div>
        </div>
        
        <div className="cta-container">
          <Link to="/dashboard" className="cta-button">
            Begin Your Adventure
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
