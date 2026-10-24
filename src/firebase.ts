import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AccessibilityPreferences,
  validateUserPreferencePayload,
} from './utils/accessibilityLogic';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider: any) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { User };

export async function loadUserPreferencesFromFirestore(
  userId: string
): Promise<AccessibilityPreferences | null> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return null;
  }
  const path = `userPreferences/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'userPreferences', userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      persona: data.persona,
      highContrast: Boolean(data.highContrast),
      dyslexiaFont: Boolean(data.dyslexiaFont),
      bionicReading: Boolean(data.bionicReading),
      readingRuler: Boolean(data.readingRuler),
      fontSize: Number(data.fontSize),
      lineSpacing: Number(data.lineSpacing),
      speechRate: Number(data.speechRate),
      preferredLanguage: data.preferredLanguage,
      privacyAccepted: Boolean(data.privacyAccepted),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncUserPreferencesToFirestore(
  userId: string,
  prefs: AccessibilityPreferences
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== userId || !auth.currentUser.emailVerified) {
    return;
  }
  const validation = validateUserPreferencePayload(userId, prefs);
  if (!validation.valid) {
    console.warn('Skipped Firestore sync due to payload validation:', validation.reason);
    return;
  }
  const path = `userPreferences/${userId}`;
  const docRef = doc(db, 'userPreferences', userId);
  try {
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        userId,
        persona: prefs.persona,
        highContrast: prefs.highContrast,
        dyslexiaFont: prefs.dyslexiaFont,
        bionicReading: prefs.bionicReading,
        readingRuler: prefs.readingRuler,
        fontSize: prefs.fontSize,
        lineSpacing: prefs.lineSpacing,
        speechRate: prefs.speechRate,
        preferredLanguage: prefs.preferredLanguage,
        privacyAccepted: prefs.privacyAccepted,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        persona: prefs.persona,
        highContrast: prefs.highContrast,
        dyslexiaFont: prefs.dyslexiaFont,
        bionicReading: prefs.bionicReading,
        readingRuler: prefs.readingRuler,
        fontSize: prefs.fontSize,
        lineSpacing: prefs.lineSpacing,
        speechRate: prefs.speechRate,
        preferredLanguage: prefs.preferredLanguage,
        privacyAccepted: prefs.privacyAccepted,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncReadingProgressToFirestore(
  userId: string,
  documentId: string,
  activeSectionId: string,
  completedCheckpoints: string[]
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== userId || !auth.currentUser.emailVerified) {
    return;
  }
  const idRegex = /^[a-zA-Z0-9_\-]+$/;
  if (!idRegex.test(userId) || !idRegex.test(documentId) || !idRegex.test(activeSectionId)) {
    return;
  }
  const safeCheckpoints = completedCheckpoints
    .filter((item) => typeof item === 'string' && item.length <= 128)
    .slice(0, 50);

  const path = `userPreferences/${userId}/readingProgress/${documentId}`;
  const docRef = doc(db, 'userPreferences', userId, 'readingProgress', documentId);
  try {
    const parentRef = doc(db, 'userPreferences', userId);
    const parentSnap = await getDoc(parentRef);
    if (!parentSnap.exists()) {
      return;
    }
    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      await setDoc(docRef, {
        userId,
        documentId,
        activeSectionId,
        completedCheckpoints: safeCheckpoints,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(docRef, {
        activeSectionId,
        completedCheckpoints: safeCheckpoints,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
