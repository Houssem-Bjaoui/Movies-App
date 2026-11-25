
export type UserRole = 'user' | 'admin';

export type UserStatus = 'active' | 'disabled';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  age: number;
  photoPath: string | null;
  role: UserRole;
  status: UserStatus;
  favoriteGenres: number[];
  createdAt: Date;
  updatedAt: Date;
}
