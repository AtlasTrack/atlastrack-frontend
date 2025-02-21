// api-interfaces.ts

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }
  
  export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
  }
  
  export interface AutoReadRecord {
    startTime: string;
    endTime: string;
    wellNumber: number;
    serialNumber: string;
    result: string;
    biType: string;
    isControlTest: boolean;
    biLotNumber: string;
    sterilizerModels: string;
    loadNumber: string;
    isImplant: boolean;
    technicianNames: string;
    cycleCount: number;
    chemicalIntegrators: string;
    clinicName: string;
    clinicAddress: string;
  }
  
  export interface RegisterRequest {
    email: string;
    fullName: string;
    phoneNumber: string;
    password: string;
    clinicName: string;
    clinicAddress: string;
  }
  
  export interface DashboardStats {
    totalReports: number;
    successRate: number;
    avgProcessingTime: number;
    previousMonthReports?: number;
    avgProcessingTimeBaseline?: number;
  }
  
  export interface WeeklyTestData {
    labels: string[];
    values: number[];
  }
  
  export interface TestDistribution {
    controlTests: number;
    implantTests: number;
    otherTests: number;
  }


export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  clinicName: string;
  clinicAddress: string;
  phoneNumber: string;
}
export interface LoginRequestDTO {
  email: string;
  password: string;
}
export interface ResetPasswordDTO {
  phoneNumber: string;
  newPassword: string;
}
