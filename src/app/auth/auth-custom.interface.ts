import { User } from "../users/user.interface";



export interface LoginResponse {
  accessToken: string;
  user: User;
}

