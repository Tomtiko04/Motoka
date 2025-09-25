import React from 'react'
import SpinnerImage from "../assets/images/motoka spinner.gif"

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <img src={SpinnerImage} alt="Loading..." className="spinner-image" />
    </div>
  );
}
