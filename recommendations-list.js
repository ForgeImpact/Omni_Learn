// components/dashboard/RecommendationsList.js
import React from 'react';
import { Link } from 'react-router-dom';
import './RecommendationsList.css';

const RecommendationsList = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="empty-recommendations">
        <p>No recommendations available at this time.</p>
      </div>
    );
  }

  return (
    <div className="recommendations-list">
      {recommendations.map((item) => (
        <div key={item.id} className="recommendation-item">
          <div className="recommendation-content">
            <div className="recommendation-icon" style={{ backgroundColor: item.iconColor }}>
              {item.type === 'course' && <i className="fas fa-book"></i>}
              {item.type === 'quiz' && <i className="fas fa-question-circle"></i>}
              {item.type === 'article' && <i className="fas fa-newspaper"></i>}
            </div>
            <div className="recommendation-info">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="recommendation-meta">
                {item.type === 'course' && (
                  <>
                    <span className="meta-item">
                      <i className="fas fa-clock"></i> {item.duration} hrs
                    </span>
                    <span className="meta-item">
                      <i className="fas fa-signal"></i> {item.level}
                    </span>
                  </>
                )}
                {item.type === 'quiz' && (
                  <span className="meta-item">
                    <i className="fas fa-clock"></i> {item.estimatedTime} min
                  </span>
                )}
                {item.type === 'article' && (
                  <span className="meta-item">
                    <i className="fas fa-clock"></i> {item.readTime} min read
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="recommendation-action">
            <Link to={item.link} className="action-button">
              {item.type === 'course' ? 'Start Course' : 
               item.type === 'quiz' ? 'Take Quiz' : 'Read Article'}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendationsList;
