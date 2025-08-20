import React, { useEffect } from "react"; // Add useEffect import
import Success from "../../components/Success";
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../../utils/authStorage';

export default function VerificationSuccess() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Debug: Check what tokens we have
    const registrationToken = authStorage.getRegistrationToken();
    const authToken = authStorage.getToken();
    const canAddCar = authStorage.canAddCar();
    
    console.log('VerificationSuccess Debug:', {
      registrationToken: !!registrationToken,
      authToken: !!authToken,
      canAddCar,
      userInfo: authStorage.getUserInfo()
    });

    
    const timer = setTimeout(() => {
      if (canAddCar) {
        console.log('Navigating to add-car page');
        navigate('/add-car');
      } else {
        console.log('Cannot add car, redirecting to login');
        navigate('/auth/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Success />
    </>
  );
}