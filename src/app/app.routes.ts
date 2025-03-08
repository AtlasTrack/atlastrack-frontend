import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ReportsComponent } from './reports/reports.component';
import { RendervalueformComponent } from './rendervalueform/rendervalueform.component';
import { DevicedescriptionComponent } from './devicedescription/devicedescription.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AtlastrackerindexComponent } from './atlastrackerindex/atlastrackerindex.component';
import { DashboardloginComponent } from './dashboardlogin/dashboardlogin.component';
import { ClinicsdashboardComponent } from './clinicsdashboard/clinicsdashboard.component';
import { ForgetpasswordemailpageComponent } from './forgetpassword/forgetpasswordemailpage/forgetpasswordemailpage.component';
import { ForgetpasswordotppageComponent } from './forgetpassword/forgetpasswordotppage/forgetpasswordotppage.component';
import { ForgetpasswordnewpasswordComponent } from './forgetpassword/forgetpasswordnewpassword/forgetpasswordnewpassword.component';
import { ManageaccountComponent } from './manageaccount/manageaccount.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' }, // First page is login
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'atlasindex', component: AtlastrackerindexComponent },
    { path: 'report', component: ReportsComponent },
    { path: 'rendervalueform', component: RendervalueformComponent},
    { path: 'dashboard', component: DashboardComponent},
    { path: 'dashboardlogin', component: DashboardloginComponent},
    { path: 'clinicdashboard', component: ClinicsdashboardComponent},
    { path: 'devicedescription', component: DevicedescriptionComponent},
    { path: 'forgetpasswordemail', component: ForgetpasswordemailpageComponent},
    { path: 'forgetpasswordotp', component: ForgetpasswordotppageComponent},
    { path: 'manageaccount', component: ManageaccountComponent},
    { path: 'forgetpasswordnewpass', component: ForgetpasswordnewpasswordComponent},



    
];
