// contexts/OfflineContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from './AuthContext';

export const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineAvailableCourses, setOfflineAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track online/offline status
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

  // Load user's offline available courses
  useEffect(() => {
    const loadOfflineCourses = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user's offline course settings
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const offlineCourseIds = userData.offlineCourses || [];
          
          // Fetch course details for offline courses
          const offlineCourses = [];
          
          for (const courseId of offlineCourseIds) {
            const courseDocRef = doc(db, 'courses', courseId);
            const courseSnapshot = await getDoc(courseDocRef);
            
            if (courseSnapshot.exists()) {
              offlineCourses.push({
                id: courseSnapshot.id,
                ...courseSnapshot.data()
              });
            }
          }
          
          setOfflineAvailableCourses(offlineCourses);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading offline courses:', err);
        setLoading(false);
      }
    };

    loadOfflineCourses();
  }, [currentUser]);

  // Check if a course is available offline
  const isAvailableOffline = (courseId) => {
    return offlineAvailableCourses.some(course => course.id === courseId);
  };

  // Toggle a course's offline availability
  const toggleOfflineAvailability = async (courseId) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const offlineCourses = userData.offlineCourses || [];
        const isCurrentlyAvailable = offlineCourses.includes(courseId);
        
        // Add or remove from offline courses
        if (isCurrentlyAvailable) {
          // Remove from offline courses
          await updateDoc(userDocRef, {
            offlineCourses: arrayRemove(courseId)
          });
          
          // Update local state
          setOfflineAvailableCourses(prevCourses => 
            prevCourses.filter(course => course.id !== courseId)
          );
        } else {
          // Add to offline courses
          await updateDoc(userDocRef, {
            offlineCourses: arrayUnion(courseId)
          });
          
          // Fetch course details and add to local state
          const courseDocRef = doc(db, 'courses', courseId);
          const courseSnapshot = await getDoc(courseDocRef);
          
          if (courseSnapshot.exists()) {
            const courseData = {
              id: courseSnapshot.id,
              ...courseSnapshot.data()
            };
            
            setOfflineAvailableCourses(prevCourses => [...prevCourses, courseData]);
          }
        }
      }
    } catch (err) {
      console.error('Error toggling offline availability:', err);
    }
  };

  // Download course content for offline use
  const downloadCourseContent = async (courseId) => {
    // Implementation would depend on your caching strategy
    // This is a placeholder for the actual implementation
    try {
      console.log(`Downloading course ${courseId} for offline use`);
      
      // Here you would:
      // 1. Fetch all course content (lessons, videos, etc.)
      // 2. Store in IndexedDB or other client-side storage
      // 3. Update some local flag to indicate download is complete
      
      return true;
    } catch (err) {
      console.error('Error downloading course content:', err);
      return false;
    }
  };

  const value = {
    isOnline,
    offlineAvailableCourses,
    loading,
    isAvailableOffline,
    toggleOfflineAvailability,
    downloadCourseContent
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
