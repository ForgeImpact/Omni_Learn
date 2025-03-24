// src/components/content/AdaptiveContent.js

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import deviceAdapterService from '../../services/deviceAdapterService';
import { getAdaptiveContent } from '../../services/learningContentService';
import { useAuth } from '../../contexts/AuthContext';

// Content components
import VideoPlayer from './VideoPlayer';
import InteractiveSimulation from './InteractiveSimulation';
import TextContent from './TextContent';
import AudioContent from './AudioContent';
import QuizComponent from './QuizComponent';
import ARExperience from './ARExperience';

const AdaptiveContent = ({
  moduleId,
  onContentLoad,
  onContentError,
  onContentComplete
}) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentQuality, setContentQuality] = useState(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const loadAdaptiveContent = async () => {
      try {
        setLoading(true);
        
        // Detect device type and capabilities
        const deviceType = deviceAdapterService.detectDeviceType();
        const capabilities = deviceAdapterService.detectDeviceCapabilities();
        
        // Determine appropriate content quality
        const quality = deviceAdapterService.determineContentQuality(capabilities);
        setContentQuality(quality);
        
        // Fetch content appropriate for this device
        const adaptiveContent = await getAdaptiveContent(moduleId, deviceType);
        setContent(adaptiveContent);
        
        setLoading(false);
        if (onContentLoad) onContentLoad(adaptiveContent);
      } catch (err) {
        console.error('Content loading error:', err);
        setError(err.message);
        setLoading(false);
        if (onContentError) onContentError(err);
      }
    };
    
    loadAdaptiveContent();
  }, [moduleId, onContentLoad, onContentError]);

  const handleContentComplete = () => {
    if (onContentComplete) onContentComplete(moduleId);
  };

  if (loading) {
    return <div className="content-loading">Loading learning content...</div>;
  }

  if (error) {
    return <div className="content-error">Error loading content: {error}</div>;
  }

  if (!content) {
    return <div className="content-error">No content available for this module</div>;
  }

  // Render appropriate content component based on content type
  const renderContent = () => {
    switch (content.contentType) {
      case 'video':
        return (
          <VideoPlayer
            videoUrl={content.mediaUrl}
            quality={contentQuality}
            captions={content.captions}
            onComplete={handleContentComplete}
          />
        );
      case 'simulation':
        return (