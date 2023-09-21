import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/auth/services/auth.service';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements  OnDestroy {

  public credentials = {
    email: "test@test.com",
    psw: "test"
  }

  private readonly destroy$ = new Subject<void>();

  constructor(private auth: AuthService, private store: Storage) {
  }


  printUser() {
    console.log(this.auth.user())
  }

  login() {
    this.auth.login$(this.credentials)?.pipe(takeUntil(this.destroy$)).subscribe((value) => console.log("subscribed token", value))
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
