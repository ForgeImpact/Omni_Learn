import React, { useState, useEffect } from 'react';
import './AdaptiveNavigation.css';

const AdaptiveNavigation = ({
  currentSection,
  totalSections,
  sections = [],
  onNext,
  onPrevious,
  onNavigate,
  displayMode = 'full' // 'full', 'compact', or 'auto'
}) => {
  const [showSectionList, setShowSectionList] = useState(false);
  const [actualDisplayMode, setActualDisplayMode] = useState(displayMode);
  
  // If sections are not provided, generate mock sections
  const navigationSections = sections.length > 0 ? sections : 
    Array.from({ length: totalSections }, (_, i) => ({
      id: `section-${i + 1}`,
      title: `Section ${i + 1}`,
      completed: i < currentSection - 1
    }));
  
  // Auto-detect display mode based on screen width if set to 'auto'
  useEffect(() => {
    if (displayMode === 'auto') {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setActualDisplayMode('compact');
        } else if (window.innerWidth < 1024) {
          setActualDisplayMode('medium');
        } else {
          setActualDisplayMode('full');
        }
      };
      
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
      
      return () => window.removeEventListener('resize', handleResize);
    } else {
      setActualDisplayMode(displayMode);
    }
  }, [displayMode]);
  
  // Handle section selection
  const handleSectionSelect = (index) => {
    setShowSectionList(false);
    if (onNavigate) {
      onNavigate(index + 1);
    }
  };
  
  // Render progress indicator
  const renderProgressIndicator = () => {
    return (
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-filled" 
            style={{ width: `${(currentSection / totalSections) * 100}%` }}
          />
        </div>
        <div className="progress-text">
          {currentSection} of {totalSections}
        </div>
      </div>
    );
  };
  
  // Render section list dropdown
  const renderSectionList = () => {
    if (!showSectionList) return null;
    
    return (
      <div className="section-list-dropdown">
        <ul>
          {navigationSections.map((section, index) => (
            <li 
              key={section.id}
              className={`section-item ${currentSection === index + 1 ? 'current' : ''} ${section.completed ? 'completed' : ''}`}
              onClick={() => handleSectionSelect(index)}
            >
              <span className="section-status">
                {section.completed ? '✓' : index + 1}
              </span>
              <span className="section-title">{section.title}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Render compact navigation for mobile
  if (actualDisplayMode === 'compact') {
    return (
      <div className="adaptive-navigation adaptive-navigation--compact">
        <div className="nav-buttons">
          <button
            className="nav-button prev-button"
            onClick={onPrevious}
            disabled={currentSection <= 1}
          >
            <span className="button-icon">←</span>
          </button>
          
          <button 
            className="nav-button section-button"
            onClick={() => setShowSectionList(!showSectionList)}
          >
            {currentSection}/{totalSections}
          </button>
          
          <button
            className="nav-button next-button"
            onClick={onNext}
            disabled={currentSection >= totalSections}
          >
            <span className="button-icon">→</span>
          </button>
        </div>
        
        {renderSectionList()}
      </div>
    );
  }
  
  // Render medium layout for tablets
  if (actualDisplayMode === 'medium') {
    return (
      <div className="adaptive-navigation adaptive-navigation--medium">
        <div className="nav-main">
          <button
            className="nav-button prev-button"
            onClick={onPrevious}
            disabled={currentSection <= 1}
          >
            <span className="button-icon">←</span>
            <span className="button-text">Previous</span>
          </button>
          
          {renderProgressIndicator()}
          
          <button
            className="nav-button next-button"
            onClick={onNext}
            disabled={currentSection >= totalSections}
          >
            <span className="button-text">Next</span>
            <span className="button-icon">→</span>
          </button>
        </div>
        
        <div className="section-selector">
          <button 
            className="section-toggle" 
            onClick={() => setShowSectionList(!showSectionList)}
          >
            Jump to Section
          </button>
          {renderSectionList()}
        </div>
      </div>
    );
  }
  
  // Render full layout for desktop
  return (
    <div className="adaptive-navigation adaptive-navigation--full">
      <div className="nav-container">
        <div className="nav-left">
          <button
            className="nav-button prev-button"
            onClick={onPrevious}
            disabled={currentSection <= 1}
          >
            <span className="button-icon">←</span>
            <span className="button-text">Previous</span>
          </button>
        </div>
        
        <div className="nav-center">
          <div className="section-bullets">
            {navigationSections.map((section, index) => (
              <div 
                key={section.id}
                className={`section-bullet ${currentSection === index + 1 ? 'current' : ''} ${section.completed ? 'completed' : ''}`}
                onClick={() => handleSectionSelect(index)}
                title={section.title}
              >
                <span className="bullet-number">{index + 1}</span>
                {actualDisplayMode === 'full' && (
                  <span className="bullet-title">{section.title}</span>
                )}
              </div>
            ))}
          </div>
          {renderProgressIndicator()}
        </div>
        
        <div className="nav-right">
          <button
            className="nav-button next-button"
            onClick={onNext}
            disabled={currentSection >= totalSections}
          >
            <span className="button-text">Next</span>
            <span className="button-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveNavigation;