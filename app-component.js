// src/App.js

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LearningProvider } from './contexts/LearningContext';
import deviceAdapterService from './services/deviceAdapterService';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import ModuleView from './pages/ModuleView';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  const [deviceType, setDeviceType] = useState(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    // Detect device type on mount
    const type = deviceAdapterService.detectDeviceType();
    setDeviceType(type);
    setIsLayoutReady(true);
    
    // Listen for window resize events to update device type
    const handleResize = () => {
      const newType = deviceAdapterService.detectDeviceType();
      if (newType !== deviceType) {
        setDeviceType(newType);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [deviceType]);

  // Get layout classes based on device type
  const getLayoutClasses = () => {
    const baseClasses = 'app-container';
    
    switch (deviceType) {
      case deviceAdapterService.DEVICE_TYPES.MOBILE:
        return `${baseClasses} app-mobile`;
      case deviceAdapterService.DEVICE_TYPES.TABLET:
        return `${baseClasses} app-tablet`;
      case deviceAdapterService.DEVICE_TYPES.LAPTOP:
        return `${baseClasses} app-laptop`;
      case deviceAdapterService.DEVICE_TYPES.DESKTOP:
        return `${baseClasses} app-desktop`;
      default:
        return baseClasses;
    }
  };

  // Render loading state while detecting device type
  if (!isLayoutReady) {
    return <div className="app-loading">Loading OmniLearn...</div>;
  }

  return (
    <Router>
      <AuthProvider>
        <LearningProvider>
          <div className={getLayoutClasses()}>
            <Header deviceType={deviceType} />
            
            <div className="app-content">
              {deviceType !== deviceAdapterService.DEVICE_TYPES.MOBILE && (
                <Sidebar deviceType={deviceType} />
              )}
              
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/courses" 
                    element={
                      <ProtectedRoute>
                        <CourseList />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/courses/:courseId" 
                    element={
                      <ProtectedRoute>
                        <CourseDetail />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/courses/:courseId/modules/:moduleId" 
                    element={
                      <ProtectedRoute>
                        <ModuleView />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            
            <Footer deviceType={deviceType} />
          </div>
        </LearningProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
