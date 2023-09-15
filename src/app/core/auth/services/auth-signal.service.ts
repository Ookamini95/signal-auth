import { Injectable, signal } from '@angular/core';

const _logged = signal(false);

@Injectable({providedIn: 'root'})
export class AuthSignalService {
    constructor() { }

    private user = signal<any>(undefined);
    private userData = signal<string | undefined>(undefined); // decoded token
    
    public platformReady = signal(false);

    setPlatformReady() {
        console.log("plt ready");
        this.platformReady.set(true);
    }

    setUserData(userData: string) {
        console.log("userdata set: ", userData);
        this.userData.set(userData);
    }

    getLoggedState() {
        return _logged()
    }

}