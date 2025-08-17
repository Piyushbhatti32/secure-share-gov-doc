import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

/**
 * Aadhaar Verification API
 * Validates Aadhaar numbers and integrates with government verification systems
 */
export async function POST(request) {
  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No valid token provided' }, { status: 401 });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }
    
    const { aadhaarNumber, name, dateOfBirth } = await request.json();
    
    if (!aadhaarNumber) {
      return NextResponse.json({ error: 'Aadhaar number is required' }, { status: 400 });
    }
    
    // Validate Aadhaar number format (12 digits)
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber)) {
      return NextResponse.json({ 
        error: 'Invalid Aadhaar number format. Must be 12 digits.' 
      }, { status: 400 });
    }
    
    // Check for valid checksum (Verhoeff algorithm)
    if (!isValidAadhaarChecksum(aadhaarNumber)) {
      return NextResponse.json({ 
        error: 'Invalid Aadhaar number. Checksum validation failed.' 
      }, { status: 400 });
    }
    
    // In a real implementation, this would integrate with UIDAI's Aadhaar API
    // For now, we'll simulate verification with basic validation
    const verificationResult = await simulateAadhaarVerification(aadhaarNumber, name, dateOfBirth);
    
    if (verificationResult.verified) {
      // Update user's custom claims with Aadhaar verification status
      await getAuth().setCustomUserClaims(decodedToken.uid, {
        aadhaarVerified: true,
        aadhaarNumber: aadhaarNumber,
        aadhaarVerifiedAt: new Date().toISOString()
      });
      
      console.log(`✅ Aadhaar verification successful for user: ${decodedToken.uid}`);
      
      return NextResponse.json({
        success: true,
        message: 'Aadhaar verification successful',
        data: {
          verified: true,
          aadhaarNumber: aadhaarNumber,
          verificationDate: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Aadhaar verification failed',
        error: verificationResult.error
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in Aadhaar verification:', error);
    return NextResponse.json({ 
      error: 'Internal server error during Aadhaar verification' 
    }, { status: 500 });
  }
}

/**
 * Validate Aadhaar number checksum using Verhoeff algorithm
 * @param {string} aadhaarNumber - 12-digit Aadhaar number
 * @returns {boolean} - True if checksum is valid
 */
function isValidAadhaarChecksum(aadhaarNumber) {
  // Verhoeff algorithm implementation for Aadhaar validation
  const multiplication = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  
  const permutation = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];
  
  const inverse = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
  
  let c = 0;
  const digits = aadhaarNumber.split('').map(Number);
  
  for (let i = digits.length - 1; i >= 0; i--) {
    c = multiplication[c][permutation[((digits.length - i) % 8)][digits[i]]];
  }
  
  return c === 0;
}

/**
 * Simulate Aadhaar verification with UIDAI
 * In production, this would integrate with UIDAI's official API
 * @param {string} aadhaarNumber - Aadhaar number to verify
 * @param {string} name - Name for verification
 * @param {string} dateOfBirth - Date of birth for verification
 * @returns {Object} - Verification result
 */
async function simulateAadhaarVerification(aadhaarNumber, name, dateOfBirth) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Basic validation - in real implementation, this would call UIDAI API
  // For demo purposes, we'll accept any valid format Aadhaar number
  if (aadhaarNumber && aadhaarNumber.length === 12) {
    return {
      verified: true,
      error: null
    };
  }
  
  return {
    verified: false,
    error: 'Aadhaar verification failed. Please check the details provided.'
  };
}
