import React from 'react';
import './LoadingCover.css';

const LoadingCover = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="loading-cover">
      <div className="loading-content">
        <div className="school-bus">
          <div className="bus-body"></div>
          <div className="bus-window front"></div>
          <div className="bus-window back"></div>
          <div className="bus-window middle"></div>
          <div className="bus-wheel front"></div>
          <div className="bus-wheel back"></div>
          <div className="bus-light"></div>
        </div>
        <div className="loading-text">
          <span>L</span>
          <span>o</span>
          <span>a</span>
          <span>d</span>
          <span>i</span>
          <span>n</span>
          <span>g</span>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
        <div className="clouds">
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="cloud cloud3"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCover;