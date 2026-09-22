import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  onSnapshot,
  query,
  limit,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { FeedbackItem } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence benign transport retry warnings from noisy WebChannel stream reconnections
try {
  setLogLevel('error');
} catch (e) {
  // Ignore in environments where setLogLevel is not supported
}

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with auto-detect long polling to prevent WebChannel stream transport disconnect warnings in sandboxes/proxies
const customDbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId;

function getOrInitializeFirestore(): Firestore {
  try {
    const cacheConfig = persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    });
    if (customDbId) {
      return initializeFirestore(app, {
        localCache: cacheConfig,
        experimentalAutoDetectLongPolling: true,
      }, customDbId);
    }
    return initializeFirestore(app, {
      localCache: cacheConfig,
      experimentalAutoDetectLongPolling: true,
    });
  } catch (e) {
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
}

export const db: Firestore = getOrInitializeFirestore();

// Auto authenticate anonymously in background for seamless access
export const initAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          console.warn('Anonymous auth note:', err);
          resolve(null);
        }
      }
    });
  });
};

const ITEMS_COLLECTION = 'feedback_items';

/**
 * Real-time listener for all feedback items from Cloud Firestore
 */
export function subscribeToFeedbackItems(
  onUpdate: (items: FeedbackItem[]) => void,
  onError?: (err: Error) => void
) {
  const collRef = collection(db, ITEMS_COLLECTION);
  return onSnapshot(
    collRef,
    (snapshot) => {
      const results: FeedbackItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: data.id || docSnap.id,
          caseNumber: data.caseNumber || docSnap.id,
          caseStatus: data.caseStatus || 'Closed',
          date: data.date || '',
          monthYear: data.monthYear || '',
          type: data.type || 'Complaint',
          category: data.category || '',
          subCategory: data.subCategory || '',
          department: data.department || 'OTHER',
          area: data.area || data.venue || 'General Area',
          venue: data.venue || 'General',
          tableName: data.tableName || '',
          feedbackDetail: data.feedbackDetail || '',
          status: data.status || 'Pending',
          actionTaken: data.actionTaken || '',
          actionOwner: data.actionOwner === 'Duty Manager' ? '' : (data.actionOwner || ''),
          actionDueDate: data.actionDueDate || '',
          actionLogs: Array.isArray(data.actionLogs) ? data.actionLogs : [],
        });
      });
      onUpdate(results);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / update a single feedback item to Cloud Firestore
 */
export async function saveFeedbackItemToFirestore(item: FeedbackItem): Promise<void> {
  const docId = item.caseNumber || item.id;
  if (!docId) return;
  const docRef = doc(db, ITEMS_COLLECTION, docId);
  const cleanData = {
    id: docId,
    caseNumber: item.caseNumber || docId,
    caseStatus: item.caseStatus || 'Closed',
    date: item.date || '',
    monthYear: item.monthYear || '',
    type: item.type || 'Complaint',
    category: item.category || '',
    subCategory: item.subCategory || '',
    department: item.department || 'OTHER',
    area: item.area || item.venue || 'General Area',
    venue: item.venue || 'General',
    tableName: item.tableName || '',
    feedbackDetail: item.feedbackDetail || '',
    status: item.status || 'Pending',
    actionTaken: item.actionTaken || '',
    actionOwner: item.actionOwner === 'Duty Manager' ? '' : (item.actionOwner || ''),
    actionDueDate: item.actionDueDate || '',
    actionLogs: item.actionLogs || [],
    updatedAt: Date.now(),
  };
  await setDoc(docRef, cleanData, { merge: true });
}

/**
 * Batch upload / upsert multiple feedback items into Cloud Firestore in chunks of 450
 */
export async function batchSaveFeedbackItemsToFirestore(items: FeedbackItem[]): Promise<number> {
  const CHUNK_SIZE = 400;
  let savedCount = 0;

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const docId = item.caseNumber || item.id;
      if (!docId) continue;
      const docRef = doc(db, ITEMS_COLLECTION, docId);
      const cleanData = {
        id: docId,
        caseNumber: item.caseNumber || docId,
        caseStatus: item.caseStatus || 'Closed',
        date: item.date || '',
        monthYear: item.monthYear || '',
        type: item.type || 'Complaint',
        category: item.category || '',
        subCategory: item.subCategory || '',
        department: item.department || 'OTHER',
        area: item.area || item.venue || 'General Area',
        venue: item.venue || 'General',
        tableName: item.tableName || '',
        feedbackDetail: item.feedbackDetail || '',
        status: item.status || 'Pending',
        actionTaken: item.actionTaken || '',
        actionOwner: item.actionOwner === 'Duty Manager' ? '' : (item.actionOwner || ''),
        actionDueDate: item.actionDueDate || '',
        actionLogs: item.actionLogs || [],
        updatedAt: Date.now(),
      };
      batch.set(docRef, cleanData, { merge: true });
      savedCount++;
    }

    await batch.commit();
  }

  return savedCount;
}

/**
 * Clear all feedback items from Cloud Firestore
 */
export async function clearAllFirestoreFeedbackItems(): Promise<void> {
  const collRef = collection(db, ITEMS_COLLECTION);
  const snapshot = await getDocs(collRef);
  const CHUNK_SIZE = 400;
  const docs = snapshot.docs;

  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);
    for (const docSnap of chunk) {
      batch.delete(docSnap.ref);
    }
    await batch.commit();
  }
}
