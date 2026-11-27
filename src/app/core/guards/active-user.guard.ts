
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const activeUserGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  // on attend que firebase verifie l'état de connexion 
  const currentUser = await authService.waitForAuthState();

  // si l'utilisateur n'est pas connecté, on le redirige vers la page d'accueil
  if (!currentUser) {
    return router.createUrlTree(['/home']);
  }

  try {
    // on vérifie la situation du compte de l'utilisateur dans Firestore
    const isActive = await userService.isUserActive(currentUser.uid);

    if (isActive) {
      return true;
    }

    //si user desctive on le deconnecte et redirect vers home
    await authService.logout();

    return router.createUrlTree(['/home']);
  } catch (error) {
    // si il y'a un probleme on le redirige vers la page d'accueil
    console.error('Error checking user status:', error);

    await authService.logout();

    return router.createUrlTree(['/home']);
  }
};
