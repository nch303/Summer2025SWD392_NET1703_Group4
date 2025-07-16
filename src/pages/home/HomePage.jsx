import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const slides = [
    {
      image: 'https://vinschool.edu.vn/wp-content/uploads/2025/04/29/banner-web-01-1-scaled.jpg',
    },
    {
      image: 'https://vinschool.edu.vn/wp-content/uploads/2024/10/31/Web-banner-2048x917-VN.png',
    },
    {
      image: 'https://vinschool.edu.vn/wp-content/uploads/2023/09/20/MicrosoftTeams-image-scaled.jpg',
    }
  ];
  
  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 10000);
    
    return () => clearInterval(slideInterval);
  }, [slides.length]);
  
  // Animation on scroll
  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('visible');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Add useEffect for counter animation
  useEffect(() => {
    const counters = document.querySelectorAll('.counter');
    
    const animateCounter = (counter) => {
      const target = +counter.getAttribute('data-target');
      let count = 0;
      const increment = target / 50;
      
      const updateCount = () => {
        if (count < target) {
          count += increment;
          counter.innerText = Math.ceil(count);
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target; // Ensure exact target is reached
        }
      };
      
      updateCount();
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
      observer.observe(counter);
    });
    
    return () => {
      counters.forEach(counter => {
        observer.unobserve(counter);
      });
    };
  }, []);
  
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
      <div className="home-slideshow-container">
        <div className="home-slides-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide, index) => (
            <div className="home-slide" key={index}>
              <div className="home-slide-image-container">
                <div className="home-slide-overlay"></div>
                <img src={slide.image} alt={slide.title} className="home-slide-image" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button className="home-slide-arrow prev-arrow" onClick={prevSlide}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button className="home-slide-arrow next-arrow" onClick={nextSlide}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        
        {/* Dots indicators */}
        <div className="home-slide-dots">
          {slides.map((_, index) => (
            <button 
              key={index} 
              className={`home-slide-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></button>
          ))}
        </div>
        
        {/* Bottom rainbow decoration */}
        <div className="home-slide-rainbow"></div>
      </div>

      <div className="home-content-container">
        {/* Playful welcome section */}
        <section className={`home-welcome-section ${isVisible ? 'visible' : ''} animate-on-scroll`}>
          <div className="home-welcome-bubbles">
            <div className="bubble bubble1"></div>
            <div className="bubble bubble2"></div>
            <div className="bubble bubble3"></div>
          </div>
          <div className="home-header-content">
            <div className="home-title-wrapper">
              <h1 className="home-main-title">
                Welcome to <span className="text-rainbow">Little Stars</span>
              </h1>
              <h2 className="home-subtitle">
                Preschool Enrollment System
              </h2>
              <div className="home-title-decoration">
                <div className="crayon crayon-red"></div>
                <div className="crayon crayon-yellow"></div>
                <div className="crayon crayon-green"></div>
                <div className="crayon crayon-blue"></div>
                <div className="crayon crayon-purple"></div>
              </div>
            </div>
            <p className="home-intro-text">
              Where little dreams grow big! Our magical kingdom of learning helps children explore,
              discover, and create wonderful memories while developing important skills for life.
            </p>
          </div>
        </section>
        
        {/* Features section with playful cards */}
        <section className="home-features-section animate-on-scroll">
          <div className="home-section-header">
            <h2 className="home-section-title">Our Adventure Areas</h2>
            <p className="home-section-subtitle">Explore the magical spaces we've created for your little ones</p>
          </div>
          
          <div className="home-card-grid">
            <div className="home-card">
              <div className="home-card-image-wrapper">
                <div className="home-card-icon student-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="home-card-content">
                <h3 className="home-card-title">Little Explorers</h3>
                <p className="home-card-text">
                  Meet our amazing students! Watch them grow, learn and play in a nurturing environment 
                  designed to spark curiosity and joy.
                </p>
                <div className="home-card-link-container">
                  <Link to="/students" className="home-card-link student-link">
                    Meet Our Stars
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="home-card">
              <div className="home-card-image-wrapper">
                <div className="home-card-icon classroom-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="home-card-content">
                <h3 className="home-card-title">Magic Clubhouses</h3>
                <p className="home-card-text">
                  Step inside our themed learning spaces where imagination comes alive! Each classroom is 
                  designed for age-specific adventures and discovery.
                </p>
                <div className="home-card-link-container">
                  <Link to="/classes" className="home-card-link classroom-link">
                    Visit Clubhouses
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="home-card">
              <div className="home-card-image-wrapper">
                <div className="home-card-icon enrollment-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="home-card-content">
                <h3 className="home-card-title">Join Our Adventures</h3>
                <p className="home-card-text">
                  Begin your child's educational journey with us! Our simple enrollment process will guide you 
                  through each step of joining our happy community.
                </p>
                <div className="home-card-link-container">
                  <Link to="/enrollment" className="home-card-link enrollment-link">
                    Start Journey
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats section with playful design */}
        <section className="home-stats-section animate-on-scroll">
          <div className="home-section-header">
            <h2 className="home-section-title">Our Growing Garden</h2>
            <p className="home-section-subtitle">Watch how our community blossoms every day</p>
          </div>
          
          <div className="home-stats-container">
            <div className="home-stats-grid">
              <div className="home-stat-card">
                <div className="home-stat-icon students-stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="home-stat-number counter" data-target="125">0</div>
                <div className="home-stat-label">Happy Learners</div>
                <div className="home-stat-progress"><span style={{ width: '80%' }}></span></div>
              </div>
              
              <div className="home-stat-card">
                <div className="home-stat-icon classrooms-stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="home-stat-number counter" data-target="12">0</div>
                <div className="home-stat-label">Discovery Rooms</div>
                <div className="home-stat-progress"><span style={{ width: '65%' }}></span></div>
              </div>
              
              <div className="home-stat-card">
                <div className="home-stat-icon teachers-stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="home-stat-number counter" data-target="8">0</div>
                <div className="home-stat-label">Caring Teachers</div>
                <div className="home-stat-progress"><span style={{ width: '50%' }}></span></div>
              </div>
              
              <div className="home-stat-card">
                <div className="home-stat-icon waiting-stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="home-stat-number counter" data-target="15">0</div>
                <div className="home-stat-label">Waiting Friends</div>
                <div className="home-stat-progress"><span style={{ width: '30%' }}></span></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Parent testimonials section */}
        <section className="home-testimonials-section animate-on-scroll">
          <div className="home-section-header">
            <h2 className="home-section-title">Happy Families</h2>
            <p className="home-section-subtitle">What our parents and guardians have to say</p>
          </div>
          
          <div className="home-testimonials-grid">
            <div className="home-testimonial-card">
              <div className="home-testimonial-quote">"Little Stars has transformed our daughter's early education experience. The staff is incredible and the curriculum is engaging."</div>
              <div className="home-testimonial-author">
                <div className="home-testimonial-name">Jessica M.</div>
                <div className="home-testimonial-role">Parent of Anna, Age 4</div>
              </div>
            </div>
            
            <div className="home-testimonial-card">
              <div className="home-testimonial-quote">"The enrollment process was seamless and the communication from the teachers has been excellent. My son loves going to school every day."</div>
              <div className="home-testimonial-author">
                <div className="home-testimonial-name">Michael T.</div>
                <div className="home-testimonial-role">Parent of Lucas, Age 3</div>
              </div>
            </div>
            
            <div className="home-testimonial-card">
              <div className="home-testimonial-quote">"We've seen tremendous growth in our twins since they started at Little Stars. The personalized attention they receive is wonderful."</div>
              <div className="home-testimonial-author">
                <div className="home-testimonial-name">Sarah K.</div>
                <div className="home-testimonial-role">Parent of Emma & Noah, Age 5</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Playful CTA section */}
        <section className="home-cta-section animate-on-scroll">
          <div className="home-cta-background">
            <div className="home-cta-content">
              <h2 className="home-cta-title">Ready for an Amazing Adventure?</h2>
              <p className="home-cta-text">Join our colorful world of learning and watch your child blossom!</p>
              <div className="home-cta-buttons">
                <Link to="/dashboard" className="home-cta-button primary">
                  Start the Magic
                </Link>
                <Link to="/contact" className="home-cta-button secondary">
                  Talk to Us
                </Link>
              </div>
            </div>
            <div className="cta-decoration">
              <div className="cta-star star1"></div>
              <div className="cta-star star2"></div>
              <div className="cta-star star3"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
