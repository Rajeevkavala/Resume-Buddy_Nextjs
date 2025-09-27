
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';
import type { AnalysisResult } from './types';

export const createUserProfile = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Could not create user profile.');
    }
  }
};

export const updateUserProfileInDb = async (userId: string, data: { displayName?: string; photoURL?: string }) => {
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, data);
    } catch (error) {
        console.error('Error updating user profile in Firestore:', error);
        // It's okay if this fails, as the auth profile is the source of truth
    }
};

export const saveData = async (
  userId: string,
  data: Partial<AnalysisResult>
) => {
  if (!userId) {
    throw new Error('User ID is required to save data.');
  }
  try {
    const dataRef = doc(db, `users/${userId}/resumeData`, 'latest');
    await setDoc(dataRef, { ...data, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    console.error('Error saving resume data:', error);
    throw new Error('Could not save resume data.');
  }
};

export const clearData = async (userId: string) => {
   if (!userId) {
    throw new Error('User ID is required to clear data.');
  }
  try {
    const dataRef = doc(db, `users/${userId}/resumeData`, 'latest');
    await deleteDoc(dataRef);
  } catch (error) {
    console.error('Error clearing resume data:', error);
    throw new Error('Could not clear resume data.');
  }
}

export const loadData = async (
  userId: string
): Promise<AnalysisResult | null> => {
  if (!userId) return null;

  try {
    const dataRef = doc(db, `users/${userId}/resumeData`, 'latest');
    const docSnap = await getDoc(dataRef);

    if (docSnap.exists()) {
      return docSnap.data() as AnalysisResult;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error loading resume data:', error);
    return null;
  }
};
