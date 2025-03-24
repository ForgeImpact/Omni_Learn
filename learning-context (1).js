// contexts/LearningContext.js (continued)
    courses,
    recommendations,
    learningPath,
    loading,
    error,
    getCourseProgress,
    updateCourseProgress,
    getLearningPathProgress,
    setUserLearningPath
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
};
