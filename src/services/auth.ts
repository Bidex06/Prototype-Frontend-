import axios from 'axios';

const API_URL = 'http://localhost:5212/api/auth';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionEnd: string;
  isTrial: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const auth = {
  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await axios.post<AuthResponse>(`${API_URL}/register`, {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
      email,
      password,
    });
    return response.data;
  },

  async refresh(refreshToken: string) {
    const response = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${API_URL}/refresh`,
      { refreshToken }
    );
    return response.data;
  },
};