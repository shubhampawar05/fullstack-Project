export type UserRole =
  | "company_admin"
  | "hr_manager"
  | "recruiter"
  | "manager"
  | "employee";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string; // Required
  company?: {
    id: string;
    name: string;
    slug: string;
  };
  status: "active" | "inactive" | "pending";
  createdAt: string;
  employeeId?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  // For company admin signup
  companyName?: string;
  // For invitation-based signup
  token?: string;
}

export interface InvitationInfo {
  valid: boolean;
  invitation?: {
    email: string;
    role: UserRole;
    company: {
      id: string;
      name: string;
      slug: string;
    };
    expiresAt: string;
  };
  message?: string;
}
