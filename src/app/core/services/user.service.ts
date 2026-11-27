
import { Injectable } from '@angular/core';
import { doc, setDoc, getDoc, updateDoc} from 'firebase/firestore';

import { db } from './firebase';
import { UserProfile } from '../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  // Houni naamlou profil lel utilisateur fi Firestore
  async createUserProfile(
    
    profile: Pick<UserProfile, 'uid' | 'firstName' | 'lastName' | 'age'>
  ): Promise<void> {

    // Houni na7adhrou les données elli bech nsajlouhom
    const userData = {
      uid: profile.uid,
      firstName: profile.firstName,
      lastName: profile.lastName,
      age: profile.age,
      role: 'user',
      status: 'active',
      favoriteGenres: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Houni nsajlou profil fi collection users
    await setDoc(
      doc(db, 'users', profile.uid),
      userData
    );
  }
// Houni njibou profil utilisateur mel Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {

// Houni njibou document mel collection users b uid mta3 l'utilisateur
    const userRef = doc(db, 'users', uid);

// njibou les donnees mte3 l'utilisateur 
    const userSnap = await getDoc(userRef);

// houni ncheckiw ken l'utilisateur mawjoud wala le 
    if(!userSnap.exists()) {
        return null;
    }
    
// else nraj3ou les donnees mte3 l'utilisateur
    return userSnap.data() as UserProfile;
  }

  async updateUserProfile(
    uid: string,

    // partial: les champs ywaliw facultatif
    // pick : na5tarou les champs elli bech na3mllhom update
    updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'age' | 'favoriteGenres'>>
  ): Promise<void> {
    const userRef = doc(db, 'users' , uid);

    // Houni update les donnees mte3 l'utilisateur fi Firestore
    await updateDoc(userRef, {
        ...updates,

        // enregiste la date de dernière modification
        updatedAt: new Date(),
    });
  }

// nrhbtou mel user kn actif walla desactive 
  async isUserActive(uid: string): Promise<boolean> {

// njibou profiml mte3 user 
    const profile = await this.getUserProfile(uid);

    // ken user mawjoud w status mte3ou active nraj3ou true 
    return profile !== null && profile.status == 'active' ; 
  }
  
  

}

 