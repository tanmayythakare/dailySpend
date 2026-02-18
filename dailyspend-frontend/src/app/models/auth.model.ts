export interface LoginRequest {
  username: string;
  password: string;
}

// Backend RegisterRequest only has username + password — no email field
export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}