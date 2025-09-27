
'use client';

import type { AnalysisResult } from './types';

const getLocalStorageKey = (userId: string) => `resume_buddy_user_${userId}`;

/**
 * Saves user data to local storage, merging with existing data.
 */
export const saveUserData = (userId: string, dataToSave: Partial<AnalysisResult>) => {
  if (typeof window === 'undefined') return;

  try {
    const key = getLocalStorageKey(userId);
    const existingData = getUserData(userId) || {};
    const newData = { ...existingData, ...dataToSave, updatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(newData));
  } catch (error) {
    console.error('Error saving data to local storage:', error);
  }
};

/**
 * Retrieves user data from local storage.
 */
export const getUserData = (userId: string): AnalysisResult | null => {
  if (typeof window === 'undefined') return null;

  try {
    const key = getLocalStorageKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving data from local storage:', error);
    return null;
  }
};

/**
 * Clears all data for a specific user from local storage.
 */
export const clearUserData = (userId: string) => {
  if (typeof window === 'undefined') return;

  try {
    const key = getLocalStorageKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing data from local storage:', error);
  }
};
