import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form validation would go here
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after showing confirmation message
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 5000);
  };
  
  return (
    <div className="contact-container">
      {/* Hero Section */}
      <section className="contact-hero-section">
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content">
          <h1>Get In Touch</h1>
          <div className="contact-title-underline"></div>
          <p>We'd love to hear from you! Let us know how we can help.</p>
        </div>
      </section>
      
      {/* Main Contact Section */}
      <section className="contact-section contact-main-section">
        <div className="contact-section-container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-container">
              <div className="contact-form-header">
                <h2>Send Us a Message</h2>
                <div className="contact-form-underline"></div>
              </div>
              
              {submitted ? (
                <div className="contact-form-success">
                  <div className="contact-success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3>Thank You!</h3>
                  <p>Your message has been sent successfully. We'll get back to you as soon as possible!</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div className="contact-form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div className="contact-form-group">
                    <label htmlFor="subject">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="enrollment">Enrollment Information</option>
                      <option value="tour">Schedule a Tour</option>
                      <option value="program">Program Questions</option>
                      <option value="employment">Employment Opportunities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="contact-form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows="5"
                      required
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="contact-btn-submit">Send Message</button>
                </form>
              )}
              
              <div className="contact-decoration-element contact-star-1"></div>
              <div className="contact-decoration-element contact-star-2"></div>
              <div className="contact-decoration-element contact-circle-1"></div>
            </div>
            
            {/* Contact Info */}
            <div className="contact-info-container">
              <div className="contact-info-card">
                <div className="contact-info-header">
                  <h2>Contact Information</h2>
                  <div className="contact-info-underline"></div>
                </div>
                
                <div className="contact-info-items">
                  <div className="contact-info-item">
                    <div className="contact-info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div className="contact-info-text">
                      <h3>Address</h3>
                      <p>123 Rainbow Road, Sunshine City, SC 12345</p>
                    </div>
                  </div>
                  
                  <div className="contact-info-item">
                    <div className="contact-info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div className="contact-info-text">
                      <h3>Email</h3>
                      <p>info@littlestars.edu</p>
                    </div>
                  </div>
                  
                  <div className="contact-info-item">
                    <div className="contact-info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z"/>
                      </svg>
                    </div>
                    <div className="contact-info-text">
                      <h3>Phone</h3>
                      <p>(555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="contact-info-item">
                    <div className="contact-info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    </div>
                    <div className="contact-info-text">
                      <h3>Hours</h3>
                      <p>Monday - Friday: 8:00 AM - 4:30 PM</p>
                      <p>Saturday: 9:00 AM - 12:00 PM (Tours Only)</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
                
                <div className="contact-social">
                  <h3>Follow Us</h3>
                  <div className="contact-social-icons">
                    <a href="#" className="contact-social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                      </svg>
                    </a>
                    <a href="#" className="contact-social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                    </a>
                    <a href="#" className="contact-social-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.582 6.186a2.506 2.506 0 0 0-1.768-1.768C18.254 4 12 4 12 4s-6.254 0-7.814.418a2.506 2.506 0 0 0-1.768 1.768C2 7.746 2 12 2 12s0 4.254.418 5.814a2.506 2.506 0 0 0 1.768 1.768C5.746 20 12 20 12 20s6.254 0 7.814-.418a2.506 2.506 0 0 0 1.768-1.768C22 16.254 22 12 22 12s0-4.254-.418-5.814zM10 15V9l5.5 3-5.5 3z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="contact-section contact-map-section">
        <div className="contact-section-container">
          <div className="contact-section-header">
            <h2>Find Us</h2>
            <div className="contact-section-underline"></div>
          </div>
          <div className="contact-map-container">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096966963207!2d105.7796085760705!3d21.02898198061267!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab86cece9ac1%3A0xa9bc04e14ad7948b!2zRlBUIEFwdGVjaCBIw6AgTuG7mWk!5e0!3m2!1svi!2s!4v1716555821371!5m2!1svi!2s" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Little Stars Preschool Location"
              className="contact-map"
            ></iframe>
            <div className="contact-map-marker">
              <div className="contact-marker-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="contact-section contact-faq-section">
        <div className="contact-section-container">
          <div className="contact-section-header">
            <h2>Frequently Asked Questions</h2>
            <div className="contact-section-underline"></div>
          </div>
          
          <div className="contact-faq-container">
            <div className="contact-faq-item">
              <h3>What ages do you accept?</h3>
              <p>We welcome children from 2 to 5 years of age in our various programs. Our classrooms are divided by age groups to ensure appropriate developmental activities.</p>
            </div>
            
            <div className="contact-faq-item">
              <h3>What are your operating hours?</h3>
              <p>Our standard hours are Monday to Friday from 8:00 AM to 4:30 PM. We also offer early drop-off from 7:30 AM and extended care until 6:00 PM for an additional fee.</p>
            </div>
            
            <div className="contact-faq-item">
              <h3>How do I enroll my child?</h3>
              <p>The enrollment process begins with submitting an application form, followed by a tour of our facility. Once accepted, we'll provide a registration packet with all necessary paperwork.</p>
            </div>
            
            <div className="contact-faq-item">
              <h3>What is your teacher-to-child ratio?</h3>
              <p>Our teacher-to-child ratio exceeds state requirements. For toddlers (2-3 years), we maintain a 1:4 ratio. For preschoolers (3-5 years), our ratio is 1:8.</p>
            </div>
            
            <div className="contact-faq-item">
              <h3>Do you provide meals?</h3>
              <p>Yes, we provide nutritious morning and afternoon snacks. Parents are responsible for sending lunch with their child, or they may opt into our lunch program for an additional fee.</p>
            </div>
            
            <div className="contact-faq-item">
              <h3>What is your curriculum like?</h3>
              <p>Our curriculum is play-based with a focus on whole-child development. We incorporate elements from several early childhood approaches including Reggio Emilia, Montessori, and Creative Curriculum.</p>
            </div>
          </div>
          
          <div className="contact-faq-cta">
            <p>Don't see your question? Contact us directly!</p>
            <button className="contact-btn-secondary">View All FAQs</button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="contact-section contact-cta-section">
        <div className="contact-cloud-decoration contact-cloud-1"></div>
        <div className="contact-cloud-decoration contact-cloud-2"></div>
        <div className="contact-section-container">
          <div className="contact-cta-content">
            <h2>Ready to Visit Little Stars?</h2>
            <p>The best way to learn about our program is to see it in action!</p>
            <button className="contact-btn-primary">Schedule a Tour Today</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
