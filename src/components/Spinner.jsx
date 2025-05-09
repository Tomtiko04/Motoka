import React from "react";
import SpinnerImage from "../assets/images/motoka spinner.gif";

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        <img src={SpinnerImage} alt="Loading..." className="spinner-image" />
      </div>
      <style jsx>{`
        .loading-spinner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.8);
          z-index: 9999;
        }

        .loading-spinner-container {
          background-color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .spinner-image {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}
