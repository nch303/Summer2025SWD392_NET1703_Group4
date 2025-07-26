import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import { getNewsForParent, getNewsDetail } from '../../services/HomeService';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const parallaxRef = useRef(null);
  const [newsList, setNewsList] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  
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
    }, 8000);
    
    return () => clearInterval(slideInterval);
  }, [slides.length]);
  
  // Animation on scroll
  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      const elements = document.querySelectorAll(`.${styles.animateOnScroll}`);
      
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add(styles.visible);
        }
      });
      
      // Parallax effect
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Add useEffect for counter animation
  useEffect(() => {
    const counters = document.querySelectorAll(`.${styles.homeStatNumber}`);
    
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
          counter.innerText = target;
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

  // Fetch news with publish dates
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        const newsData = await getNewsForParent(1, 3);
        
        // Fetch details for each news item to get publish dates
        const newsWithDetails = await Promise.all(
          (newsData.data || []).map(async (news) => {
            try {
              const detail = await getNewsDetail(news.id);
              return {
                ...news,
                publishDate: detail.publishDate
              };
            } catch (error) {
              console.error(`Could not fetch details for news ${news.id}`, error);
              // Return the news without details if there was an error
              return news;
            }
          })
        );
        
        setNewsList(newsWithDetails);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setNewsLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return { month: 'N/A', day: 'N/A' };
    
    const date = new Date(dateString);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    return {
      month: months[date.getMonth()],
      day: date.getDate()
    };
  };

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
    <div className={styles.homeContainer}>
      <div className={styles.backgroundDecoration}>
        <div className={`${styles.floatingShape} ${styles.shape1}`}></div>
        <div className={`${styles.floatingShape} ${styles.shape2}`}></div>
        <div className={`${styles.floatingShape} ${styles.shape3}`}></div>
        <div className={styles.parallaxStars} ref={parallaxRef}></div>
      </div>
      
      {/* Hero Slideshow */}
      <div className={styles.homeSlideshowContainer}>
        <div 
          className={styles.homeSlidesWrapper} 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div className={styles.homeSlide} key={index}>
              <div className={styles.homeSlideImageContainer}>
                <div className={styles.homeSlideOverlay}></div>
                <img src={slide.image} alt={slide.title} className={styles.homeSlideImage} />
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button className={`${styles.homeSlideArrow} ${styles.prevArrow}`} onClick={prevSlide}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <button className={`${styles.homeSlideArrow} ${styles.nextArrow}`} onClick={nextSlide}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
        
        {/* Dots indicators */}
        <div className={styles.homeSlideDots}>
          {slides.map((_, index) => (
            <button 
              key={index} 
              className={`${styles.homeSlideDot} ${currentSlide === index ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
            ></button>
          ))}
        </div>
        
        {/* Bottom rainbow decoration */}
        <div className={styles.homeSlideRainbow}></div>
      </div>

      <div className={styles.homeContentContainer}>
        {/* Welcome section */}
        <section className={`${styles.homeWelcomeSection} ${isVisible ? styles.visible : ''} ${styles.animateOnScroll}`}>
          <div className={styles.homeWelcomeBubbles}>
            <div className={`${styles.bubble} ${styles.bubble1}`}></div>
            <div className={`${styles.bubble} ${styles.bubble2}`}></div>
            <div className={`${styles.bubble} ${styles.bubble3}`}></div>
          </div>
          <div className={styles.homeHeaderContent}>
            <div className={styles.homeTitleWrapper}>
              <h1 className={styles.homeMainTitle}>
                Welcome to <span className={styles.textRainbow}>Little Stars</span>
              </h1>
              <h2 className={styles.homeSubtitle}>
                Preschool Enrollment System
              </h2>
              <div className={styles.homeTitleDecoration}>
                <div className={`${styles.crayon} ${styles.crayonRed}`}></div>
                <div className={`${styles.crayon} ${styles.crayonYellow}`}></div>
                <div className={`${styles.crayon} ${styles.crayonGreen}`}></div>
                <div className={`${styles.crayon} ${styles.crayonBlue}`}></div>
                <div className={`${styles.crayon} ${styles.crayonPurple}`}></div>
              </div>
            </div>
            <p className={styles.homeIntroText}>
              Where little dreams grow big! Our magical kingdom of learning helps children explore,
              discover, and create wonderful memories while developing important skills for life.
            </p>
            <div className={styles.welcomeButtonContainer}>
              <Link to="/about-us" className={styles.welcomeButton}>
                Discover Our Story
              </Link>
            </div>
          </div>
        </section>
        
        {/* Educational philosophy section - NEW */}
        <section className={`${styles.homePhilosophySection} ${styles.animateOnScroll}`}>
          <div className={styles.homeSectionHeader}>
            <h2 className={styles.homeSectionTitle}>Our Educational Philosophy</h2>
            <p className={styles.homeSectionSubtitle}>Nurturing young minds through play-based learning</p>
          </div>
          
          <div className={styles.philosophyContainer}>
            <div className={styles.philosophyImage}>
              <img src="https://img.freepik.com/free-photo/children-classroom-with-teacher_23-2148633328.jpg" alt="Children learning" />
              <div className={styles.philosophyImageDecoration}></div>
            </div>
            <div className={styles.philosophyContent}>
              <div className={styles.philosophyPoint}>
                <div className={styles.philosophyIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3>Play-based Learning</h3>
                  <p>We believe children learn best through engaging, hands-on activities that spark curiosity and joy.</p>
                </div>
              </div>
              <div className={styles.philosophyPoint}>
                <div className={styles.philosophyIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <h3>Holistic Development</h3>
                  <p>Our curriculum nurtures intellectual, physical, emotional, and social growth in a balanced approach.</p>
                </div>
              </div>
              <div className={styles.philosophyPoint}>
                <div className={styles.philosophyIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3>Individual Attention</h3>
                  <p>We recognize each child's unique strengths and adapt our teaching to support their personal journey.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features section with playful cards */}
        <section className={`${styles.homeFeaturesSection} ${styles.animateOnScroll}`}>
          <div className={styles.homeSectionHeader}>
            <h2 className={styles.homeSectionTitle}>Our Adventure Areas</h2>
            <p className={styles.homeSectionSubtitle}>Explore the magical spaces we've created for your little ones</p>
          </div>
          
          <div className={styles.homeCardGrid}>
            <div className={styles.homeCard}>
              <div className={styles.homeCardImageWrapper}>
                <div className={`${styles.homeCardIcon} ${styles.studentIcon}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className={styles.homeCardContent}>
                <h3 className={styles.homeCardTitle}>Little Explorers</h3>
                <p className={styles.homeCardText}>
                  Meet our amazing students! Watch them grow, learn and play in a nurturing environment 
                  designed to spark curiosity and joy.
                </p>
              </div>
            </div>
            
            <div className={styles.homeCard}>
              <div className={styles.homeCardImageWrapper}>
                <div className={`${styles.homeCardIcon} ${styles.classroomIcon}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className={styles.homeCardContent}>
                <h3 className={styles.homeCardTitle}>Magic Clubhouses</h3>
                <p className={styles.homeCardText}>
                  Step inside our themed learning spaces where imagination comes alive! Each classroom is 
                  designed for age-specific adventures and discovery.
                </p>
              </div>
            </div>
            
            <div className={styles.homeCard}>
              <div className={styles.homeCardImageWrapper}>
                <div className={`${styles.homeCardIcon} ${styles.enrollmentIcon}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className={styles.homeCardContent}>
                <h3 className={styles.homeCardTitle}>Join Our Adventures</h3>
                <p className={styles.homeCardText}>
                  Begin your child's educational journey with us! Our simple enrollment process will guide you 
                  through each step of joining our happy community.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats section with playful design */}
        <section className={`${styles.homeStatsSection} ${styles.animateOnScroll}`}>
          <div className={styles.homeSectionHeader}>
            <h2 className={styles.homeSectionTitle}>Our Growing Garden</h2>
            <p className={styles.homeSectionSubtitle}>Watch how our community blossoms every day</p>
          </div>
          
          <div className={styles.homeStatsContainer}>
            <div className={styles.homeStatsGrid}>
              <div className={styles.homeStatCard}>
                <div className={`${styles.homeStatIcon} ${styles.studentsStatIcon}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className={styles.homeStatNumber} data-target="125">0</div>
                <div className={styles.homeStatLabel}>Happy Learners</div>
                <div className={styles.homeStatProgress}><span style={{ width: '80%' }}></span></div>
              </div>
              
              <div className={styles.homeStatCard}>
                <div className={`${styles.homeStatIcon} ${styles.classroomsStatIcon}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className={styles.homeStatNumber} data-target="12">0</div>
                <div className={styles.homeStatLabel}>Discovery Rooms</div>
                <div className={styles.homeStatProgress}><span style={{ width: '65%' }}></span></div>
              </div>
              
              <div className={styles.homeStatCard}>
                <div className={`${styles.homeStatIcon} ${styles.teachersStatIcon}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className={styles.homeStatNumber} data-target="8">0</div>
                <div className={styles.homeStatLabel}>Caring Teachers</div>
                <div className={styles.homeStatProgress}><span style={{ width: '50%' }}></span></div>
              </div>
              
              <div className={styles.homeStatCard}>
                <div className={`${styles.homeStatIcon} ${styles.waitingStatIcon}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className={styles.homeStatNumber} data-target="15">0</div>
                <div className={styles.homeStatLabel}>Waiting Friends</div>
                <div className={styles.homeStatProgress}><span style={{ width: '30%' }}></span></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Update the News section */}
        <section className={`${styles.homeNewsSection} ${styles.animateOnScroll}`}>
          <div className={styles.homeSectionHeader}>
            <h2 className={styles.homeSectionTitle}>Latest News & Events</h2>
            <p className={styles.homeSectionSubtitle}>Stay updated with what's happening in our little community</p>
          </div>
          
          <div className={styles.homeNewsGrid}>
            {newsLoading ? (
              <div className={styles.newsLoading}>Loading news...</div>
            ) : newsList.length > 0 ? (
              newsList.map(news => {
                const date = formatDate(news.publishDate);
                return (
                  <div key={news.id} className={styles.homeNewsCard}>
                    <div className={styles.homeNewsDate}>
                      <span className={styles.homeNewsMonth}>{date.month}</span>
                      <span className={styles.homeNewsDay}>{date.day}</span>
                    </div>
                    <div className={styles.homeNewsContent}>
                      <div className={styles.homeNewsThumbnail}>
                        <img src={news.image} alt={news.title} />
                      </div>
                      <h3 className={styles.homeNewsTitle}>{news.title}</h3>
                      <Link to={`/news/${news.id}`} className={styles.homeNewsLink}>Read More</Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noNews}>No news available at the moment</div>
            )}
          </div>
          
          <div className={styles.homeNewsViewAll}>
            <Link to="/news" className={styles.homeNewsViewAllLink}>
              View All News & Events
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
