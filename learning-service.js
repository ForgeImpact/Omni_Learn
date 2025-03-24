lastActive: serverTimestamp(),
        dailyActivity: {
          [today]: {
            timeSpent: progressData.timeSpent || 0,
            lessonsCompleted: progressData.completed ? 1 : 0
          }
        },
        moduleProgress: {
          [moduleId]: {
            timeSpent: progressData.timeSpent || 0,
            lessonsCompleted: progressData.completed ? 1 : 0
          }
        }
      });
    } else {
      // Update existing stats
      const stats = statsSnap.data();
      
      // Update total stats
      const totalTimeSpent = (stats.totalTimeSpent || 0) + (progressData.timeSpent || 0);
      const sessionsCompleted = (stats.sessionsCompleted || 0) + (progressData.completed ? 1 : 0);
      
      // Update daily activity
      const dailyActivity = stats.dailyActivity || {};
      if (!dailyActivity[today]) {
        dailyActivity[today] = {
          timeSpent: progressData.timeSpent || 0,
          lessonsCompleted: progressData.completed ? 1 : 0
        };
      } else {
        dailyActivity[today].timeSpent += (progressData.timeSpent || 0);
        dailyActivity[today].lessonsCompleted += (progressData.completed ? 1 : 0);
      }
      
      // Update module progress
      const moduleProgress = stats.moduleProgress || {};
      if (!moduleProgress[moduleId]) {
        moduleProgress[moduleId] = {
          timeSpent: progressData.timeSpent || 0,
          lessonsCompleted: progressData.completed ? 1 : 0
        };
      } else {
        moduleProgress[moduleId].timeSpent += (progressData.timeSpent || 0);
        moduleProgress[moduleId].lessonsCompleted += (progressData.completed ? 1 : 0);
      }
      
      // Update the document
      await updateDoc(statsRef, {
        totalTimeSpent,
        sessionsCompleted,
        lastActive: serverTimestamp(),
        dailyActivity,
        moduleProgress
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating learning stats:', error);
    // Don't throw here, as this is a secondary operation that shouldn't fail the primary progress update
    return false;
  }
};

// Get course details
export const getCourseDetails = async (courseId) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }
    
    return {
      id: courseSnap.id,
      ...courseSnap.data()
    };
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// Get module details
export const getModuleDetails = async (moduleId) => {
  try {
    const moduleRef = doc(db, 'modules', moduleId);
    const moduleSnap = await getDoc(moduleRef);
    
    if (!moduleSnap.exists()) {
      throw new Error('Module not found');
    }
    
    // Fetch lessons for this module
    const lessonsQuery = query(
      collection(db, 'lessons'),
      where('moduleId', '==', moduleId)
    );
    const lessonsSnap = await getDocs(lessonsQuery);
    const lessons = [];
    
    lessonsSnap.forEach(doc => {
      lessons.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort lessons by order
    lessons.sort((a, b) => a.order - b.order);
    
    return {
      id: moduleSnap.id,
      ...moduleSnap.data(),
      lessons
    };
  } catch (error) {
    console.error('Error fetching module details:', error);
    throw error;
  }
};

// Update user's learning preferences
export const updateLearningPreferences = async (userId, preferences) => {
  try {
    const preferencesRef = doc(db, 'learningPreferences', userId);
    const preferencesSnap = await getDoc(preferencesRef);
    
    if (!preferencesSnap.exists()) {
      // Create a new preferences document
      await setDoc(preferencesRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      });
    } else {
      // Update existing preferences
      await updateDoc(preferencesRef, {
        ...preferences,
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating learning preferences:', error);
    throw error;
  }
};

// Get learning analytics for user
export const getLearningAnalytics = async (userId) => {
  try {
    // Get user's learning stats
    const statsRef = doc(db, 'learningStats', userId);
    const statsSnap = await getDoc(statsRef);
    
    if (!statsSnap.exists()) {
      return {
        totalTimeSpent: 0,
        sessionsCompleted: 0,
        dailyActivity: {},
        moduleProgress: {},
        streakDays: 0,
        averageDailyTime: 0,
        topModules: []
      };
    }
    
    const stats = statsSnap.data();
    
    // Calculate streak
    const streak = calculateStreak(stats.dailyActivity || {});
    
    // Calculate average daily time
    const averageTime = calculateAverageDailyTime(stats.dailyActivity || {});
    
    // Get top modules by time spent
    const topModules = getTopModulesByTime(stats.moduleProgress || {});
    
    return {
      totalTimeSpent: stats.totalTimeSpent || 0,
      sessionsCompleted: stats.sessionsCompleted || 0,
      dailyActivity: stats.dailyActivity || {},
      moduleProgress: stats.moduleProgress || {},
      streakDays: streak,
      averageDailyTime: averageTime,
      topModules
    };
  } catch (error) {
    console.error('Error fetching learning analytics:', error);
    throw error;
  }
};

// Calculate streak of consecutive days with learning activity
const calculateStreak = (dailyActivity) => {
  const dates = Object.keys(dailyActivity).sort().reverse(); // Sort in descending order
  
  if (dates.length === 0) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = new Date(dates[0]);
  
  for (let i = 1; i < dates.length; i++) {
    const previousDate = new Date(dates[i]);
    const timeDiff = currentDate.getTime() - previousDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff === 1) {
      // Consecutive day
      streak++;
      currentDate = previousDate;
    } else if (dayDiff > 1) {
      // Streak broken
      break;
    }
  }
  
  return streak;
};

// Calculate average daily learning time
const calculateAverageDailyTime = (dailyActivity) => {
  const days = Object.values(dailyActivity);
  
  if (days.length === 0) {
    return 0;
  }
  
  const totalTime = days.reduce((sum, day) => sum + (day.timeSpent || 0), 0);
  return Math.round(totalTime / days.length);
};

// Get top modules by time spent
const getTopModulesByTime = (moduleProgress) => {
  return Object.entries(moduleProgress)
    .map(([moduleId, data]) => ({
      moduleId,
      timeSpent: data.timeSpent || 0,
      lessonsCompleted: data.lessonsCompleted || 0
    }))
    .sort((a, b) => b.timeSpent - a.timeSpent)
    .slice(0, 5);
};

// Get recommendations based on user progress and preferences
export const getRecommendedCourses = async (userId) => {
  try {
    // Get user's progress and preferences
    const { progress, learningPreferences } = await fetchUserLearningData(userId);
    
    // Get all available courses
    const coursesQuery = query(collection(db, 'courses'));
    const coursesSnap = await getDocs(coursesQuery);
    const allCourses = [];
    
    coursesSnap.forEach(doc => {
      allCourses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Filter courses by user preferences
    let filteredCourses = allCourses;
    
    // Filter by preferred topics if available
    if (learningPreferences.preferredTopics && learningPreferences.preferredTopics.length > 0) {
      filteredCourses = filteredCourses.filter(course => 
        course.topics.some(topic => learningPreferences.preferredTopics.includes(topic))
      );
    }
    
    // Filter by difficulty if available
    if (learningPreferences.preferredDifficulty) {
      filteredCourses = filteredCourses.filter(course => 
        course.difficulty === learningPreferences.preferredDifficulty
      );
    }
    
    // Calculate a score for each course based on match to preferences
    const scoredCourses = filteredCourses.map(course => {
      let score = 0;
      
      // Higher score for courses with matching topics
      if (learningPreferences.preferredTopics) {
        const topicMatches = course.topics.filter(topic => 
          learningPreferences.preferredTopics.includes(topic)
        ).length;
        score += topicMatches * 10;
      }
      
      // Higher score for courses with matching difficulty
      if (course.difficulty === learningPreferences.preferredDifficulty) {
        score += 20;
      }
      
      // Lower score for courses already started
      const courseModules = course.modules || [];
      const startedModules = courseModules.filter(module => 
        progress[module.id] && Object.keys(progress[module.id]).length > 0
      ).length;
      
      if (startedModules > 0) {
        score -= 10;
      }
      
      return {
        ...course,
        score
      };
    });
    
    // Sort by score and return top 5
    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch (error) {
    console.error('Error getting recommended courses:', error);
    throw error;
  }
};
