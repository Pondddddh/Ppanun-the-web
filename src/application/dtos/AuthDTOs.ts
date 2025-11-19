export interface RegisterUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  identifier: string; // email or username
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    credits: number;
    role: string;
  };
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  credits: number;
  role: string;
  createdAt: string;
  isBanned: boolean;
}
