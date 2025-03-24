// src/pages/ModuleView.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLearning } from '../contexts/LearningContext';
import deviceAdapterService from '../services/deviceAdapterService';
import { getModuleDetails } from '../services/learningContentService';

// Components
import AvatarSystem from '../components/avatar/AvatarSystem';
import AdaptiveContent from '../components/content/AdaptiveContent';
import ModuleNavigation from '../components/navigation/ModuleNavigation';
import ModuleProgress from '../components/progress/ModuleProgress';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const ModuleView = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    currentCourse, 
    moduleList, 
    loadCourse, 
    updateModuleProgress, 
    getModuleProgress 
  } = useLearning();
  
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [deviceType, setDeviceType] = useState(deviceAdapterService.detectDeviceType());
  const [avatarEmotion, setAvatarEmotion] = useState('neutral');
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);

  useEffect(() => {
    const loadModuleData = async () => {
      try {
        setLoading(true);
        
        // If we don't have the current course loaded, load it
        if (!currentCourse || currentCourse.id !== courseId) {
          await loadCourse(courseId);
        }
        
        // Get module details
        const module = await getModuleDetails(moduleId);
        setModuleData(module);
        
        // Get current progress
        const currentProgress = getModuleProgress(courseId, moduleId);
        setProgress(currentProgress);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading module:', err);
        setError('Failed to load module');
        setLoading(false);
      }
    };