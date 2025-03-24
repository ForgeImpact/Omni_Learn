// src/contexts/LearningContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserProfile, 
  updateLearningProgress 
} from '../services/userProfileService';
import { 
  getCourses, 
  getCourseDetails, 
  getCourseModules 
} from '../services/learningContentService';

const LearningContext = createContext();

export const useLearning = () => {
  return useContext(LearningContext);
};

export const LearningProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProgress, setUserProgress] = useState({});
  const [activeCourses, setActiveCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleList, setModuleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's learning data when they log in
  useEffect(() => {
    const loadUserLearningData = async () => {
      if (!currentUser) {
        setUserProgress({});
        setActiveCourses([]);
        setCurrentCourse(null);
        setCurrentModule(null);
        setModuleList([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get user profile including learning progress
        const userProfile = await getUserProfile(currentUser.uid);
        
        // Extract learning progress and active courses
        setUserProgress(userProfile.learningProgress || {});
        setActiveCourses(userProfile.activeCourses || []);
        
        // If user has active courses, load the first one
        if (userProfile.activeCourses && userProfile.activeCourses.length > 0) {
          await loadCourse(userProfile.activeCourses[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading learning data:', err);
        setError('Failed to load learning data');
        setLoading(false);
      }
    };
    
    loadUserLearningData();
  }, [currentUser]);

  // Load course details and modules
  const loadCourse = async (courseId) => {
    try {
      // Get course details
      const course = await getCourseDetails(courseId);
      setCurrentCourse(course);
      
      // Get course modules
      const modules = await getCourseModules(courseId);
      setModuleList(modules);
      
      // Set current module (first module or first incomplete module)
      if (modules.length > 0) {
        const progress = userProgress[courseId] || {};
        const firstIncompleteModule = modules.find(module => !progress[module.id] || progress[module.id] < 100);
        
        if (firstIncompleteModule) {
          setCurrentModule(firstIncompleteModule);
        } else {
          setCurrentModule(modules[0]);
        }
      }
      
      return course;
    } catch (err) {
      console.error('Error loading course:', err);
      setError('Failed to load course');
      throw err;
    }
  };

  // Update module progress
  const updateModuleProgress = async (moduleId, progressPercentage) => {
    if (!currentUser || !currentCourse) return;
    
    try {
      // Update progress in Firestore
      await updateLearningProgress(currentUser.uid, currentCourse.id, moduleId, progressPercentage);
      
      // Update local state
      setUserProgress(prev => ({
        ...prev,
        [currentCourse.id]: {
          ...(prev[currentCourse.id] || {}),
          [moduleId]: progressPercentage
        }
      }));
      
      // If module is complete, move to next module
      if (progressPercentage >= 100) {
        moveToNextModule(moduleId);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating module progress:', err);
      setError('Failed to update progress');
      return false;
    }
  };

  // Move to next module
  const moveToNextModule = (currentModuleId) => {
    if (!moduleList.length) return;
    
    const currentIndex = moduleList.findIndex(module => module.id === currentModuleId);
    if (currentIndex === -1 || currentIndex >= moduleList.length - 1) return;
    
    setCurrentModule(moduleList[currentIndex + 1]);
  };

  // Get module progress
  const getModuleProgress = (courseId, moduleId) => {
    if (!userProgress[courseId] || !userProgress[courseId][moduleId]) {
      return 0;
    }
    return userProgress[courseId][moduleId];
  };

  // Get course progress
  const getCourseProgress = (courseId) => {
    if (!userProgress[courseId]) return 0;
    
    const moduleProgress = Object.values(userProgress[courseId]);
    if (moduleProgress.length === 0) return 0;
    
    const totalProgress = moduleProgress.reduce((sum, progress) => sum + progress, 0);
    return Math.round(totalProgress / moduleProgress.length);
  };

  const value = {
    userProgress,
    activeCourses,
    currentCourse,
    currentModule,
    moduleList,
    loading,
    error,
    loadCourse,
    updateModuleProgress,
    moveToNextModule,
    getModuleProgress,
    getCourseProgress
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};
