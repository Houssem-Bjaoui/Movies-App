
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { environment } from '../../../environments/environment';

// Initialiser Firebase une seule fois
const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(environment.firebase);

// Services Firebase
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

