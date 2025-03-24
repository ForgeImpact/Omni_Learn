// src/services/userProfileService.js

import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User profile not found");
    }
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...profileData,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Update device preferences
export const updateDevicePreferences = async (userId, deviceType, preferences) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      [`devicePreferences.${deviceType}`]: preferences,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Update learning progress
export const updateLearningProgress = async (userId, courseId, moduleId, progress) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      [`learningProgress.${courseId}.${moduleId}`]: progress,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Add course to active courses
export const enrollInCourse = async (userId, courseId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      activeCourses: arrayUnion(courseId),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Remove course from active courses
export const unenrollFromCourse = async (userId, courseId) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      activeCourses: arrayRemove(courseId),
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};
