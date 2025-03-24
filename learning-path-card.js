// components/dashboard/LearningPathCard.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LearningContext } from '../../contexts/LearningContext';
import './LearningPathCard.css';

const LearningPathCard = () => {
  const { learningPath, getLearningPathProgress } = useContext(LearningContext);
  
  if (!learningPath) {
    return (
      <div className="learning-path-card empty">
        <div className="empty-content">
          <h3>No Learning Path Selected</h3>
          <p>Choose a learning path to structure your learning journey.</p>
          <Link to="/learning-paths" className="action-button">
            Browse Learning Paths
          </Link>
        </div>
      </div>
    );
  }
  
  const progress = getLearningPathProgress(learningPath.id);
  const nextMilestone = learningPath.milestones.find(milestone => 
    milestone.status === 'not-started' || milestone.status === 'in-progress'
  );
  
  return (
    <div className="learning-path-card">
      <div className="path-header">
        <div className="path-info">
          <h3>{learningPath.title}</h3>
          <div className="path-progress">
            <div className="progress-bar">
              <div 
                className="progress-filled" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}% Complete</span>
          </div>
        </div>
        <div className="path-image">
          <img src={learningPath.image} alt={learningPath.title} />
        </div>
      </div>
      
      <div className="path-content">
        <div className="next-milestone">
          <h4>Next Milestone</h4>
          {nextMilestone ? (
            <div className="milestone-item">
              <div className="milestone-status">
                <div className={`status-icon ${nextMilestone.status}`}></div>
              </div>
              <div className="milestone-details">
                <h5>{nextMilestone.title}</h5>
                <p>{nextMilestone.description}</p>
                <Link to={`/course/${nextMilestone.courseId}`} className="milestone-link">
                  Continue Learning
                </Link>
              </div>
            </div>
          ) : (
            <p className="completed-path">
              You have completed all milestones in this learning path!
            </p>
          )}
        </div>
      </div>
      
      <div className="path-footer">
        <Link to={`/learning-path/${learningPath.id}`} className="view-path-link">
          View Full Path
        </Link>
      </div>
    </div>
  );
};

export default LearningPathCard;
