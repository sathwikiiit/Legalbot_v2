import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { LoginService } from "./login.service";

export const AuthGuard:CanActivateFn=(route,state)=>{
  return inject(LoginService).isLoggedIn.getValue()? true: inject(Router).createUrlTree(['/login']);
}
