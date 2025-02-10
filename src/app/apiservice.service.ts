import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from './environment';

import { 
  PaginatedResponse, 
  TokenResponse, 
  AutoReadRecord, 
  RegisterRequest, 
  DashboardStats, 
  WeeklyTestData, 
  TestDistribution, 
  LoginResponse,
  UserProfile,
  LoginRequestDTO
} from './apiinterfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.baseUrl;
  private apiUrl = environment.apiUrl;


  private currentUserSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('access_token');
    // if (token) {
    //   this.loadUserProfile();
    // }
  }



  private readonly REMEMBER_KEY = 'remembered_user';

  rememberUser(email: string, password: string): void {
    // In a production environment, you should use a more secure way to store credentials
    const userData = btoa(JSON.stringify({ email, password }));
    localStorage.setItem(this.REMEMBER_KEY, userData);
  }

  forgetUser(): void {
    localStorage.removeItem(this.REMEMBER_KEY);
  }

  getRememberedUser(): { email: string; password: string } | null {
    const userData = localStorage.getItem(this.REMEMBER_KEY);
    if (userData) {
      try {
        return JSON.parse(atob(userData));
      } catch {
        this.forgetUser();
        return null;
      }
    }
    return null;
  }


  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }

  getWeeklyTestData(): Observable<WeeklyTestData> {
    return this.http.get<WeeklyTestData>(`${this.baseUrl}/dashboard/weekly-tests`);
  }

  getTestDistribution(): Observable<TestDistribution> {
    return this.http.get<TestDistribution>(`${this.baseUrl}/dashboard/test-distribution`);
  }

  getRecordsByClinic(
    clinicName: string, 
    page: number = 0, 
    size: number = 10
  ): Observable<{
    content: any[],
    totalPages: number,
    totalElements: number,
    number: number
  }> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/records-by-clinic`, {
      params: { 
        clinicName, 
        page: page.toString(), 
        size: size.toString() 
      }
    });
  }

  getClinicNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/dashboard/clinic-names`);
  }
  
  getClinicStats(clinicName: string): Observable<{
    clinicName: string,
    totalTests: number,
    controlTests: number,
    implantTests: number,
    weeklySummary: Record<string, number>
  }> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/clinic-stats`, {
      params: { clinicName }
    });
  }

  register(userData: RegisterRequest): Observable<any> {
    console.log('Starting registration with data:', { ...userData, password: '[REDACTED]' });
    
    return this.http.post(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        console.log('Registration response:', response);
      }),
      switchMap(response => {
        console.log('Proceeding to login after successful registration');
        return this.login(userData.email, userData.password).pipe(
          tap(success => {
            console.log('Login successful:', success);
          })
        );
      }),
      switchMap(success => {
        return success ? of(true) : throwError(() => ({ message: 'Password mismatch' }));
      }),
      catchError(error => {
        console.log('Full error object:', error);
        console.log('Error status:', error.status);
        console.log('Error message:', error.message);
        console.log('Error response:', error.error);
        
        // If it's an HTTP error response
        if (error.error) {
          return throwError(() => ({
            message: error.error.message || error.error || 'Registration failed'
          }));
        }
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string): Observable<boolean> {
    console.log('Starting login process for user:', email);
    
    const loginRequest: LoginRequestDTO = {
      email,
      password
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginRequest).pipe(
      tap(response => {
        console.log('Login response received, tokens present:', {
          accessToken: !!response.access_token,
          refreshToken: !!response.refresh_token
        });
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      }),
      switchMap(() => this.loadUserProfile(email, password)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => ({
          message: error.message || 'Login failed'
        }));
      })
    );
  }

  private loadUserProfile(email: string, password: string): Observable<boolean> {
    const token = localStorage.getItem('access_token');
    if (!token) return of(false);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserProfile>(
      `${this.apiUrl}/auth/profile?email=${email}&password=${password}`,
      { headers }
    ).pipe(
      tap(profile => {
        console.log('Profile loaded:', profile);
        this.currentUserSubject.next(profile);
        localStorage.setItem('clinic', profile.clinicName);
        localStorage.setItem('clinicAddress', profile.clinicAddress);
        console.log("Clinic ", profile.clinicName);
      }),
      map(() => true),
      catchError(error => {
        console.error('Profile loading error:', error);
        this.logout();
        return throwError(() => ({
          message: error.error?.message || 'Failed to load user profile'
        }));
      })
    );
  }




  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<any> {
    return this.currentUserSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }


  getFilteredRecords(start: string, end: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<AutoReadRecord>> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<AutoReadRecord>>(`${this.baseUrl}/filter`, { params });
  }

  exportExcel(start: string, end: string): Observable<Blob> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);

    return this.http.get(`${this.baseUrl}/export/excel`, { 
      params,
      responseType: 'blob' 
    });
  }

  exportPDF(start: string, end: string): Observable<Blob> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);

    return this.http.get(`${this.baseUrl}/export/pdf`, { 
      params,
      responseType: 'blob' 
    });
  }

  getPaginatedRecords(page: number = 0, size: number = 10): Observable<PaginatedResponse<AutoReadRecord>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<AutoReadRecord>>(`${this.baseUrl}/getAllRecords`, { params });
  }
  getSerialNumbers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/serialNumbers`);
  }

  getResults(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/results`);
  }

  getBiTypes(): Observable<string[]> {    
    return this.http.get<string[]>(`${this.baseUrl}/biTypes`);
  }

  getBiLotNumbers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/biLotNumbers`);
  }

  getSterilizerModels(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/sterilizerModels`);
  }

  getTechnicians(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/technicians`);
  }

  getChemicalIntegrators(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/chemicalIntegrators`);
  }

  getCycleCounts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/cycleCounts`);
  }

  getLoadNumbers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/loadNumbers`);
  }

  createRecord(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/createRecord`, data);
  }
}




