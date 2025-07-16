import React from 'react';
import './AboutUsPage.css';

const AboutUsPage = () => {
    return (
    <div className="about-us-container">
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <h1>About Little Stars</h1>
          <div className="about-title-underline"></div>
          <p>Where childhood dreams take flight and young minds grow bright</p>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="about-section about-story-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2>Our Story</h2>
            <div className="about-section-underline"></div>
          </div>
          <div className="about-story-content">
            <div className="about-story-image">
              <img src="https://vinschool.edu.vn/wp-content/uploads/2023/08/15/Anh-bia-CLBNK.png" alt="Children playing together" />
              <div className="about-image-decoration"></div>
            </div>
            <div className="about-story-text">
              <p>Founded in 2010, Little Stars Preschool began with a simple vision: to create a nurturing environment where children could learn, play, and grow at their own pace.</p>
              <p>What started as a small classroom with just 15 students has blossomed into a vibrant community of young learners, passionate educators, and involved families all working together to provide the best early education experience.</p>
              <p>Through the years, we've remained committed to our core belief that every child is unique and deserves an education tailored to their individual needs and interests.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Philosophy Section */}
      <section className="about-section about-philosophy-section">
        <div className="about-rainbow-top"></div>
        <div className="about-section-container">
          <div className="about-section-header">
            <h2>Our Philosophy</h2>
            <div className="about-section-underline"></div>
          </div>
          <div className="about-philosophy-cards">
            <div className="about-philosophy-card">
              <div className="about-card-icon about-play-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
              </div>
              <h3>Play-Based Learning</h3>
              <p>We believe children learn best through play. Our curriculum incorporates games, creative activities, and imaginative exploration to foster a love of learning.</p>
            </div>
            <div className="about-philosophy-card">
              <div className="about-card-icon about-individual-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3>Individual Growth</h3>
              <p>Each child develops at their own pace. We honor this by providing personalized attention and creating learning opportunities that meet each child where they are.</p>
            </div>
            <div className="about-philosophy-card">
              <div className="about-card-icon about-community-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <h3>Community Connection</h3>
              <p>Children thrive when surrounded by a supportive community. We foster strong relationships between students, teachers, and families to create a village of care.</p>
            </div>
          </div>
        </div>
        <div className="about-rainbow-bottom"></div>
      </section>
      
      {/* Our Team Section */}
      <section className="about-section about-team-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2>Meet Our Team</h2>
            <div className="about-section-underline"></div>
          </div>
          <p className="about-team-intro">Our dedicated staff brings together decades of experience in early childhood education, creating a warm and stimulating environment for your child.</p>
          <div className="about-team-members">
            <div className="about-team-member">
              <div className="about-member-image">
                <img src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Sarah Johnson" />
              </div>
              <div className="about-member-info">
                <h3>Sarah Johnson</h3>
                <p className="about-member-title">Director</p>
                <p className="about-member-description">With over 15 years of experience in early childhood education, Sarah leads our school with passion and creativity.</p>
              </div>
            </div>
            <div className="about-team-member">
              <div className="about-member-image">
                <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Michael Chen" />
              </div>
              <div className="about-member-info">
                <h3>Michael Chen</h3>
                <p className="about-member-title">Lead Teacher</p>
                <p className="about-member-description">Michael specializes in developmental psychology and brings joy to the classroom with his innovative teaching methods.</p>
              </div>
            </div>
            <div className="about-team-member">
              <div className="about-member-image">
                <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Emma Rodriguez" />
              </div>
              <div className="about-member-info">
                <h3>Emma Rodriguez</h3>
                <p className="about-member-title">Curriculum Coordinator</p>
                <p className="about-member-description">Emma designs our engaging curriculum that balances academic readiness with social-emotional development.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Facilities Section */}
      <section className="about-section about-facilities-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2>Our Facilities</h2>
            <div className="about-section-underline"></div>
          </div>
          <div className="about-facilities-grid">
            <div className="about-facility-item">
              <div className="about-facility-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2L7 10l-4.5 6h19l-7.5-10z"/>
                </svg>
              </div>
              <h3>Natural Playgrounds</h3>
              <p>Our outdoor spaces feature natural elements that encourage exploration, physical activity, and connection with nature.</p>
            </div>
            <div className="about-facility-item">
              <div className="about-facility-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </svg>
              </div>
              <h3>Reading Nooks</h3>
              <p>Cozy corners filled with books spark imagination and foster a love of reading from an early age.</p>
            </div>
            <div className="about-facility-item">
              <div className="about-facility-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
                </svg>
              </div>
              <h3>Art Studio</h3>
              <p>A bright, dedicated space where children can express themselves through various art mediums and creative projects.</p>
            </div>
            <div className="about-facility-item">
              <div className="about-facility-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/>
                </svg>
              </div>
              <h3>STEM Discovery Center</h3>
              <p>Hands-on learning stations where children can experiment, build, and develop early science and math skills.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="about-section about-values-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2>Our Core Values</h2>
            <div className="about-section-underline"></div>
          </div>
          <div className="about-values-list">
            <div className="about-value-item">
              <div className="about-value-number">01</div>
              <div className="about-value-content">
                <h3>Safety First</h3>
                <p>We maintain strict safety protocols to ensure your child's physical and emotional well-being is protected at all times.</p>
              </div>
            </div>
            <div className="about-value-item">
              <div className="about-value-number">02</div>
              <div className="about-value-content">
                <h3>Respect for All</h3>
                <p>We celebrate diversity and teach children to appreciate differences in themselves and others.</p>
              </div>
            </div>
            <div className="about-value-item">
              <div className="about-value-number">03</div>
              <div className="about-value-content">
                <h3>Joy in Learning</h3>
                <p>Education should be fun! We create positive experiences that build confidence and instill a lifelong love of learning.</p>
              </div>
            </div>
            <div className="about-value-item">
              <div className="about-value-number">04</div>
              <div className="about-value-content">
                <h3>Family Partnership</h3>
                <p>We view parents as essential partners in education and welcome their involvement in our school community.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="about-rainbow-decoration"></div>
      </section>
      
      {/* Testimonials Section */}
      <section className="about-section about-testimonials-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2>Parent Testimonials</h2>
            <div className="about-section-underline"></div>
          </div>
          <div className="about-testimonials-slider">
            <div className="about-testimonial">
              <div className="about-quote-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z"/>
                </svg>
              </div>
              <p className="about-testimonial-text">"Little Stars has been a second home for my daughter. The care and attention she receives is exceptional, and her growth both academically and socially has been remarkable."</p>
              <div className="about-testimonial-author">
                <p className="about-author-name">- Amanda Peterson</p>
                <p className="about-author-relation">Parent of Emily, Pre-K</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="about-section about-cta-section">
        <div className="about-section-container">
          <div className="about-cta-content">
            <h2>Join Our Little Stars Family</h2>
            <p>We'd love to welcome your child to our nurturing community of learners!</p>
            <div className="about-cta-buttons">
              <button className="about-btn-primary">Schedule a Tour</button>
              <button className="about-btn-secondary">Enrollment Information</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
