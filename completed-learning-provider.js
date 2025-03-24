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
          data.courses,
          data.progress,
          data.learningPreferences,
          deviceInfo
        );
        
        setRecommendations(geminiRecommendations);
        setLoading(false);
      } catch (error) {
        console.error("Error loading learning data:", error);
        setLoading(false);
      }
    };

    loadLearningData();
  }, [currentUser, deviceInfo]);

  // Update user progress
  const updateProgress = async (moduleId, lessonId, progress) => {
    if (!currentUser) return;
    
    try {
      await updateUserProgress(currentUser.uid, moduleId, lessonId, progress);
      
      // Update local state
      setProgress(prevProgress => ({
        ...prevProgress,
        [moduleId]: {
          ...prevProgress[moduleId],
          [lessonId]: progress
        }
      }));
      
      // Generate new recommendations based on updated progress
      const updatedRecommendations = await gemini.generateRecommendations(
        courses,
        {
          ...progress,
          [moduleId]: {
            ...progress[moduleId],
            [lessonId]: progress
          }
        },
        currentUser.learningPreferences,
        deviceInfo
      );
      
      setRecommendations(updatedRecommendations);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  // Load a specific learning module
  const loadModule = async (moduleId) => {
    try {
      setLoading(true);
      const moduleData = courses.find(course => course.modules.some(module => module.id === moduleId))
        ?.modules.find(module => module.id === moduleId);
      
      if (!moduleData) {
        throw new Error("Module not found");
      }
      
      // Adapt content based on device capabilities
      const adaptedContent = await adaptContentForDevice(moduleData, deviceInfo);
      setCurrentModule(adaptedContent);
      setLoading(false);
    } catch (error) {
      console.error("Error loading module:", error);
      setLoading(false);
    }
  };

  // Adapt content based on device capabilities
  const adaptContentForDevice = async (module, deviceInfo) => {
    const { type, capabilities } = deviceInfo;
    let adaptedModule = { ...module };
    
    // Adjust content based on device type and capabilities
    if (type === 'mobile' || capabilities.processingPower === 'low') {
      // Reduce complexity for mobile or low-power devices
      adaptedModule.content = module.content.map(item => {
        if (item.type === '3d-model' || item.type === 'complex-simulation') {
          return {
            ...item,
            type: 'simplified-image',
            content: item.fallbackContent
          };
        }
        return item;
      });
    }
    
    if (!capabilities.hasWebGL) {
      // Replace WebGL content with alternatives
      adaptedModule.content = module.content.map(item => {
        if (item.requiresWebGL) {
          return {
            ...item,
            type: 'video',
            content: item.fallbackContent
          };
        }
        return item;
      });
    }

    if (capabilities.networkInfo.bandwidth === 'low') {
      // Optimize for low bandwidth
      adaptedModule.content = module.content.map(item => {
        if (item.type === 'video' || item.type === 'high-res-image') {
          return {
            ...item,
            quality: 'low',
            size: 'compressed'
          };
        }
        return item;
      });
    }
    
    return adaptedModule;
  };

  // Get user progress percentage for a specific course
  const getCourseProgress = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;
    
    let completedLessons = 0;
    let totalLessons = 0;
    
    course.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        totalLessons++;
        if (progress[module.id]?.[lesson.id]?.completed) {
          completedLessons++;
        }
      });
    });
    
    return totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  };

  // Get personalized learning path
  const getLearningPath = async () => {
    try {
      const path = await gemini.generateLearningPath(
        courses,
        progress,
        currentUser.learningPreferences,
        deviceInfo
      );
      
      return path;
    } catch (error) {
      console.error("Error generating learning path:", error);
      return [];
    }
  };

  const value = {
    courses,
    progress,
    recommendations,
    currentModule,
    loading,
    updateProgress,
    loadModule,
    getCourseProgress,
    getLearningPath
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}
