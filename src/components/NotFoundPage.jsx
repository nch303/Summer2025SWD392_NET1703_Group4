import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  return (
    <>
      <Navbar />
      <div className={styles.notFoundPageWrapper}>
        <div className={styles.notFoundContainer}>
          <div className={styles.notFoundContent}>
            <div className={styles.errorNumber}>
              <div className={`${styles.number} ${styles.fourLeft}`}>4</div>
              <div className={`${styles.number} ${styles.zero}`}>
                <div className={styles.sadFace}>
                  <div className={styles.eyes}>
                    <div className={`${styles.eye} ${styles.left}`}></div>
                    <div className={`${styles.eye} ${styles.right}`}></div>
                  </div>
                  <div className={styles.mouth}></div>
                </div>
              </div>
              <div className={`${styles.number} ${styles.fourRight}`}>4</div>
            </div>
            
            <h1 className={styles.errorTitle}>Ôi không!</h1>
            <p className={styles.errorMessageNotFound}>Trang bạn đang tìm kiếm đã đi chơi mất rồi</p>
            
            <div className={styles.balloons}>
              <div className={`${styles.balloon} ${styles.balloon1}`}></div>
              <div className={`${styles.balloon} ${styles.balloon2}`}></div>
              <div className={`${styles.balloon} ${styles.balloon3}`}></div>
            </div>

            <Link to="/" className={styles.homeButton}>
              <div className={styles.buttonContent}>
                <FaHome className={styles.buttonIcon} />
                <span className={styles.buttonText}>Quay về trang chủ</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFoundPage;
