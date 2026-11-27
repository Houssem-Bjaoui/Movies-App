
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // on attend que firebase verifie l'état de connexion de l'utilisateur
  const currentUser = await authService.waitForAuthState();

  // si l'utilisateur est connecté, on lui permet d'accéder à la route
  if (currentUser) {
    return true;
  }

  // kn mahouch connecté, on le redirige vers la page d'accueil
  return router.createUrlTree(['/home']);
};
