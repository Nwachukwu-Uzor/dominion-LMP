export type AdminType = {
  id: string | number;
  email: string;
  date?: string;
  role: string | string[];
  status: string;
  userName?: string;
  createdAt?: string;
  updatedAt?: string;
  ip_address?: string[];
  fullName?: string;
};
