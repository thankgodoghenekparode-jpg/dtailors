export type UserRole = "TAILOR" | "VENDOR" | "EMPLOYER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  tailorProfile?: TailorProfile;
  vendorProfile?: VendorProfile;
  employerProfile?: EmployerProfile;
}

export interface TailorProfile {
  id: string;
  userId: string;
  user?: User;
  photo?: string;
  age?: number;
  gender?: string;
  yearsOfExperience?: number;
  specializations: string[];
  skills: string[];
  portfolio: string[];
  videos: string[];
  certificates: string[];
  languages: string[];
  availability?: string;
  expectedSalary?: number;
  bio?: string;
  location?: Record<string, string>;
  whatsapp?: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  rating?: number;
  reviewCount?: number;
}

export interface VendorProfile {
  id: string;
  userId: string;
  user?: User;
  businessName: string;
  logo?: string;
  about?: string;
  categories: string[];
  location?: Record<string, string>;
  deliveryOptions: string[];
  whatsapp?: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  verified?: boolean;
  products?: Product[];
  _count?: { products: number };
}

export interface EmployerProfile {
  id: string;
  userId: string;
  user?: User;
  companyName: string;
  logo?: string;
  about?: string;
  industry?: string;
  location?: Record<string, string>;
  whatsapp?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  jobs?: Job[];
  _count?: { jobs: number };
}

export interface Product {
  id: string;
  vendorId: string;
  vendor?: VendorProfile;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  images: string[];
  videos: string[];
  category: string;
  subcategory?: string;
  location?: Record<string, string>;
  deliveryOptions: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  employerId: string;
  employer?: EmployerProfile;
  title: string;
  description?: string;
  salary?: number;
  experienceRequired?: string;
  jobType: "FULL_TIME" | "PART_TIME" | "APPRENTICESHIP" | "INTERNSHIP";
  accommodation?: string;
  state?: string;
  city?: string;
  contactDetails?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  facebook?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewer?: User;
  reviewedId: string;
  reviewed?: User;
  productId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
