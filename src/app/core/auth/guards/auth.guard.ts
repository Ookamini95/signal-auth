import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);

  console.log("injected user: ", auth.user(), auth.getUser())

  if (!auth.user()) {
    console.log("NOT AUTHORIZED")
      return false;
  }
  return true
}
