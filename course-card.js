// components/courses/CourseCard.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LearningContext } from '../../contexts/LearningContext';
import { OfflineContext } from '../../contexts/OfflineContext';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const { getCourseProgress } = useContext(LearningContext);
  const { isAvailableOffline, toggleOfflineAvailability } = useContext(OfflineContext);
  
  const progress = getCourseProgress(course.id);
  const isOffline = isAvailableOffline(course.id);
  
  return (
    <div className="course-card">
      <div className="course-image">
        <img src={course.imageUrl} alt={course.title} />
        {progress > 0 && (
          <div className="progress-overlay">
            <div className="progress-bar">
              <div 
                className="progress-filled" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
      </div>
      
      <div className="course-details">
        <h3 className="course-title">{course.title}</h3>
        <div className="course-meta">
          <span className="meta-item">
            <i className="fas fa-clock"></i> {course.duration} hrs
          </span>
          <span className="meta-item">
            <i className="fas fa-signal"></i> {course.level}
          </span>
          <span className="meta-item">
            <i className="fas fa-user"></i> {course.instructor}
          </span>
        </div>
        <p className="course-description">{course.description}</p>
      </div>
      
      <div className="course-actions">
        <Link to={`/course/${course.id}`} className="action-button primary">
          {progress > 0 ? 'Continue Learning' : 'Start Course'}
        </Link>
        <button 
          onClick={() => toggleOfflineAvailability(course.id)} 
          className={`offline-button ${isOffline ? 'available' : ''}`}
          aria-label={isOffline ? 'Remove from offline access' : 'Make available offline'}
        >
          <i className={`fas ${isOffline ? 'fa-check' : 'fa-download'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
