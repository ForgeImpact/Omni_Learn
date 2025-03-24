// Frontend Application - index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// App.js - Main application component
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DeviceProvider } from './contexts/DeviceContext';
import { LearningProvider } from './contexts/LearningContext';
import { OfflineProvider } from './contexts/OfflineContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Loading from './components/ui/Loading';
import './App.css';

// Lazy-loaded components for better performance
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CourseLibrary = lazy(() => import('./pages/CourseLibrary'));
const LearningModule = lazy(() => import('./pages/LearningModule'));
const CollaborativeSpace = lazy(() => import('./pages/CollaborativeSpace'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = React.useContext(AuthContext);
  
  if (loading) return <Loading />;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DeviceProvider>
          <LearningProvider>
            <OfflineProvider>
              <div className="app-container">
                <Navbar />
                <main className="main-content">
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/courses" 
                        element={
                          <ProtectedRoute>
                            <CourseLibrary />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/learn/:moduleId" 
                        element={
                          <ProtectedRoute>
                            <LearningModule />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/collaborate/:spaceId" 
                        element={
                          <ProtectedRoute>
                            <CollaborativeSpace />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
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
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </OfflineProvider>
          </LearningProvider>
        </DeviceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

// index.css - Base styles
body {
  margin: 0;
  font-family: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
}

* {
  box-sizing: border-box;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

// App.css - Main application styles
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

// Custom button styles
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.btn-primary {
  background-color: #1a73e8;
  color: white;
}

.btn-primary:hover {
  background-color: #1557b0;
}

.btn-secondary {
  background-color: #e8f0fe;
  color: #1a73e8;
}

.btn-secondary:hover {
  background-color: #d2e3fc;
}

// === CONTEXT PROVIDERS ===

// AuthContext.js - Authentication context
import React, { createContext, useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleAuthProvider);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// DeviceContext.js - Device detection and adaptation
import React, { createContext, useState, useEffect } from 'react';

export const DeviceContext = createContext();

export function DeviceProvider({ children }) {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'unknown', // 'mobile', 'tablet', 'laptop', 'desktop'
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    capabilities: {
      processingPower: 'medium',
      hasWebGL: false,
      hasAR: false,
      hasVR: false,
      hasTouchScreen: false,
      hasWebcam: false,
      hasMicrophone: false
    },
    networkInfo: {
      connectionType: 'unknown',
      bandwidth: 'unknown'
    }
  });

  useEffect(() => {
    // Device type detection
    const detectDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      if (width < 1440) return 'laptop';
      return 'desktop';
    };

    // Device capabilities detection
    const detectCapabilities = async () => {
      // WebGL detection
      const hasWebGL = () => {
        try {
          const canvas = document.createElement('canvas');
          return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
          return false;
        }
      };

      // AR detection
      const hasAR = () => {
        return 'xr' in navigator && navigator.xr !== undefined;
      };

      // VR detection
      const hasVR = () => {
        return 'xr' in navigator && navigator.xr !== undefined;
      };

      // Touch screen detection
      const hasTouchScreen = () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      };

      // Camera detection
      const hasWebcam = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return false;
          }
          const devices = await navigator.mediaDevices.enumerateDevices();
          return devices.some(device => device.kind === 'videoinput');
        } catch (e) {
          return false;
        }
      };

      // Microphone detection
      const hasMicrophone = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return false;
          }
          const devices = await navigator.mediaDevices.enumerateDevices();
          return devices.some(device => device.kind === 'audioinput');
        } catch (e) {
          return false;
        }
      };

      // Processing power estimation
      const estimateProcessingPower = () => {
        const startTime = performance.now();
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration < 50) return 'high';
        if (duration < 200) return 'medium';
        return 'low';
      };

      // Network info detection
      const detectNetworkInfo = () => {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!connection) {
          return {
            connectionType: 'unknown',
            bandwidth: 'unknown'
          };
        }
        
        let bandwidth = 'unknown';
        if (connection.effectiveType) {
          switch (connection.effectiveType) {
            case 'slow-2g':
            case '2g':
              bandwidth = 'low';
              break;
            case '3g':
              bandwidth = 'medium';
              break;
            case '4g':
              bandwidth = 'high';
              break;
            default:
              bandwidth = 'unknown';
          }
        }
        
        return {
          connectionType: connection.effectiveType || 'unknown',
          bandwidth
        };
      };

      const webGLSupport = hasWebGL();
      const arSupport = hasAR();
      const vrSupport = hasVR();
      const touchScreen = hasTouchScreen();
      const webcamSupport = await hasWebcam();
      const microphoneSupport = await hasMicrophone();
      const processingPower = estimateProcessingPower();
      const networkInfo = detectNetworkInfo();

      return {
        processingPower,
        hasWebGL: webGLSupport,
        hasAR: arSupport,
        hasVR: vrSupport,
        hasTouchScreen: touchScreen,
        hasWebcam: webcamSupport,
        hasMicrophone: microphoneSupport,
        networkInfo
      };
    };

    const updateDeviceInfo = async () => {
      const type = detectDeviceType();
      const screenSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      const capabilities = await detectCapabilities();
      
      setDeviceInfo({
        type,
        screenSize,
        capabilities: {
          processingPower: capabilities.processingPower,
          hasWebGL: capabilities.hasWebGL,
          hasAR: capabilities.hasAR,
          hasVR: capabilities.hasVR,
          hasTouchScreen: capabilities.hasTouchScreen,
          hasWebcam: capabilities.hasWebcam,
          hasMicrophone: capabilities.hasMicrophone
        },
        networkInfo: capabilities.networkInfo
      });
    };

    updateDeviceInfo();

    const handleResize = () => {
      setDeviceInfo(prev => ({
        ...prev,
        type: detectDeviceType(),
        screenSize: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get appropriate avatar type based on device capabilities
  const getAvatarType = () => {
    const { type, capabilities } = deviceInfo;
    
    if (type === 'desktop' || type === 'laptop') {
      if (capabilities.hasWebGL && capabilities.processingPower !== 'low') {
        return '3d';
      }
    }
    
    if (type === 'tablet') {
      if (capabilities.hasWebGL && capabilities.processingPower !== 'low') {
        return '2.5d';
      }
    }
    
    return '2d';
  };

  const value = {
    deviceInfo,
    getAvatarType
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}

// LearningProvider.js - Learning context for personalized experience
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { DeviceContext } from './DeviceContext';
import { fetchUserLearningData, updateUserProgress } from '../services/learningService';
import { GeminiService } from '../services/geminiService';

export const LearningContext = createContext();

export function LearningProvider({ children }) {
  const { currentUser } = useContext(AuthContext);
  const { deviceInfo } = useContext(DeviceContext);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const gemini = new GeminiService();

  useEffect(() => {
    const loadLearningData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchUserLearningData(currentUser.uid);
        setCourses(data.courses);
        setProgress(data.progress);
        
        // Generate personalized recommendations using Gemini
        const geminiRecommendations = await gemini.generateRecommendations(
          data.