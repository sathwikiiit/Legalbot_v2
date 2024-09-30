import { Routes } from '@angular/router';
import { LoginpageComponent } from './loginpage/loginpage.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { VerificationComponent } from './verification/verification.component';
import { SuitFormComponent } from './suit-form/suit-form.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo:'login',
        pathMatch:'full'
    },
    {
        path:'login',
        title:'Legalbot Login',
        component:LoginpageComponent
    },
    {
        path:'dashboard',
        title:'Dashboard',
        canActivate:[AuthGuard],
        component:DashboardComponent
    },
    {
        path:'newsuit',
        title:'Enter the Details',
        canActivate:[AuthGuard],
        component:SuitFormComponent,
    },
    {
        path:'suit/:id',
        title:'Enter the Details',
        canActivate:[AuthGuard],
        component:VerificationComponent,
    },
];
export default routes
