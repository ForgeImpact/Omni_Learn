// src/services/learningContentService.js

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  limit, 
  orderBy,
  startAfter
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Get available courses
export const getCourses = async (category = null, pageSize = 10, lastDoc = null) => {
  try {
    let coursesQuery;
    
    if (category) {
      if (lastDoc) {
        coursesQuery = query(
          collection(db, "courses"),
          where("category", "==", category),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        coursesQuery = query(
          collection(db, "courses"),
          where("category", "==", category),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }
    } else {
      if (lastDoc) {
        coursesQuery = query(
          collection(db, "courses"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        coursesQuery = query(
          collection(db, "courses"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
      }
    }
    
    const coursesSnapshot = await getDocs(coursesQuery);
    const lastVisible = coursesSnapshot.docs[coursesSnapshot.docs.length - 1];
    
    const courses = [];
    coursesSnapshot.forEach(doc => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    
    return { courses, lastVisible };
  } catch (error) {
    throw error;
  }
};

// Get course details
export const getCourseDetails = async (courseId) => {
  try {
    const courseDoc = await getDoc(doc(db, "courses", courseId));
    if (courseDoc.exists()) {
      return { id: courseDoc.id, ...courseDoc.data() };
    } else {
      throw new Error("Course not found");
    }
  } catch (error) {
    throw error;
  }
};

// Get course modules
export const getCourseModules = async (courseId) => {
  try {
    const modulesQuery = query(
      collection(db, "modules"),
      where("courseId", "==", courseId),
      orderBy("order", "asc")
    );
    
    const modulesSnapshot = await getDocs(modulesQuery);
    const modules = [];
    
    modulesSnapshot.forEach(doc => {
      modules.push({ id: doc.id, ...doc.data() });
    });
    
    return modules;
  } catch (error) {
    throw error;
  }
};

// Get module details
export const getModuleDetails = async (moduleId) => {
  try {
    const moduleDoc = await getDoc(doc(db, "modules", moduleId));
    if (moduleDoc.exists()) {
      return { id: moduleDoc.id, ...moduleDoc.data() };
    } else {
      throw new Error("Module not found");
    }
  } catch (error) {
    throw error;
  }
};

// Get media content URL
export const getMediaUrl = async (mediaPath) => {
  try {
    const mediaRef = ref(storage, mediaPath);
    return await getDownloadURL(mediaRef);
  } catch (error) {
    throw error;
  }
};

// Get adaptive content for device
export const getAdaptiveContent = async (moduleId, deviceType) => {
  try {
    const contentQuery = query(
      collection(db, "content"),
      where("moduleId", "==", moduleId),
      where("deviceTypes", "array-contains", deviceType)
    );
    
    const contentSnapshot = await getDocs(contentQuery);
    if (!contentSnapshot.empty) {
      return { id: contentSnapshot.docs[0].id, ...contentSnapshot.docs[0].data() };
    } else {
      // Fallback to default content if device-specific not found
      const defaultQuery = query(
        collection(db, "content"),
        where("moduleId", "==", moduleId),
        where("isDefault", "==", true)
      );
      
      const defaultSnapshot = await getDocs(defaultQuery);
      if (!defaultSnapshot.empty) {
        return { id: defaultSnapshot.docs[0].id, ...defaultSnapshot.docs[0].data() };
      } else {
        throw new Error("Content not found");
      }
    }
  } catch (error) {
    throw error;
  }
};
