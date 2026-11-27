import {Injectable} from '@angular/core';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    UserCredential,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import {auth} from './firebase';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // BCH NA3MLOU COMPTE JDID B EMAIL W PASSWORD

    async register(
        email: string,
        password: string
    ): Promise<UserCredential> {
        return await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    }


    // BCH NA3MLOU LOGIN B EMAIL W PASSWORD
    async login(
        email:string,
        password : string
    ): Promise<UserCredential> {
        return await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
    }


    // BCH NA3MLOU LOGOUT
    async logout(): Promise<void> {
        return await signOut(auth);
    }

    //njibou utilisateur connecté
    getCurrentUser() {
        return auth.currentUser;
    }



    //on attend firebase de verifier la connexion de l'utilisateur et on retourne l'utilisateur connecté ou null si pas connecté
    waitForAuthState(): Promise<User | null> {
        return new Promise((resolve) => {
            let unsubscribe : (() => void) | undefined ;

            unsubscribe = onAuthStateChanged(auth, (user) => {
                
                unsubscribe?.();
                // kn user mawjoud nraj3ouh sinon null
                resolve(user);
            });
        });
    }

    //houni bch nra9bou l'utilisateur connecté wala le 
    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, (user) => {
            callback(user);
        })
    }

    //houni bch n3aytou l'erreur w nbadlouha message
    getAuthErrorMessage(errorCode: string): string {
        switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée.';

    case 'auth/invalid-email':
      return 'Adresse email invalide.';

    case 'auth/weak-password':
      return 'Le mot de passe est trop faible.';

    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect.';

    case 'auth/network-request-failed':
      return 'Problème de connexion Internet.';

    default:
      return 'Une erreur est survenue. Veuillez réessayer.';
    }
}
       
}