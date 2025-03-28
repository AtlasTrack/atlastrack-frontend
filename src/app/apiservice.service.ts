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
  LoginRequestDTO,
  ResetPasswordDTO,
  UltraSonicRequestDTO,
  WaterTestingRequestDTO
} from './apiinterfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.baseUrl;
  private apiUrl = environment.apiUrl;
private ultrasonicBaseUrl = environment.ultrasonicBaseUrl;
private waterTestingBaseUrl = environment.waterTestingBaseUrl;
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



  getUltraSonicRecordsByClinic(
    clinicName: string,
    testTypeName: string,
    page: number = 0, 
    size: number = 10
  ): Observable<{
    content: any[],
    totalPages: number,
    totalElements: number,
    number: number
  }> {
    return this.http.get<any>(`${this.ultrasonicBaseUrl}/clinic/${clinicName}/${testTypeName}`, {
      params: { 
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


  getClinicTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/auth/clinictypes`)
      .pipe(
        catchError(error => {
          console.error('Error fetching clinic types:', error);
          return of([]); // Return empty array on error
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
        localStorage.setItem('email', profile.email);
        localStorage.setItem('phoneNumber', profile.phoneNumber);
        localStorage.setItem('fullName', profile.fullName);
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

  getResults(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/results/clinic/${clinicName}`);
  }

  getBiTypes(): Observable<string[]> {    
    return this.http.get<string[]>(`${this.baseUrl}/biTypes`);
  }

  getBiLotNumbers(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/biLotNumbers/clinic/${clinicName}`);
  }

  getSterilizerModels(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/sterilizerModels/clinic/${clinicName}`);
  }

  getTechniciansByClinic(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/technicians/clinic/${clinicName}`);
  }

  getChemicalIntegrators(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/chemicalIntegrators/clinic/${clinicName}`);
  }

  getCycleCounts(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/cycleCounts/clinic/${clinicName}`);
  }

  getLoadNumbers(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/loadNumbers/clinic/${clinicName}`);
  }

  createRecord(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/createRecord`, data);
  }

  // Add this method to your existing ApiService class
createSerialAndBIType(
  clinicName: string,
  clinicAddress: string,
  serialNumber: string,
  biTypeValue: string
): Observable<any> {
  const params = new HttpParams()
    .set('clinicName', clinicName)
    .set('clinicAddress', clinicAddress)
    .set('serialNumber', serialNumber)
    .set('biTypeValue', biTypeValue);

  return this.http.post(`${this.baseUrl}/createSerialAndBIType`, null, { params }).pipe(
    tap(response => {
      console.log('Serial and BI Type created successfully:', response);
    }),
    catchError(error => {
      console.error('Error creating Serial and BI Type:', error);
      return throwError(() => ({
        message: error.error?.message || error.error || 'Failed to create Serial and BI Type'
      }));
    })
  );
}


getLastSerialNumberByClinic(clinicName: string): Observable<string | null> {
  return this.http.get(`${this.baseUrl}/serialNumbers/clinic/${clinicName}`, { responseType: 'text' }).pipe(
    map(response => response || null),
    catchError(error => {
      console.error('Error fetching last serial number:', error);
      return of(null);
    })
  );
}

// Method to get the last BI type for a clinic
getLastBITypeByClinic(clinicName: string): Observable<string | null> {
  return this.http.get(`${this.baseUrl}/biType/clinic/${clinicName}`, { responseType: 'text' }).pipe(
    map(response => response || null),
    catchError(error => {
      console.error('Error fetching last BI type:', error);
      return of(null);
    })
  );
}
  getFilteredClinicRecords(clinicName: string, startDate: string, endDate: string, page: number) {
    return this.http.get<any>(`${this.baseUrl}/filter/clinic`, {
      params: {
        clinicName,
        start: startDate,
        end: endDate,
        page: page.toString()
      }
    });
  }

  getUltrasonicFilteredClinicRecords(clinicName: string, testTypeName: string, startDate: string, endDate: string, page: number) {
    return this.http.get<any>(`${this.ultrasonicBaseUrl}/clinic/filtered`, {
      params: {
        clinicName,
        testTypeName,
        start: startDate,
        end: endDate,
        page: page.toString()
      }
    });
  }

  exportClinicExcel(clinicName: string, startDate: string, endDate: string) {
    return this.http.get(`${this.baseUrl}/export/clinic/excel`, {
      params: { clinicName, start: startDate, end: endDate },
      responseType: 'blob'
    });
  }


  exportUltraSonicClinicExcel(clinicName: string, testTypeName: string, startDate: string, endDate: string) {
    return this.http.get(`${this.ultrasonicBaseUrl}/export/clinic/excel`, {
      params: { clinicName, testTypeName, start: startDate, end: endDate },
      responseType: 'blob'
    });
  }

  exportClinicPDF(clinicName: string, startDate: string, endDate: string) {
    return this.http.get(`${this.baseUrl}/export/clinic/pdf`, {
      params: { clinicName, start: startDate, end: endDate },
      responseType: 'blob'
    });
  }


  exportUltraSonicClinicPDF(clinicName: string, startDate: string, endDate: string) {
    return this.http.get(`${this.ultrasonicBaseUrl}/export/clinic/pdf`, {
      params: { clinicName, start: startDate, end: endDate },
      responseType: 'blob'
    });
  }

  sendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/send-otp`, null, {
        params: { email }
    }).pipe(
        catchError(error => {
            console.error('Send OTP error:', error);
            return throwError(() => ({
                message: error.error?.message || 'Failed to send OTP'
            }));
        })
    );
}

updateUserProfile(updateData: {
  originalEmail: string;
  newEmail: string;
  userName: string;
  clinicName: string;
  clinicAddress: string;
  phoneNumber: string;
  password: string;
}): Observable<any> {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return throwError(() => ({
      message: 'Authentication token not found'
    }));
  }
  
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.post(`${this.apiUrl}/auth/update-profile`, updateData, { headers }).pipe(
    tap(response => {
      console.log('Profile update response:', response);
      
      // Update localStorage with new values
      localStorage.setItem('clinic', updateData.clinicName);
      localStorage.setItem('clinicAddress', updateData.clinicAddress);
      localStorage.setItem('email', updateData.newEmail);
      localStorage.setItem('phoneNumber', updateData.phoneNumber);
      localStorage.setItem('fullName', updateData.userName);
      
      // Update the current user subject
      const currentUser = this.currentUserSubject.getValue();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          email: updateData.newEmail,
          fullName: updateData.userName,
          clinicName: updateData.clinicName,
          clinicAddress: updateData.clinicAddress,
          phoneNumber: updateData.phoneNumber
        };
        this.currentUserSubject.next(updatedUser);
      }
    }),
    catchError(error => {
      console.error('Profile update error:', error);
      return throwError(() => ({
        message: error.error?.message || 'Failed to update profile'
      }));
    })
  );
}

verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-otp`, {
        email,
        otp
    }).pipe(
        catchError(error => {
            console.error('Verify OTP error:', error);
            return throwError(() => ({
                message: error.error?.message || 'Failed to verify OTP'
            }));
        })
    );
}

  resetPassword(resetPasswordData: ResetPasswordDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, resetPasswordData).pipe(
      tap(response => {
        console.log('Password reset response:', response);
      }),
      catchError(error => {
        console.error('Password reset error:', error);
        return throwError(() => ({
          message: error.error?.message || 'Failed to reset password'
        }));
      })
    );
  }


   // New methods for the ultrasonic/washer functionality
   createUltrasonicRecord(data: UltraSonicRequestDTO): Observable<any> {
    return this.http.post(`${this.ultrasonicBaseUrl}/createRecord`, data);
  }

  getTechnicians(clinicName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.ultrasonicBaseUrl}/clinic/${clinicName}/technicians`);
  }

  getEfficacyTests(clinicName: string, testTypeName:string): Observable<any[]> {
    return this.http.get<any[]>(`${this.ultrasonicBaseUrl}/clinic/${clinicName}/${testTypeName}/efficacy-tests`);
  }




// Water Testing APIs



   createWaterTestingRecord(data: WaterTestingRequestDTO): Observable<any> {
    return this.http.post(`${this.waterTestingBaseUrl}/createRecord`, data);
  }

  getWaterTestingFilteredClinicRecords(clinicName: string, startDate: string, endDate: string, page: number) {
    return this.http.get<any>(`${this.waterTestingBaseUrl}/clinic/filtered`, {
      params: {
        clinicName,
        start: startDate,
        end: endDate,
        page: page.toString()
      }
    });
  }

 
  getWaterTestingRecordsByClinic(
    clinicName: string, 
    page: number = 0, 
    size: number = 10
  ): Observable<{
    content: any[],
    totalPages: number,
    totalElements: number,
    number: number
  }> {
    return this.http.get<any>(`${this.waterTestingBaseUrl}/clinic/${clinicName}`, {
      params: { 
        page: page.toString(), 
        size: size.toString() 
      }
    });
  }

 


  getDevicesByClinic(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.waterTestingBaseUrl}/clinic/${clinicName}/devices`);
  }



  getLocationsByClinic(clinicName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.waterTestingBaseUrl}/clinic/${clinicName}/locations`);
  }


  getWaterTestingTechniciansByClinic(clinicName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.waterTestingBaseUrl}/clinic/${clinicName}/technicians`);
  }



  exportWaterTestingClinicExcel(clinicName: string, startDate: string, endDate: string) {
    return this.http.get(`${this.waterTestingBaseUrl}/export/clinic/excel`, {
      params: { clinicName, start: startDate, end: endDate },
      responseType: 'blob'
    });
  }

  exportWaterTestingClinicPDF(clinicName: string, startDate: string, endDate: string) {
    return this.http.get(`${this.waterTestingBaseUrl}/export/clinic/pdf`, {
      params: { clinicName, start: startDate, end: endDate },
      responseType: 'blob'
    });
  }
  
}




