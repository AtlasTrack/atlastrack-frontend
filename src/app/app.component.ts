import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevicedescriptionComponent } from './devicedescription/devicedescription.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  // imports: [DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private router: Router) {}
  title = 'Atlastracker';

  ngOnInit(): void {

    const authToken = localStorage.getItem('access_token');
    const userInfo = localStorage.getItem('profile');

    if (!authToken && !userInfo) {
      // User is logged in, you can continue to the main app
      this.router.navigate(['/login']);
    } 
  }

}
