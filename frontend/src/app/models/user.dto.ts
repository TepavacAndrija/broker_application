export type Role = 'MANAGER' | 'BROKER';

export interface UserDTO {
  id: string;
  name: string;
  role: Role;
}
