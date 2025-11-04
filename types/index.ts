// types/index.ts
/**
 * Parish Management System - Type Definitions
 */

// ============================================
// COMMON TYPES
// ============================================

export type SelectItem = {
  value: string;
  label: string;
};

// ============================================
// STANDARD API RESPONSE
// ============================================

/**
 * Standard success response for all API endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

// ============================================
// ERROR RESPONSE
// ============================================

/**
 * Standard error response for all API failures
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    code?: string;
  };
}

// ============================================
// AUTHENTICATION TYPES
// ============================================

/**
 * Login credentials
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Authentication response (login, register, refresh token)
 */
export interface AuthResponse {

    token: string;
    expires_in?: number;
    expires_at: string;
    user: {
      user_id: number;
      email: string;
      first_name: string;
      last_name: string;
      user_type: string; 
    };
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  user_type: "super_admin" | "church_admin" | "parishioner";
  parish_id: number;
}

// ============================================
// PARISH MANAGEMENT SPECIFIC TYPES
// ============================================

/**
 * User types in the Parish Management System
 */
export type UserType = "super_admin" | "church_admin" | "parishioner";

/**
 * User data for Parish Management System
 */
export interface ParishUser {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: UserType;
  phone_number?: string;
  profile_picture_url?: string;
  ward_id?: number;
  family_id?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Ward data
 */
export interface Ward {
  ward_id: number;
  parish_id: number;
  ward_name: string;
  ward_number: string;
  description?: string;
  coordinator_id?: string;
  area_coverage?: string;
  total_families?: number;
  total_members?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Family data
 */
export interface Family {
  family_id: number;
  parish_id: number;
  ward_id: number;
  family_name: string;
  head_of_family?: string;
  house_name?: string; // Added
  address_line1?: string; // Added address fields from primary contact
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  primary_contact_id?: number;
  home_phone?: string;
  contact_number?: string; // Added
  email?: string; // Added
  registration_date?: string;
  is_active: boolean;
  members?: Member[]; // Added
  created_at: string;
  updated_at: string;
}

/**
 * Response for fetching families list
 */
export interface FamiliesListResponse {
  data: Family[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

/**
 * Member data
 */
export interface Member {
  member_id: number;
  family_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  relationship?: string;
  occupation?: string; // Added
  place_of_birth?: string; // Added
  created_at?: string;
  updated_at?: string;
}
// ============================================
// PROFILE RESPONSE TYPES
// ============================================

/**
 * Profile API response wrapper
 */
export interface ProfileApiResponse {
  success: boolean;
  data: ProfileResponse;
}

/**
 * Complete response for fetching user profile data
 */
export interface ProfileResponse {
  user: ProfileUser;
  roles: Role[];
  permissions: Permission[];
  parish?: Parish | null;
  parishioner?: Parishioner | null;
  church_admin?: ChurchAdmin | null;
  ward?: Ward | null;
  family?: Family | null;
}

/**
 * User information for profile display
 */
export interface ProfileUser {
  user_id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_image_url?: string | null;
  user_type: "SUPER_ADMIN" | "CHURCH_ADMIN" | "PARISHIONER";
  is_active: boolean;
  email_verified: boolean;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Role details assigned to a user
 */
export interface Role {
  role_id: string | number;
  parish_id?: string | number | null;
  role_name: string;
  role_code: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  priority?: number;
  created_by?: string | number | null;
  created_at: string;
  updated_at: string;
  role_scope?: string | null;
  is_ward_role?: boolean | null;
}

/**
 * Permission object defining access capabilities
 */
export interface Permission {
  permission_id: string | number;
  permission_name: string;
  permission_code: string;
  description?: string;
  module: string;
  action: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Parish data
 */
export interface Parish {
  parish_id: number;
  parish_name: string;
  diocese: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website_url?: string;
  established_date?: string;
  patron_saint?: string;
  timezone?: string;
  subscription_plan?: string;
  subscription_expiry?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParishesApiResponse {
  data?: Parish[];
  pagination?: {
    totalPages: number;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
  };
}

/**
 * Parishioner-specific data
 */
export interface Parishioner {
  parishioner_id: string | number;
  user_id: string | number;
  parish_id?: string | number;
  family_id?: string | number | null;
  ward_id?: string | number | null;
  middle_name?: string;
  first_name?:string;
  last_name?:string;
  email?: string; // Added from Member
  phone?: string; // Added from Member
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  relationship?: string; // Added from Member
  occupation?: string;
  place_of_birth?: string; // Added from Member
  marital_status?: string;
  baptism_date?: string;
  first_communion_date?: string;
  confirmation_date?: string;
  marriage_date?: string;
  member_status?: string;
  photo_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  registration_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Church admin data
 */
export interface ChurchAdmin {
  admin_id: string | number;
  user_id: string | number;
  parish_id?: string | number | null;
  role?: string;
  assigned_date?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// PERMISSIONS RESPONSE TYPES
// ============================================

/**
 * Complete response for fetching all permissions
 */
export interface PermissionsResponse {
  all: Permission[];
  grouped: Record<string, Permission[]>;
}

// ============================================
// PRAYER REQUEST TYPES
// ============================================

/**
 * Prayer request status types
 */
export type PrayerRequestStatus = "pending" | "confirmed" | "completed" | "cancelled";

/**
 * Prayer request data
 */
export interface PrayerRequest {
  prayer_request_id: number;
  parish_id: number;
  requested_by: number;
  requester_name: string;
  subject: string;
  description: string;
  booking_date: string;
  booking_time: string;
  status: PrayerRequestStatus;
  is_anonymous: boolean;
  is_urgent: boolean;
  is_public: boolean;
  approved_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Response for fetching active prayer requests
 */
export interface ActivePrayerRequestsResponse {
  success: boolean;
  data: PrayerRequest[];
}

/**
 * Response for fetching past prayer requests
 */
export interface PastPrayerRequestsResponse {
  success: boolean;
  data: PrayerRequest[];
}

/**
 * Create prayer request data
 */
export interface CreatePrayerRequestData {
  parish_id: number;
  requester_name: string;
  subject: string;
  description: string;
  booking_date?: string;
  booking_time?: string;
  is_anonymous: boolean;
  is_urgent: boolean;
  is_public: boolean;
}

export interface WardsApiResponse {
  data?: Ward[];
  pagination?: {
    totalPages: number;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface SearchResponse {
  data: Ward[];
}

export interface FamiliesByWardResponse {
  data: Family[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface ParishionersByFamilyResponse {
  data: Parishioner[];
}

/**
 * Request body for creating a new parishioner
 */
export interface CreateParishionerRequestBody {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  profile_image_url?: string;
  parish_id: number;
  ward_id: number;
  family_id: number;
  middle_name?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  baptism_date?: string;
  first_communion_date?: string;
  confirmation_date?: string;
  marriage_date?: string;
  member_status?: string;
  photo_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  registration_date?: string;
}

/**
 * Response data for creating a new parishioner
 */
export interface ParishionerResponse {
  success: boolean;
  message: string;
  data: Parishioner;
}


export interface ParishResponse {
  success: boolean;
  message: string;
  data: ParishRes;
}
export interface ParishRes {
  parish_id: number;
  parish_name: string;
  diocese: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website_url?: string;
  established_date?: string;
  patron_saint?: string;
  timezone?: string;
  subscription_plan?: string;
  subscription_expiry?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin: {
    user_id: string;
    email: string;
    first_name:string;
    last_name: string;
    user_type: string;
    role: string;
    is_primary_admin: boolean;
  };
}

// ============================================
// AUDIOBOOK TYPES
// ============================================

/**
 * Language options for audiobooks
 */
export type AudiobookLanguage = "English" | "Spanish" | "Portuguese" | "French" | "German" | "Italian" | "Other";

/**
 * Audiobook data
 */
export interface Audiobook {
  audiobook_id: number;
  parish_id: number;
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  thumbnail_url?: string;
  audio_file_url: string;
  duration_minutes: string;
  file_size_mb?: string;
  category?: string;
  language: AudiobookLanguage;
  publication_year?: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

/**
 * Response for fetching audiobooks list
 */
export interface AudiobooksListResponse {
  data: Audiobook[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

/**
 * Create audiobook request body
 */
export interface CreateAudiobookRequestBody {
  parish_id: number;
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  thumbnail_url?: string;
  audio_file_url?: string;
  duration_minutes?: number;
  file_size_mb?: number;
  category?: string;
  language: AudiobookLanguage;
  publication_year?: number;
  created_by?: number;
}

/**
 * Update audiobook request body
 */
export interface UpdateAudiobookRequestBody {
  title?: string;
  author?: string;
  narrator?: string;
  description?: string;
  thumbnail_url?: string;
  audio_file_url?: string;
  duration_minutes?: number;
  file_size_mb?: number;
  category?: string;
  language?: AudiobookLanguage;
  publication_year?: number;
  is_active?: boolean;
}

/**
 * Audiobook response
 */
export interface AudiobookResponse {
  success: boolean;
  message: string;
  data: Audiobook;
}

// ============================================
// ACCOUNTS/TRANSACTIONS TYPES
// ============================================

/**
 * Transaction types
 */
export type TransactionType = "income" | "expense";

/**
 * Payment methods
 */
export type PaymentMethod = "cash" | "check" | "bank_transfer" | "credit_card" | "online" | "other";

/**
 * Account Category
 */
export interface AccountCategory {
  category_id: number;
  category_name: string;
  category_type: TransactionType;
  description?: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Transaction/Account Entry
 */
export interface Transaction {
  transaction_id: number;
  parish_id: number;
  transaction_date: string;
  transaction_type: TransactionType;
  category_id: number;
  category_name?: string; // Joined from category
  amount: number;
  description: string;
  reference_number?: string;
  payment_method?: PaymentMethod;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Financial Summary
 */
export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  current_balance: number;
}

/**
 * Create transaction request body
 */
export interface CreateTransactionRequestBody {
  parish_id: number;
  transaction_date: string;
  transaction_type: TransactionType;
  category_id: number;
  amount: number;
  description: string;
  reference_number?: string;
  payment_method?: PaymentMethod;
}

/**
 * Update transaction request body
 */
export interface UpdateTransactionRequestBody {
  transaction_date?: string;
  transaction_type?: TransactionType;
  category_id?: number;
  amount?: number;
  description?: string;
  reference_number?: string;
  payment_method?: PaymentMethod;
}

/**
 * Create category request body
 */
export interface CreateCategoryRequestBody {
  category_name: string;
  category_type: TransactionType;
  description?: string;
  is_system?: boolean;
}

/**
 * Update category request body
 */
export interface UpdateCategoryRequestBody {
  category_name?: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Transactions list response
 */
export interface TransactionsListResponse {
  data: Transaction[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

/**
 * Categories list response
 */
export interface CategoriesListResponse {
  data: AccountCategory[];
}

/**
 * Financial summary response
 */
export interface FinancialSummaryResponse {
  success: boolean;
  data: FinancialSummary;
}

// ============================================
// BIBLE API TYPES
// ============================================

/**
 * Bible book data
 */
export interface BibleBook {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
}

/**
 * Bible chapter data (list view)
 */
export interface BibleChapter {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  position: number;
}

/**
 * Bible chapter content (full chapter with text)
 */
export interface BibleChapterContent {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  reference: string;
  copyright: string;
  verseCount: number;
  content: string;
  next?: {
    id: string;
    number: string;
    bookId: string;
  };
  previous?: {
    id: string;
    number: string;
    bookId: string;
  };
}

/**
 * Response for fetching Bible books
 */
export interface BibleBooksResponse {
  data: BibleBook[];
}

/**
 * Response for fetching Bible chapters (list)
 */
export interface BibleChaptersResponse {
  data: BibleChapter[];
}

/**
 * Response for fetching a single chapter with content
 */
export interface BibleChapterContentResponse {
  data: BibleChapterContent;
  meta?: {
    fums: string;
    fumsId: string;
    fumsJsInclude: string;
    fumsJs: string;
    fumsNoScript: string;
  };
}

// ============================================
// ROLES MANAGEMENT TYPES
// ============================================

/**
 * Create role request body
 */
export interface CreateRoleRequestBody {
  role_name: string;
  role_code: string;
  description?: string;
  parish_id?: number;
  priority?: number;
}

/**
 * Update role request body
 */
export interface UpdateRoleRequestBody {
  role_name?: string;
  description?: string;
  priority?: number;
  is_active?: boolean;
}

/**
 * User role assignment details
 */
export interface UserRoleAssignment {
  role_id: number;
  role_name: string;
  role_code: string;
  description?: string;
  assigned_at: string;
  expires_at?: string;
}

/**
 * Assign role request body
 */
export interface AssignRoleRequestBody {
  role_id: number;
  expires_at?: string;
}

/**
 * Unassign role request body
 */
export interface UnassignRoleRequestBody {
  role_id: number;
}

/**
 * Assign permission to role request body
 */
export interface AssignPermissionRequestBody {
  permission_id: number;
}

/**
 * User with role assignment information
 */
export interface UserWithRole {
  user_id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_image_url?: string | null;
  user_type: string;
  is_active: boolean;
  email_verified: boolean;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
  church_admin_id?: string | null;
  admin_role?: string | null;
  admin_department?: string | null;
  is_primary_admin?: boolean | null;
  parishioner_id?: string | null;
  ward_id?: string | null;
  family_id?: string | null;
  ward_name?: string | null;
  family_name?: string | null;
  roles: UserRoleAssignment[];
}

/**
 * Roles list response
 */
export interface RolesListResponse {
  success: boolean;
  data: Role[];
}

/**
 * Users with roles list response
 */
export interface UsersWithRolesListResponse {
  success: boolean;
  data: UserWithRole[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}
