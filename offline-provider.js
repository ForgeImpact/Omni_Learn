// OfflineContext.js - Offline functionality provider
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { LearningContext } from './LearningContext';

export const OfflineContext = createContext();

export function OfflineProvider({ children }) {
  const { currentUser } = useContext(AuthContext);
  const { courses, progress } = useContext(LearningContext);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineAvailableCourses, setOfflineAvailableCourses] = useState([]);
  const [offlineDownloads, setOfflineDownloads] = useState({});
  const [pendingSyncs, setPendingSyncs] = useState([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline data from IndexedDB
  useEffect(() => {
    const loadOfflineData = async () => {
      if (!currentUser) return;

      try {
        // Check if IndexedDB is supported
        if (!window.indexedDB) {
          console.warn('IndexedDB not supported. Offline functionality limited.');
          return;
        }

        // Get offline courses from IndexedDB
        const savedCourses = await getOfflineCourses(currentUser.uid);
        setOfflineAvailableCourses(savedCourses);

        // Get pending sync operations
        const syncOperations = await getPendingSyncs(currentUser.uid);
        setPendingSyncs(syncOperations);

        // Get download status
        const downloads = await getDownloadStatus(currentUser.uid);
        setOfflineDownloads(downloads);
      } catch (error) {
        console.error('Error loading offline data:', error);
      }
    };

    loadOfflineData();
  }, [currentUser]);

  // Sync when coming back online
  useEffect(() => {
    const syncData = async () => {
      if (isOnline && pendingSyncs.length > 0 && currentUser) {
        try {
          for (const syncOp of pendingSyncs) {
            // Process each pending sync operation
            await processSyncOperation(syncOp, currentUser.uid);
          }
          
          // Clear pending syncs after successful processing
          await clearPendingSyncs(currentUser.uid);
          setPendingSyncs([]);
          
          console.log('Sync completed successfully');
        } catch (error) {
          console.error('Error syncing data:', error);
        }
      }
    };

    syncData();
  }, [isOnline, pendingSyncs, currentUser]);

  // Function to download a course for offline use
  const downloadCourseForOffline = async (courseId) => {
    if (!currentUser || !isOnline) return false;
    
    try {
      // Find the course in available courses
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      
      // Update download status to "downloading"
      setOfflineDownloads(prev => ({
        ...prev,
        [courseId]: { status: 'downloading', progress: 0 }
      }));
      
      // Save course data to IndexedDB
      await saveCourseOffline(course, currentUser.uid);
      
      // Update downloaded courses list
      setOfflineAvailableCourses(prev => [...prev, course]);
      
      // Update download status to "completed"
      setOfflineDownloads(prev => ({
        ...prev,
        [courseId]: { status: 'completed', progress: 100 }
      }));
      
      // Save download status to IndexedDB
      await updateDownloadStatus(currentUser.uid, courseId, 'completed');
      
      return true;
    } catch (error) {
      console.error('Error downloading course:', error);
      
      // Update download status to "failed"
      setOfflineDownloads(prev => ({
        ...prev,
        [courseId]: { status: 'failed', progress: 0 }
      }));
      
      // Save download status to IndexedDB
      await updateDownloadStatus(currentUser.uid, courseId, 'failed');
      
      return false;
    }
  };

  // Function to remove a course from offline storage
  const removeCourseFromOffline = async (courseId) => {
    if (!currentUser) return false;
    
    try {
      // Remove course from IndexedDB
      await removeCourseOffline(courseId, currentUser.uid);
      
      // Update offline available courses
      setOfflineAvailableCourses(prev => 
        prev.filter(course => course.id !== courseId)
      );
      
      // Update download status
      setOfflineDownloads(prev => {
        const newDownloads = { ...prev };
        delete newDownloads[courseId];
        return newDownloads;
      });
      
      // Remove download status from IndexedDB
      await removeDownloadStatus(currentUser.uid, courseId);
      
      return true;
    } catch (error) {
      console.error('Error removing offline course:', error);
      return false;
    }
  };

  // Function to track learning progress while offline
  const trackOfflineProgress = async (moduleId, lessonId, progressData) => {
    if (!currentUser) return;
    
    try {
      // Save progress to IndexedDB
      await saveProgressOffline(currentUser.uid, moduleId, lessonId, progressData);
      
      // Add to pending syncs
      const syncOperation = {
        type: 'progress',
        moduleId,
        lessonId,
        progressData,
        timestamp: new Date().toISOString()
      };
      
      await addPendingSync(currentUser.uid, syncOperation);
      setPendingSyncs(prev => [...prev, syncOperation]);
    } catch (error) {
      console.error('Error tracking offline progress:', error);
    }
  };

  // Helper function to get offline courses from IndexedDB
  const getOfflineCourses = async (userId) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return [];
  };

  // Helper function to save course offline in IndexedDB
  const saveCourseOffline = async (course, userId) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return true;
  };

  // Helper function to remove course from offline storage
  const removeCourseOffline = async (courseId, userId) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return true;
  };

  // Helper function to save progress offline
  const saveProgressOffline = async (userId, moduleId, lessonId, progressData) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return true;
  };

  // Helper function to get pending syncs
  const getPendingSyncs = async (userId) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return [];
  };

  // Helper function to add pending sync
  const addPendingSync = async (userId, syncOperation) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return true;
  };

  // Helper function to clear pending syncs
  const clearPendingSyncs = async (userId) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return true;
  };

  // Helper function to process sync operation
  const processSyncOperation = async (syncOp, userId) => {
    // Implementation to sync with backend would go here
    // This is a placeholder that would be replaced with actual API calls
    return true;
  };

  // Helper function to get download status
  const getDownloadStatus = async (userId) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return {};
  };

  // Helper function to update download status
  const updateDownloadStatus = async (userId, courseId, status) => {
    // IndexedDB implementation would go here
    // This is a placeholder that would be replaced with actual IndexedDB code
    return true;
  };

  // Helper function to remove download status
  const removeDownloadStatus = async (userId, courseId) => {
    // Indexe