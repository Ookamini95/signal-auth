import { ChangeDetectorRef, Injectable, OnInit, computed, effect, inject, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http'
import { AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EMPTY, catchError, from, map, switchMap, take, tap } from 'rxjs';

import { toSignal } from '@angular/core/rxjs-interop'

const helper = new JwtHelperService();
const TOKEN_KEY_STORE = 'auth-token';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit {

    public user = signal<any>(undefined);

    private userData = signal<string | undefined>(undefined); // decoded token
    private userDataSet = () => {
        const token = this.userData()
        if (token) this.storage.set(TOKEN_KEY_STORE, token);
    }
    
    private platformReady = signal(false);

    constructor(
        private storage: Storage,
        private http: HttpClient,
        private plt: Platform,
        private router: Router,
        private alert: AlertController
    ) {
        console.log("auth constructor");

        this.plt.ready().then(() => {
            console.log("plt ready");
            this.storage.create();
            if (!this.userData()) this.loadStoredToken();
            this.platformReady.set(true);
        })

        effect(this.userDataSet)


        setInterval(() => console.log("LOGGED", this.user()),10000)
    }

    async ngOnInit() {
        await this.storage.create()
    }

    async loadStoredToken() {
        const token = await this.storage.get(TOKEN_KEY_STORE);
        console.log("STORAGE TOKEN", token)
        if (token) {
            const decoded = helper.decodeToken(token); // returns the decoded payload
            console.log('decoded from storage: ', decoded, token)
            this.userData.set(token)
        } else this.userData.set(undefined);
    }

    login(credentials: { email: string, psw: string }) {
        if (credentials.email != "test@test.com" || credentials.psw != "test") {
            console.log("WRONG CREDENTIALS")
            this.alert
                .create({
                    message: "Wrong credentials",
                    buttons: ["Ok my bad"]
                })
                .then(alert => alert.present())
            return null;
        }

        /*return toSignal() */

        return this.http.get('https://randomuser.me/api').pipe(
            map((res: Partial<{ results: string[] }>) => {
                if (res.results && res.results.length > 0) return res.results[0];
                return null;
            }),
            take(1),
            tap((user) => {
                console.log(user); // Should print the first element of the array
                this.user.set(user);
            }),
            map(res => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.wnJk1MKZdJCunhl3oVUz4ZyflZQRvBJV87gBh5-_J0A"), //ficticious response from backend that yields a token
            tap(token => console.log(token)),
            switchMap(token => {
                const decoded = helper.decodeToken(token);
                console.log("login decoded", decoded);
                this.userData.set(token);
                return from([token]);
            }),
            catchError(err => {
                console.error("Error occurred:", err);
                return EMPTY;
            })
        );
    }

    getUser() {
        return this.userData();
    }

    logout() {
        this.router.navigateByUrl('/');
        this.userData.set(undefined);
    }
}