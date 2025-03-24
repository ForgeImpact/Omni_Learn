// src/services/deviceAdapterService.js (continued)

// Check WebGL support
const hasWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// Check for media devices
const hasMediaDevices = (kind) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    return false;
  }
  
  return new Promise((resolve) => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        resolve(devices.some(device => device.kind === kind));
      })
      .catch(() => {
        resolve(false);
      });
  });
};

// Check for device orientation support (gyroscope)
const hasDeviceOrientation = () => {
  return 'DeviceOrientationEvent' in window;
};

// Check for AR support
const hasARSupport = () => {
  return 'XRSystem' in window || 'webkitXRSystem' in window || 
         'mozXRSystem' in window || 'msXRSystem' in window;
};

// Get connection information
const getConnectionInfo = () => {
  const connection = navigator.connection || 
                     navigator.mozConnection || 
                     navigator.webkitConnection;
  
  if (connection) {
    return {
      type: connection.type,
      effectiveType: connection.effectiveType,
      downlinkMax: connection.downlinkMax,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  
  return null;
};

// Get memory information if available
const getMemoryInfo = () => {
  if (navigator.deviceMemory) {
    return navigator.deviceMemory;
  }
  return null;
};

// Determine appropriate avatar fidelity based on device capabilities
export const determineAvatarFidelity = (capabilities) => {
  if (!capabilities.hasWebGL) {
    return AVATAR_FIDELITY.TEXT;
  }
  
  const deviceType = detectDeviceType();
  const performanceScore = calculatePerformanceScore(capabilities);
  
  if (deviceType === DEVICE_TYPES.DESKTOP && performanceScore > 70) {
    return AVATAR_FIDELITY.HIGH;
  } else if ((deviceType === DEVICE_TYPES.DESKTOP || deviceType === DEVICE_TYPES.LAPTOP) && performanceScore > 40) {
    return AVATAR_FIDELITY.MEDIUM;
  } else if (deviceType === DEVICE_TYPES.MOBILE && performanceScore < 30) {
    return AVATAR_FIDELITY.TEXT;
  } else {
    return AVATAR_FIDELITY.LOW;
  }
};

// Calculate a performance score based on device capabilities
const calculatePerformanceScore = (capabilities) => {
  let score = 0;
  
  // CPU cores contribution (max 25 points)
  score += Math.min(capabilities.cpuCores * 4, 25);
  
  // Screen resolution contribution (max 20 points)
  const pixelCount = capabilities.screenWidth * capabilities.screenHeight * capabilities.pixelRatio;
  if (pixelCount > 4000000) score += 20;
  else if (pixelCount > 2000000) score += 15;
  else if (pixelCount > 1000000) score += 10;
  else score += 5;
  
  // WebGL support (25 points)
  if (capabilities.hasWebGL) score += 25;
  
  // Connection quality (max 20 points)
  if (capabilities.connection) {
    if (capabilities.connection.effectiveType === '4g') score += 20;
    else if (capabilities.connection.effectiveType === '3g') score += 15;
    else if (capabilities.connection.effectiveType === '2g') score += 5;
  } else {
    score += 10; // Assume average if unknown
  }
  
  // Memory (max 10 points)
  if (capabilities.memory) {
    score += Math.min(capabilities.memory, 10);
  } else {
    score += 5; // Assume average if unknown
  }
  
  return score;
};

// Determine content quality based on device capabilities and network conditions
export const determineContentQuality = (capabilities) => {
  const deviceType = detectDeviceType();
  const performanceScore = calculatePerformanceScore(capabilities);
  
  // Check for save-data mode
  if (capabilities.connection && capabilities.connection.saveData) {
    return CONTENT_QUALITY.MINIMAL;
  }
  
  // Base decision on connection type and performance
  if (capabilities.connection) {
    switch (capabilities.connection.effectiveType) {
      case '4g':
        if (deviceType === DEVICE_TYPES.DESKTOP && performanceScore > 70) {
          return CONTENT_QUALITY.ULTRA;
        } else if (performanceScore > 50) {
          return CONTENT_QUALITY.HIGH;
        } else {
          return CONTENT_QUALITY.MEDIUM;
        }
      case '3g':
        if (performanceScore > 60) {
          return CONTENT_QUALITY.MEDIUM;
        } else {
          return CONTENT_QUALITY.LOW;
        }
      case '2g':
      case 'slow-2g':
        return CONTENT_QUALITY.MINIMAL;
      default:
        return CONTENT_QUALITY.MEDIUM;
    }
  }
  
  // Fallback based on device type if connection info unavailable
  switch (deviceType) {
    case DEVICE_TYPES.DESKTOP:
      return CONTENT_QUALITY.HIGH;
    case DEVICE_TYPES.LAPTOP:
      return CONTENT_QUALITY.MEDIUM;
    case DEVICE_TYPES.TABLET:
      return CONTENT_QUALITY.MEDIUM;
    case DEVICE_TYPES.MOBILE:
      return CONTENT_QUALITY.LOW;
    default:
      return CONTENT_QUALITY.MEDIUM;
  }
};

// Get device-specific interaction modes
export const getInteractionModes = () => {
  const deviceType = detectDeviceType();
  const capabilities = detectDeviceCapabilities();
  
  const modes = {
    touch: capabilities.touchSupport,
    keyboard: deviceType !== DEVICE_TYPES.MOBILE && deviceType !== DEVICE_TYPES.TABLET,
    mouse: deviceType !== DEVICE_TYPES.MOBILE && deviceType !== DEVICE_TYPES.TABLET,
    stylus: deviceType === DEVICE_TYPES.TABLET,
    voice: capabilities.hasMicrophone,
    gesture: capabilities.hasCamera,
    ar: capabilities.hasARSupport && capabilities.hasCamera,
    motion: capabilities.hasGyroscope
  };
  
  return modes;
};

export default {
  detectDeviceType,
  detectDeviceCapabilities,
  determineAvatarFidelity,
  determineContentQuality,
  getInteractionModes,
  DEVICE_TYPES,
  AVATAR_FIDELITY,
  CONTENT_QUALITY
};
