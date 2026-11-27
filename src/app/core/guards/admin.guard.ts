
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  // attendre que firebase verifie l'état de connexion de l'utilisateur
  const currentUser = await authService.waitForAuthState();

  // si l'utilisateur n'est pas connecté, on le redirige vers la page d'accueil 
  if (!currentUser) {
    return router.createUrlTree(['/home']);
  }

  try {
    // on recupere le profil de user connecté
    const profile = await userService.getUserProfile(currentUser.uid);

    // verifier si l'utilisateur est admin et actif
    if (profile && profile.role === 'admin' && profile.status === 'active') {
      return true;
    }

    // si l'utilisateur n'est pas admin ou pas actif, on le redirige vers la page d'accueil
    return router.createUrlTree(['/home']);
  } catch (error) {
    // si il y'a un probleme on le redirige vers la page d'accueil
    console.error('Error checking admin permissions:', error);

    return router.createUrlTree(['/home']);
  }
};
