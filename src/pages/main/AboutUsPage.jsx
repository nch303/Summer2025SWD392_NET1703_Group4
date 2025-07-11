import React from 'react';
import styles from './AboutUsPage.module.css';

const AboutUsPage = () => {
  return (
    <div className={styles.aboutUsContainer}>
      {/* Hero Section */}
      <section className={styles.aboutHeroSection}>
        <div className={styles.aboutHeroOverlay}></div>
        <div className={styles.aboutHeroContent}>
          <h1>About Little Stars</h1>
          <div className={styles.aboutTitleUnderline}></div>
          <p>Where childhood dreams take flight and young minds grow bright</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutSectionContainer}>
          <div className={styles.aboutSectionHeader}>
            <h2>Our Story</h2>
            <div className={styles.aboutSectionUnderline}></div>
          </div>
          <div className={styles.aboutStoryContent}>
            <div className={styles.aboutStoryImage}>
              <img src="https://vinschool.edu.vn/wp-content/uploads/2023/08/15/Anh-bia-CLBNK.png" alt="Children playing together" />
              <div className={styles.aboutImageDecoration}></div>
            </div>
            <div className={styles.aboutStoryText}>
              <p>Founded in 2010, Little Stars Preschool began with a simple vision: to create a nurturing environment where children could learn, play, and grow at their own pace.</p>
              <p>What started as a small classroom with just 15 students has blossomed into a vibrant community of young learners, passionate educators, and involved families all working together to provide the best early education experience.</p>
              <p>Through the years, we've remained committed to our core belief that every child is unique and deserves an education tailored to their individual needs and interests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutRainbowTop}></div>
        <div className={styles.aboutSectionContainer}>
          <div className={styles.aboutSectionHeader}>
            <h2>Our Philosophy</h2>
            <div className={styles.aboutSectionUnderline}></div>
          </div>
          <div className={styles.aboutPhilosophyCards}>
            <div className={styles.aboutPhilosophyCard}>
              <div className={styles.aboutCardIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <h3>Play-Based Learning</h3>
              <p>We believe children learn best through play. Our curriculum incorporates games, creative activities, and imaginative exploration to foster a love of learning.</p>
            </div>
            <div className={styles.aboutPhilosophyCard}>
              <div className={styles.aboutCardIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h3>Individual Growth</h3>
              <p>Each child develops at their own pace. We honor this by providing personalized attention and creating learning opportunities that meet each child where they are.</p>
            </div>
            <div className={styles.aboutPhilosophyCard}>
              <div className={styles.aboutCardIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <h3>Community Connection</h3>
              <p>Children thrive when surrounded by a supportive community. We foster strong relationships between students, teachers, and families to create a village of care.</p>
            </div>
          </div>
        </div>
        <div className={styles.aboutRainbowBottom}></div>
      </section>

      {/* Our Team Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutSectionContainer}>
          <div className={styles.aboutSectionHeader}>
            <h2>Meet Our Team</h2>
            <div className={styles.aboutSectionUnderline}></div>
          </div>
          <p className={styles.aboutTeamIntro}>Our dedicated staff brings together decades of experience in early childhood education, creating a warm and stimulating environment for your child.</p>
          <div className={styles.aboutTeamMembers}>
            <div className={styles.aboutTeamMember}>
              <div className={styles.aboutMemberImage}>
                <img src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Sarah Johnson" />
              </div>
              <div className={styles.aboutMemberInfo}>
                <h3>Sarah Johnson</h3>
                <p className={styles.aboutMemberTitle}>Director</p>
                <p className={styles.aboutMemberDescription}>With over 15 years of experience in early childhood education, Sarah leads our school with passion and creativity.</p>
              </div>
            </div>
            <div className={styles.aboutTeamMember}>
              <div className={styles.aboutMemberImage}>
                <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Michael Chen" />
              </div>
              <div className={styles.aboutMemberInfo}>
                <h3>Michael Chen</h3>
                <p className={styles.aboutMemberTitle}>Lead Teacher</p>
                <p className={styles.aboutMemberDescription}>Michael specializes in developmental psychology and brings joy to the classroom with his innovative teaching methods.</p>
              </div>
            </div>
            <div className={styles.aboutTeamMember}>
              <div className={styles.aboutMemberImage}>
                <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Emma Rodriguez" />
              </div>
              <div className={styles.aboutMemberInfo}>
                <h3>Emma Rodriguez</h3>
                <p className={styles.aboutMemberTitle}>Curriculum Coordinator</p>
                <p className={styles.aboutMemberDescription}>Emma designs our engaging curriculum that balances academic readiness with social-emotional development.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutSectionContainer}>
          <div className={styles.aboutSectionHeader}>
            <h2>Our Facilities</h2>
            <div className={styles.aboutSectionUnderline}></div>
          </div>
          <div className={styles.aboutFacilitiesGrid}>
            <div className={styles.aboutFacilityItem}>
              <div className={styles.aboutFacilityIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2L7 10l-4.5 6h19l-7.5-10z" />
                </svg>
              </div>
              <h3>Natural Playgrounds</h3>
              <p>Our outdoor spaces feature natural elements that encourage exploration, physical activity, and connection with nature.</p>
            </div>
            <div className={styles.aboutFacilityItem}>
              <div className={styles.aboutFacilityIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </div>
              <h3>Reading Nooks</h3>
              <p>Cozy corners filled with books spark imagination and foster a love of reading from an early age.</p>
            </div>
            <div className={styles.aboutFacilityItem}>
              <div className={styles.aboutFacilityIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                </svg>
              </div>
              <h3>Art Studio</h3>
              <p>A bright, dedicated space where children can express themselves through various art mediums and creative projects.</p>
            </div>
            <div className={styles.aboutFacilityItem}>
              <div className={styles.aboutFacilityIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z" />
                </svg>
              </div>
              <h3>STEM Discovery Center</h3>
              <p>Hands-on learning stations where children can experiment, build, and develop early science and math skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutSectionContainer}>
          <div className={styles.aboutSectionHeader}>
            <h2>Our Core Values</h2>
            <div className={styles.aboutSectionUnderline}></div>
          </div>
          <div className={styles.aboutValuesList}>
            <div className={styles.aboutValueItem}>
              <div className={styles.aboutValueNumber}>01</div>
              <div className={styles.aboutValueContent}>
                <h3>Safety First</h3>
                <p>We maintain strict safety protocols to ensure your child's physical and emotional well-being is protected at all times.</p>
              </div>
            </div>
            <div className={styles.aboutValueItem}>
              <div className={styles.aboutValueNumber}>02</div>
              <div className={styles.aboutValueContent}>
                <h3>Respect for All</h3>
                <p>We celebrate diversity and teach children to appreciate differences in themselves and others.</p>
              </div>
            </div>
            <div className={styles.aboutValueItem}>
              <div className={styles.aboutValueNumber}>03</div>
              <div className={styles.aboutValueContent}>
                <h3>Joy in Learning</h3>
                <p>Education should be fun! We create positive experiences that build confidence and instill a lifelong love of learning.</p>
              </div>
            </div>
            <div className={styles.aboutValueItem}>
              <div className={styles.aboutValueNumber}>04</div>
              <div className={styles.aboutValueContent}>
                <h3>Family Partnership</h3>
                <p>We view parents as essential partners in education and welcome their involvement in our school community.</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.aboutRainbowDecoration}></div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutSectionContainer}>
          <div className={styles.aboutSectionHeader}>
            <h2>Parent Testimonials</h2>
            <div className={styles.aboutSectionUnderline}></div>
          </div>
          <div className={styles.aboutTestimonialsSlider}>
            <div className={styles.aboutTestimonial}>
              <div className={styles.aboutQuoteIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
                </svg>
              </div>
              <p className={styles.aboutTestimonialText}>"Little Stars has been a second home for my daughter. The care and attention she receives is exceptional, and her growth both academically and socially has been remarkable."</p>
              <div className={styles.aboutTestimonialAuthor}>
                <p className={styles.aboutAuthorName}>- Amanda Peterson</p>
                <p className={styles.aboutAuthorRelation}>Parent of Emily, Pre-K</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
