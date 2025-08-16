'use client';

import { collection, doc, getDoc, getDocs, query, where, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { generateTOTP, verifyTOTP, generateTOTPSecret, generateBackupCodes, hashBackupCodes } from '@/lib/utils/2fa';

export const createUser = async (email, password, userData) => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(userCredential.user, {
      displayName: userData.displayName
    });
    
    // Add user data to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      displayName: userData.displayName,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Add updatedAt timestamp
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If security preferences are included, ensure they're properly structured
    if (updates.securityPreferences) {
      updatedData.securityPreferences = {
        defaultEncryption: Boolean(updates.securityPreferences.defaultEncryption),
        twoFactorAuth: Boolean(updates.securityPreferences.twoFactorAuth),
        notifyOnLogin: Boolean(updates.securityPreferences.notifyOnLogin),
        notifyOnShare: Boolean(updates.securityPreferences.notifyOnShare)
      };

      // If enabling 2FA, generate necessary secrets and backup codes
      if (updates.securityPreferences.twoFactorAuth && !updates.twoFactorAuthSetup) {
        const secret = generateTOTPSecret();
        const backupCodes = generateBackupCodes();
        const hashedBackupCodes = await hashBackupCodes(backupCodes);

        updatedData.twoFactorAuth = {
          secret,
          backupCodes: hashedBackupCodes,
          enabled: false, // Will be enabled after verification
          createdAt: new Date().toISOString()
        };

        // Return backup codes to be shown to user once
        updatedData.tempBackupCodes = backupCodes;
      }
    }

    await updateDoc(userRef, updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    // Update user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    // Update auth profile if displayName is included
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Get current user from auth
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // Create basic profile
      const basicProfile = {
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Set the document
      await setDoc(userRef, basicProfile);

      return {
        id: userId,
        ...basicProfile
      };
    }
    
    return {
      id: userSnap.id,
      ...userSnap.data()
    };
  } catch (error) {
    console.error('Error fetching/creating user profile:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const userDoc = snapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};
