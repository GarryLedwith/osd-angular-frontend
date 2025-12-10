export interface AuthUser {
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}