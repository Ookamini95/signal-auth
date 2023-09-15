import { Component, OnInit, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { switchMap, take } from 'rxjs';
import { AuthService } from 'src/app/core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials = {
    email: "test@test.com",
    psw: "test"
  }

  constructor(private auth: AuthService, private alertCtrl: AlertController, private router: Router) {
    setTimeout(() => this.login(), 5000)
  }

  ngOnInit() {
  }

  login() {
    this.auth.login(this.credentials)?.pipe(take(5)).subscribe((value) => console.log(value))
  }
}
