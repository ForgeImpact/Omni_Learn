// src/components/avatar/AvatarSystem.js

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import deviceAdapterService from '../../services/deviceAdapterService';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/userProfileService';

// Avatar components for different fidelity levels
import Avatar3D from './Avatar3D';
import Avatar2_5D from './Avatar2_5D';
import Avatar2D from './Avatar2D';
import AvatarText from './AvatarText';

const AvatarSystem = ({ 
  avatarId = 'default',
  onReady,
  onError,
  emotionState = 'neutral',
  speaking = false,
  actions = []
}) => {
  const [avatarFidelity, setAvatarFidelity] = useState(null);
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const deviceCapabilities = useRef(null);

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        setLoading(true);
        
        // Detect device capabilities
        deviceCapabilities.current = deviceAdapterService.detectDeviceCapabilities();
        
        // Get user preferences if logged in
        let userPreferredFidelity = null;
        if (currentUser) {
          const userProfile = await getUserProfile(currentUser.uid);
          const deviceType = deviceAdapterService.detectDeviceType();
          userPreferredFidelity = userProfile?.devicePreferences?.[deviceType]?.avatarFidelity || null;
        }
        
        // Determine avatar fidelity (use user preference if available, otherwise auto-detect)
        const detectedFidelity = deviceAdapterService.determineAvatarFidelity(deviceCapabilities.current);
        const fidelity = userPreferredFidelity || detectedFidelity;
        setAvatarFidelity(fidelity);
        
        // Load avatar configuration
        const config = await loadAvatarConfig(avatarId, fidelity);
        setAvatarConfig(config);
        
        setLoading(false);
        if (onReady) onReady(fidelity);
      } catch (err) {
        console.error('Avatar initialization error:', err);
        setError(err.message);
        setLoading(false);
        if (onError) onError(err);
      }
    };
    
    initializeAvatar();
  }, [avatarId, currentUser, onReady, onError]);

  const loadAvatarConfig = async (id, fidelity) => {
    // This would typically load avatar configuration from your backend
    // For now, we'll return a mock configuration based on fidelity
    return {
      id,
      fidelity,
      modelUrl: `/assets/avatars/${id}/${fidelity}/model.json`,
      textureUrl: `/assets/avatars/${id}/${fidelity}/texture.png`,
      animationSet: `/assets/avatars/${id}/${fidelity}/animations.json`,
      emotionMappings: {
        happy: 'smile',
        sad: 'frown',
        surprised: 'wideeyes',
        confused: 'puzzled',
        neutral: 'neutral'
      }
    };
  };

  if (loading) {
    return <div className="avatar-loading">Loading AI Avatar...</div>;
  }

  if (error) {
    return <div className="avatar-error">Error loading avatar: {error}</div>;
  }

  // Render appropriate avatar component based on fidelity
  switch (avatarFidelity) {
    case deviceAdapterService.AVATAR_FIDELITY.HIGH:
      return (
        <Avatar3D 
          config={avatarConfig}
          emotionState={emotionState}
          speaking={speaking}
          actions={actions}
        />
      );
    case deviceAdapterService.AVATAR_FIDELITY.MEDIUM:
      return (
        <Avatar2_5D
          config={avatarConfig}
          emotionState={emotionState}
          speaking={speaking}
          actions={actions}
        />
      );
    case deviceAdapterService.AVATAR_FIDELITY.LOW:
      return (
        <Avatar2D
          config={avatarConfig}
          emotionState={emotionState}
          speaking={speaking}
          actions={actions}
        />
      );
    case deviceAdapterService.AVATAR_FIDELITY.TEXT:
      return (
        <AvatarText
          config={avatarConfig}
          emotionState={emotionState}
          speaking={speaking}
          actions={actions}
        />
      );
    default:
      return <div className="avatar-error">Invalid avatar fidelity</div>;
  }
};

AvatarSystem.propTypes = {
  avatarId: PropTypes.string,
  onReady: PropTypes.func,
  onError: PropTypes.func,
  emotionState: PropTypes.string,
  speaking: PropTypes.bool,
  actions: PropTypes.array
};

export default AvatarSystem;
