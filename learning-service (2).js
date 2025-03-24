// services/learningService.js
import { collection, doc, getDoc, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

// Get learning analytics for a specific user
export const getLearningAnalytics = async (userId) => {
  try {
    // Get user data
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnapshot.data();
    
    // Get user's activity data
    const activityQuery = query(
      collection(db, 'learningActivity'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(30)
    );
    
    const activitySnapshot = await getDocs(activityQuery);
    const activityData = activitySnapshot.docs.map(doc => doc.data());
    
    // Process data to calculate metrics
    const activityByDay = processActivityData(activityData);
    const streakDays = calculateStreak(activityByDay);
    const totalTimeSpent = activityData.reduce((total, activity) => total + activity.timeSpent, 0);
    
    // Count completed courses
    const courseProgress = userData.courseProgress || {};
    const completedCourses = Object.values(courseProgress).filter(course => course.percentage === 100).length;
    
    // Count completed lessons
    const completedLessons = Object.values(courseProgress).reduce((total, course) => 
      total + course.completedLessons.length, 0
    );
    
    // Get available courses for progress denominator
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const totalCourses = coursesSnapshot.size;
    
    // Get total lessons
    let totalLessons = 0;
    coursesSnapshot.forEach(courseDoc => {
      const course = courseDoc.data();
      totalLessons += course.lessons ? course.lessons.length : 0;
    });
    
    // Calculate average quiz score
    const quizScores = userData.quizScores || [];
    const averageQuizScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
      : 0;
    
    // Count earned certificates
    const certificatesEarned = userData.certificates ? userData.certificates.length : 0;
    
    // Return compiled analytics data
    return {
      activityData: activityByDay,
      streakDays,
      totalTimeSpent,
      completedCourses,
      completedLessons,
      totalCourses,
      totalLessons,
      averageQuizScore,
      certificatesEarned
    };
  } catch (error) {
    console.error('Error getting learning analytics:', error);
    throw error;
  }
};

// Process activity data to get daily totals
const processActivityData = (activityData) => {
  const last7Days = [];
  const today = new Date();
  
  // Create array of the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const dateString = date.toISOString().split('T')[0];
    
    last7Days.push({
      day: dayName,
      date: dateString,
      minutes: 0
    });
  }
  
  // Sum up activity minutes by day
  activityData.forEach(activity => {
    const activityDate = activity.date.toDate().toISOString().split('T')[0];
    const dayIndex = last7Days.findIndex(day => day.date === activityDate);
    
    if (dayIndex !== -1) {
      last7Days[dayIndex].minutes += Math.round(activity.timeSpent / 60);
    }
  });
  
  return last7Days;
};

// Calculate current learning streak
const calculateStreak = (activityByDay) => {
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  
  // Check if user was active today
  const todayActivity = activityByDay.find(day => day.date === today);
  const hadActivityToday = todayActivity && todayActivity.minutes > 0;
  
  if (!hadActivityToday) {
    // Check if user was active yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const yesterdayActivity = activityByDay.find(day => day.date === yesterdayString);
    if (!yesterdayActivity || yesterdayActivity.minutes === 0) {
      return 0;
    }
  }
  
  // Count consecutive days with activity
  for (let i = 0; i < activityByDay.length; i++) {
    if (activityByDay[i].minutes > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Get course details by ID
export const getCourseById = async (courseId) => {
  try {
    const courseDocRef = doc(db, 'courses', courseId);
    const courseSnapshot = await getDoc(courseDocRef);
    
    if (!courseSnapshot.exists()) {
      throw new Error('Course not found');
    }
    
    return {
      id: courseSnapshot.id,
      ...courseSnapshot.data()
    };
  } catch (error) {
    console.error('Error getting course:', error);
    throw error;
  }
};

// Search courses by keyword
export const searchCourses = async (keyword) => {
  try {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter courses by keyword
    // Note: This is a simple client-side search, in production use Firestore queries or a search service
    if (!keyword) return courses;
    
    const searchTerm = keyword.toLowerCase();
    return courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
};

// Get learning paths
export const getLearningPaths = async () => {
  try {
    const pathsSnapshot = await getDocs(collection(db, 'learningPaths'));
    return pathsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting learning paths:', error);
    throw error;
  }
};
