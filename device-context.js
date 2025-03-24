// contexts/DeviceContext.js
import React, { createContext, useState, useEffect } from 'react';

export const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop',
    orientation: 'landscape',
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  });

  // Update device info on resize
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        type: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
        orientation: width > height ? 'landscape' : 'portrait',
        screenWidth: width,
        screenHeight: height
      });
    };

    // Initial call
    updateDeviceInfo();
    
    // Set up event listener
    window.addEventListener('resize', updateDeviceInfo);
    
    // Clean up
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceInfo }}>
      {children}
    </DeviceContext.Provider>
  );
};
