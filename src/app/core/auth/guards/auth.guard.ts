import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const alert = inject(AlertController);

  console.log(auth.user())

  if (!auth.user()) {
    alert
      .create({
        header: 'Unhauthorized',
        message: 'You shall not pass.',
        buttons: ['OK']
      })
      .then(newAlert => {
        newAlert.present();
      });
      return false;
  }
  return true
}
