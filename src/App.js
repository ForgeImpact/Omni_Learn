import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import CoursesPage from './components/CoursesPage';
import CourseDetailsPage from './components/CourseDetailsPage';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Switch>
                <Route path="/courses/:courseId" component={CourseDetailsPage} />
                <Route path="/courses" component={CoursesPage} />
                <Route path="/profile" component={UserProfile} />
                <Route path="/login" component={Login} />
                <Route path="/" component={HomePage} />
              </Switch>
            </main>
            <footer className="footer">
              &copy; 2025 OmniLearn. All rights reserved.
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
