import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <>
      <Navbar />
      <div className="not-found-page-wrapper">
        <div className="not-found-container">
          <div className="not-found-content">
            <div className="error-number">
              <div className="number four-left">4</div>
              <div className="number zero">
                <div className="sad-face">
                  <div className="eyes">
                    <div className="eye left"></div>
                    <div className="eye right"></div>
                  </div>
                  <div className="mouth"></div>
                </div>
              </div>
              <div className="number four-right">4</div>
            </div>
            
            <h1 className="error-title">Ôi không!</h1>
            <p className="error-message-not-found">Trang bạn đang tìm kiếm đã đi chơi mất rồi</p>
            
            <div className="balloons">
              <div className="balloon balloon-1"></div>
              <div className="balloon balloon-2"></div>
              <div className="balloon balloon-3"></div>
            </div>

            <Link to="/" className="home-button">
              <div className="button-content">
                <FaHome className="button-icon" />
                <span className="button-text">Quay về trang chủ</span>
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
