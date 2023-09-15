import { Injectable, effect, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http'
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EMPTY, catchError, from, map, switchMap, take, tap } from 'rxjs';


const helper = new JwtHelperService();
const TOKEN_KEY_STORE = 'auth-token';

@Injectable({ providedIn: 'root' })
export class AuthService {

    public user = signal<any>(undefined);

    private userData = signal<string | undefined>(undefined); // decoded token
    private userDataSet = () => {
        const token = this.userData()
        if (token) this.storage.set(TOKEN_KEY_STORE, token);
    }
    
    constructor(
        private storage: Storage,
        private http: HttpClient,
        private router: Router,
        private alert: AlertController
    ) {
        console.log("auth constructor");
        this.storage.create()
        effect(this.userDataSet)
        // setInterval(() => console.log("LOGGED", this.user()),10000)
    }


    login(credentials: { email: string, psw: string }) {
        if (credentials.email != "test@test.com" || credentials.psw != "test") {
            console.log("WRONG CREDENTIALS")
            return null;
        }


        return this.http.get('https://randomuser.me/api').pipe(
            map((res: Partial<{ results: string[] }>) => {
                if (res.results && res.results.length > 0) return res.results[0];
                return null;
            }),
            take(1),
            tap((user) => {
                this.user.set(user);
            }),
            map(res => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.wnJk1MKZdJCunhl3oVUz4ZyflZQRvBJV87gBh5-_J0A"), // ficticious response from backend that yields a token
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
        return this.user();
    }

}