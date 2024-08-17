import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuard2 implements CanActivate {

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      //without login does not gone to homepage
      return true;
        if (sessionStorage.getItem('token')) {
        }
        this.router.navigate(['/login']);
        return false;

    }
}


