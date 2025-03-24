// src/services/deviceAdapterService.js

// Device types
export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  LAPTOP: 'laptop',
  DESKTOP: 'desktop'
};

// Avatar fidelity levels
export const AVATAR_FIDELITY = {
  HIGH: '3d_full',
  MEDIUM: '2.5d',
  LOW: '2d',
  TEXT: 'text_only'
};

// Content quality levels
export const CONTENT_QUALITY = {
  ULTRA: 'ultra',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  MINIMAL: 'minimal'
};

// Detect device type based on screen size and user agent
export const detectDeviceType = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;
  
  // Check for mobile
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (Math.min(width, height) < 768) {
      return DEVICE_TYPES.MOBILE;
    } else {
      return DEVICE_TYPES.TABLET;
    }
  }
  
  // For desktops/laptops
  if (width < 1024) {
    return DEVICE_TYPES.TABLET;
  } else if (width >= 1024 && width < 1440) {
    return DEVICE_TYPES.LAPTOP;
  } else {
    return DEVICE_TYPES.DESKTOP;
  }
};

// Detect device capabilities
export const detectDeviceCapabilities = () => {
  const capabilities = {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    touchSupport: 'ontouchstart' in window,
    hasWebGL: hasWebGLSupport(),
    cpuCores: navigator.hardwareConcurrency || 2,
    hasWebRTC: 'RTCPeerConnection' in window,
    hasMicrophone: hasMediaDevices('audioinput'),
    hasCamera: hasMediaDevices('videoinput'),
    hasGyroscope: hasDeviceOrientation(),
    hasARSupport: hasARSupport(),
    connection: getConnectionInfo(),
    memory: getMemoryInfo()
  };
  
  return capabilities;
};

// Check WebGL support
const hasWebGLSupport = () => {
  try