// pages/Dashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LearningContext } from '../contexts/LearningContext';
import { OfflineContext } from '../contexts/OfflineContext';
import { DeviceContext } from '../contexts/DeviceContext';
import { getLearningAnalytics } from '../services/learningService';
import Loading from '../components/ui/Loading';
import CourseCard from '../components/courses/CourseCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import ProgressSummary from '../components/dashboard/ProgressSummary';
import RecommendationsList from '../components/dashboard/RecommendationsList';
import LearningPathCard from '../components/dashboard/LearningPathCard';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { courses, recommendations, loading: learningLoading, getCourseProgress } = useContext(LearningContext);
  const { isOnline, offlineAvailableCourses } = useContext(OfflineContext);
  const { deviceInfo } = useContext(DeviceContext);
  const [analytics, setAnalytics] = useState(null);
  const [inProgressCourses, setInProgressCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get learning analytics
        const userAnalytics = await getLearningAnalytics(currentUser.uid);
        setAnalytics(userAnalytics);
        
        // Get in-progress courses
        const userCourses = courses.filter(course => {
          const progress = getCourseProgress(course.id);
          return progress > 0 && progress < 100;
        });
        setInProgressCourses(userCourses);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    if (currentUser && !learningLoading) {
      loadDashboardData();
    }
  }, [currentUser, courses, getCourseProgress, learningLoading]);

  // Show loading indicator while data is being fetched
  if (loading || learningLoading) {
    return <Loading message="Loading your dashboard..." />;
  }

  // Render dashboard content based on screen size
  const renderDashboard = () => {
    const isMobile = deviceInfo.type === 'mobile';
    
    if (isMobile) {
      // Mobile layout
      return (
        <div className="dashboard-container mobile">
          {/* Welcome section */}
          <section className="welcome-section">
            <h1>Welcome back, {currentUser.displayName || 'Student'}!</h1>
            {!isOnline && <p className="offline-notice">You're currently offline. Some features may be limited.</p>}
          </section>
          
          {/* Continue learning section */}
          <section className="continue-learning-section">
            <h2>Continue Learning</h2>
            {inProgressCourses.length > 0 ? (
              <div className="courses-list">
                {inProgressCourses.slice(0, 2).map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
                {inProgressCourses.length > 2 && (
                  <Link to="/courses" className="see-all-link">See all ({inProgressCourses.length})</Link>
                )}
              </div>
            ) : (
              <p className="empty-state">No courses in progress. Start learning today!</p>
            )}
          </section>
          
          {/* Recommendations section */}
          <section className="recommendations-section">
            <h2>Recommended For You</h2>
            <RecommendationsList recommendations={recommendations} />
          </section>
          
          {/* Statistics summary */}
          {analytics && (
            <section className="stats-section">
              <h2>Your Progress</h2>
              <div className="stats-cards">
                <div className="stat-card">
                  <span className="stat-value">{analytics.streakDays}</span>
                  <span className="stat-label">Day Streak</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{Math.floor(analytics.totalTimeSpent / 60)}</span>
                  <span className="stat-label">Total Hours</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value"