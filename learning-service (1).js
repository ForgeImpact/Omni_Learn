// services/learningService.js
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

// Fetch user's learning data
export const fetchUserLearningData = async (userId) => {
  try {
    // Get user profile
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data();
    
    // Get user's courses
    const coursesQuery = query(collection(db, 'courses'));
    const coursesSnap = await getDocs(coursesQuery);
    const courses = [];
    
    coursesSnap.forEach(doc => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get user's progress
    const progressRef = doc(db, 'progress', userId);
    const progressSnap = await getDoc(progressRef);
    const progress = progressSnap.exists() ? progressSnap.data() : {};
    
    // Get user's learning preferences
    const preferencesRef = doc(db, 'learningPreferences', userId);
    const preferencesSnap = await getDoc(preferencesRef);
    const learningPreferences = preferencesSnap.exists() ? preferencesSnap.data() : {
      preferredLearningStyle: 'visual',
      preferredDifficulty: 'medium',
      preferredTopics: [],
      goals: [],
      pace: 'medium'
    };
    
    return {
      courses,
      progress,
      learningPreferences
    };
  } catch (error) {
    console.error('Error fetching user learning data:', error);
    throw error;
  }
};

// Update user's learning progress
export const updateUserProgress = async (userId, moduleId, lessonId, progressData) => {
  try {
    const progressRef = doc(db, 'progress', userId);
    const progressSnap = await getDoc(progressRef);
    
    if (!progressSnap.exists()) {
      // Create a new progress document if it doesn't exist
      await setDoc(progressRef, {
        [moduleId]: {
          [lessonId]: {
            ...progressData,
            updatedAt: serverTimestamp()
          }
        }
      });
    } else {
      // Update existing progress document
      await updateDoc(progressRef, {
        [`${moduleId}.${lessonId}`]: {
          ...progressData,
          updatedAt: serverTimestamp()
        }
      });
    }
    
    // Update user's learning stats
    await updateLearningStats(userId, moduleId, lessonId, progressData);
    
    return true;
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

// Update user's learning statistics
const updateLearningStats = async (userId, moduleId, lessonId, progressData) => {
  try {
    const statsRef = doc(db, 'learningStats', userId);
    const statsSnap = await getDoc(statsRef);
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!statsSnap.exists()) {
      // Create new stats document
      await setDoc(statsRef, {
        totalTimeSpent: progressData.timeSpent || 0,
        sessionsCompleted: progressData.completed ? 1 : 0,
        lastActive: serverTimestamp(),