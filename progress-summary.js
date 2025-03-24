// components/dashboard/ProgressSummary.js
import React from 'react';
import './ProgressSummary.css';

const ProgressSummary = ({ analytics }) => {
  const {
    completedCourses,
    totalCourses,
    completedLessons,
    totalLessons,
    certificatesEarned,
    averageQuizScore
  } = analytics;

  // Calculate completion percentages
  const courseCompletionPercentage = totalCourses > 0 
    ? Math.round((completedCourses / totalCourses) * 100) 
    : 0;
  
  const lessonCompletionPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  return (
    <div className="progress-summary-container">
      {/* Courses progress */}
      <div className="progress-item">
        <div className="progress-header">
          <h3>Courses</h3>
          <span className="progress-text">{completedCourses} of {totalCourses}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-filled" 
            style={{ width: `${courseCompletionPercentage}%` }}
          ></div>
        </div>
        <span className="progress-percentage">{courseCompletionPercentage}%</span>
      </div>
      
      {/* Lessons progress */}
      <div className="progress-item">
        <div className="progress-header">
          <h3>Lessons</h3>
          <span className="progress-text">{completedLessons} of {totalLessons}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-filled" 
            style={{ width: `${lessonCompletionPercentage}%` }}
          ></div>
        </div>
        <span className="progress-percentage">{lessonCompletionPercentage}%</span>
      </div>
      
      {/* Additional stats */}
      <div className="additional-stats">
        <div className="stat-item">
          <div className="stat-icon certificate-icon"></div>
          <div className="stat-content">
            <span className="stat-value">{certificatesEarned}</span>
            <span className="stat-label">Certificates Earned</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon quiz-icon"></div>
          <div className="stat-content">
            <span className="stat-value">{averageQuizScore}%</span>
            <span className="stat-label">Avg. Quiz Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;
