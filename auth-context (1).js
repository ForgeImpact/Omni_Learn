// src/contexts/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange } from '../services/authService';
import { updateDevicePreferences } from '../services/userProfileService';
import deviceAdapterService from '../services/deviceAdapterService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {