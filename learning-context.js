// contexts/LearningContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from './AuthContext';

export const LearningContext = createContext();

export const LearningProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's courses and progress
  useEffect(() => {
    const fetchUserLearningData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user's learning progress
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setCourseProgress(userData.courseProgress || {});
          
          // Fetch user's learning path if they have one
          if (userData.learningPathId) {
            const pathDocRef = doc(db, 'learningPaths', userData.learningPathId);
            const pathSnapshot = await getDoc(pathDocRef);
            
            if (pathSnapshot.exists()) {
              setLearningPath({
                id: pathSnapshot.id,
                ...pathSnapshot.data()
              });
            }
          }
        }
        
        // Fetch all courses
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
        
        // Generate recommendations based on user's interests and progress
        const userRecommendations = await generateRecommendations(
          coursesData, 
          courseProgress, 
          userData?.interests || []
        );
        setRecommendations(userRecommendations);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching learning data:', err);
        setError('Failed to load learning data');
        setLoading(false);
      }
    };

    fetchUserLearningData();
  }, [currentUser]);

  // Generate course recommendations
  const generateRecommendations = async (allCourses, userProgress, userInterests) => {
    // Simple recommendation algorithm based on user interests and not started courses
    const recommendations = [];
    
    // First, add courses that match user interests
    if (userInterests.length > 0) {
      const interestCourses = allCourses.filter(course => 
        course.tags.some(tag => userInterests.includes(tag)) && 
        !userProgress[course.id]
      );
      recommendations.push(...interestCourses.slice(0, 3));
    }
    
    // Next, add popular courses that user hasn't started
    const popularCourses = allCourses
      .filter(course => !userProgress[course.id] && !recommendations.find(rec => rec.id === course.id))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 3);
    
    recommendations.push(...popularCourses);
    
    // Format recommendations for display
    return recommendations.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      type: 'course',
      iconColor: '#4e5de2',
      duration: course.duration,
      level: course.level,
      link: `/course/${course.id}`
    }));
  };

  // Get course progress percentage
  const getCourseProgress = (courseId) => {
    return courseProgress[courseId]?.percentage || 0;
  };

  // Update course progress
  const updateCourseProgress = async (courseId, lessonId, completed = true) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const currentProgress = userData.courseProgress || {};
        const courseData = currentProgress[courseId] || { completedLessons: [], percentage: 0 };
        
        // Update completed lessons
        if (completed && !courseData.completedLessons.includes(lessonId)) {
          courseData.completedLessons.push(lessonId);
        } else if (!completed && courseData.completedLessons.includes(lessonId)) {
          courseData.completedLessons = courseData.completedLessons.filter(id => id !== lessonId);
        }
        
        // Get course info to calculate percentage
        const courseDocRef = doc(db, 'courses', courseId);
        const courseSnapshot = await getDoc(courseDocRef);
        
        if (courseSnapshot.exists()) {
          const course = courseSnapshot.data();
          const totalLessons = course.lessons.length;
          const completedLessons = courseData.completedLessons.length;
          
          // Calculate percentage
          courseData.percentage = Math.round((completedLessons / totalLessons) * 100);
          
          // Update user document
          currentProgress[courseId] = courseData;
          await updateDoc(userDocRef, {
            courseProgress: currentProgress
          });
          
          // Update local state
          setCourseProgress(currentProgress);
        }
      }
    } catch (err) {
      console.error('Error updating course progress:', err);
      setError('Failed to update progress');
    }
  };

  // Get learning path progress
  const getLearningPathProgress = (pathId) => {
    if (!learningPath || learningPath.id !== pathId) return 0;
    
    const totalMilestones = learningPath.milestones.length;
    const completedMilestones = learningPath.milestones.filter(
      milestone => milestone.status === 'completed'
    ).length;
    
    return Math.round((completedMilestones / totalMilestones) * 100);
  };

  // Set user's learning path
  const setUserLearningPath = async (pathId) => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        learningPathId: pathId
      });
      
      // Fetch the learning path data
      const pathDocRef = doc(db, 'learningPaths', pathId);
      const pathSnapshot = await getDoc(pathDocRef);
      
      if (pathSnapshot.exists()) {
        setLearningPath({
          id: pathSnapshot.id,
          ...pathSnapshot.data()
        });
      }
    } catch (err) {
      console.error('Error setting learning path:', err);
      setError('Failed to set learning path');
    }
  };

  const value = {
    courses,
    recommendations,
    learningPath,
    loading,
    error,
    getCourseProgress,
    updateCourseProgress,
    getLearningPathProgress,
    setUserLearningPath