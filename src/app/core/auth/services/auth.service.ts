import { Injectable, effect, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http'
import { JwtHelperService } from '@auth0/angular-jwt';
import { EMPTY, catchError, from, map, switchMap, take, tap } from 'rxjs';


const helper = new JwtHelperService();
const TOKEN_KEY_STORE = 'auth-token';

@Injectable({ providedIn: 'root' })
export class AuthService {

    public user = signal<any>(undefined);

    private userData = signal<string | undefined>(undefined); // decoded token

    private token = signal("");
    private tokenSet = () => this.storage.set(TOKEN_KEY_STORE, this.token())

    constructor(
        private storage: Storage,
        private http: HttpClient,
    ) {

        effect(this.tokenSet)
        this.storage.create()
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
            map(res => { // ficticious response from backend that yields a token
                return {
                    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.wnJk1MKZdJCunhl3oVUz4ZyflZQRvBJV87gBh5-_J0A",
                    // "refresh_token": "..." // managed by HttpOnly cookie
                }
            }),
            switchMap(token_res => {
                const decoded = helper.decodeToken(token_res.access_token);
                console.log("login decoded", decoded);
                this.userData.set(decoded);
                this.token.set(token_res.access_token);

                return from([token_res.access_token]);
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

    getToken() {
        if (!this.token()) console.log("token not available");
        return this.token()
    }

    async getTokenAsync() {
        if (!this.token()) {
            console.log("token not available")
            console.log("Fetching from store")
            let storedToken: string = await this.storage.get(TOKEN_KEY_STORE)
            if (storedToken) this.token.set(storedToken);
            else this.token.set(await this.refreshToken())
        }

        return this.token()
    }

    async refreshToken() {
        console.log("Refreshing token")
        // Send request to auth with refresh_token cookie
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.wnJk1MKZdJCunhl3oVUz4ZyflZQRvBJV87gBh5-_J0A"
    }

}