import { EMPTY, catchError, concatMap, delay, map, of, retry, switchMap, take, tap, throwError } from 'rxjs';
import { Injectable, OnDestroy, effect, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { JwtHelperService } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage-angular';
import { UserData } from '../model/userdata.model';


const helper = new JwtHelperService();
const TOKEN_KEY_STORE = 'auth-token';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {


    public user = signal<any>(undefined);

    private readonly URL_ACCESS_TOKEN = "https://randomuser.me/api";
    private readonly URL_REFRESH_TOKEN = ".../refresh_token";

    private readonly _userData = signal<UserData | undefined>(undefined); // decoded token data
    private readonly _token = signal<string | undefined>(undefined);

    private tokenSetEffect = effect(() => this.storage.set(TOKEN_KEY_STORE, this._token()))

    get token() {
        if (this._token()) return this._token();
        else return null;
    }

    get userData() {
        if (this._userData()) return this._userData();
        else return null;
    }

    constructor(
        private storage: Storage,
        private http: HttpClient,
    ) { }

    ngOnDestroy() {
        this.tokenSetEffect.destroy()
    }

    logoff() {
        // GPT: Send a logout request to the API to invalidate the token (optional)
        this._token.set('');
        this.clearUserData();
    }

    login$(credentials: { email: string, psw: string }) {
        if (credentials.email != "test@test.com" || credentials.psw != "test") { // db facade
            console.log("WRONG CREDENTIALS")
            return null;
        }

        return this.http.get(this.URL_ACCESS_TOKEN /*, credentials*/).pipe( //! this should be a post, it is a get to for dev purposes
            map((res: Partial<{ results: string[] }>) => {
                if (res.results && res.results.length > 0) return res.results[0];
                return throwError(() => new Error('Wrong Credentials'));
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
                this._userData.set(decoded);
                console.log(decoded, "<decoded")
                this._token.set(token_res.access_token);
                return of(token_res.access_token);
            }),
            catchError((err: HttpErrorResponse) => {
                console.error("Error occurred:", err.message);
                if (err.status === 401) return this.refreshToken$();
                return EMPTY;
            })
        );
    }

    refreshToken$() {
        const retryAttempts = 3;
        const retryDelay = 2000;

        return this.http.post(this.URL_REFRESH_TOKEN, { /* pass necessary data if needed */ }).pipe(
            map((res: Partial<{ access_token: string }>) => {
                if (res && res.access_token) {
                    this._token.set(res.access_token);
                    return res.access_token;
                }
                return null;
            }),
            retry({
                delay: errors => errors.pipe(
                    delay(retryDelay),
                    take(retryAttempts),
                    concatMap((error, index) => {
                        if (index === retryAttempts - 1) {
                            return throwError(() => new Error('Retry attempts exceeded'));
                        }
                        return of(error);
                    })
                )
            }),
            catchError(err => {
                console.error("Could not refresh token:", err);
                return EMPTY;
            })
        );
    }

    private clearUserData() {
        this._userData.set(undefined);
        this.user.set(undefined);
    }
}