export interface UserDto {
  id: string;
  name: string;
  email: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterUserDto {
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Password?: string;
  ConfirmPassword?: string;
}