
const AUTH = {
  AUTH_LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PARISH_REGISTER: "/parishes",
  GENERATE_REFRESH_TOKEN: "/auth/refresh-token",
  PROFILE: "/auth/profile",
};

const SUBSCRIPTIONS = {
  PLANS: "/subscriptions/plans",
  VERIFY_PAYMENT: "/subscriptions/verify-payment",
};

const ROLES = {
  PERMISSIONS: {
    ALL: "/roles/permissions/all",
    BY_ROLE: "/roles/:roleId/permissions",
    ASSIGN: "/roles/:roleId/permissions",
    UNASSIGN: "/roles/:roleId/permissions/:permissionId",
  },
  LIST: "/roles",
  CREATE: "/roles",
  UPDATE: "/roles/:roleId",
  DELETE: "/roles/:roleId",
  USER: {
    ASSIGN: "/roles/user/:userId/roles",
    UNASSIGN: "/roles/user/:userId/roles/:roleId",
  },
};

const FAMILIES = {
  LIST: "/families/parish/:parishId",
  SEARCH: "/families/parish/:parishId/search",
  ALL: "/families/parish/:parishId/all",
  BY_WARD: "/families/ward/:wardId",
  CREATE: "/families", // New endpoint for creating families
  GET_BY_ID: "/families/:id", // New endpoint for getting family by ID
  UPDATE: "/families/:id", // Endpoint for updating a family
};

const PRAYER_REQUESTS = {
  ACTIVE: "/prayer-requests/parish/:parishId/active",
  PAST: "/prayer-requests/parish/:parishId/past",
  APPROVE: "/prayer-requests/:prayerRequestId/approve",
  CLOSE: "/prayer-requests/:prayerRequestId/close",
  CREATE: "/prayer-requests",
};

const WARDS = {
  LIST: "/wards/parish/:parishId",
  GET_ALL_BY_PARISH: "/wards/parish", // Assuming this endpoint exists or will be created
  SEARCH: "/wards/parish/:parishId/search",
  CREATE: "/wards",
  UPDATE: "/wards",
};

const PARISHIONERS = {
  BY_FAMILY: "/parishioners/family/:familyId",
  CREATE: "/parishioners",
  UPDATE: "/parishioners/:id", // New endpoint for updating a parishioner
};
const PARISH = {
  LIST: "/parishes",
  DETAILS: (parishId: string) => `/parishes/${parishId}`,
};

const BIBLE = {
  BOOKS: (bibleId: string) => `/bible/bibles/${bibleId}/books`,
  CHAPTERS: (bibleId: string, bookId: string) => `/bible/bibles/${bibleId}/books/${bookId}/chapters`,
  CHAPTER_CONTENT: (bibleId: string, chapterId: string) => `/bible/bibles/${bibleId}/chapters/${chapterId}/verses`,
};

const AUDIOBOOKS = {
  LIST: "/audiobooks/parish/:parishId",
  SEARCH: "/audiobooks/parish/:parishId/search",
  CREATE: "/audiobooks",
  GET_BY_ID: "/audiobooks/:audiobookId",
  UPDATE: "/audiobooks/:audiobookId",
  DELETE: "/audiobooks/:audiobookId",
};

const ACCOUNTS = {
  // Categories
  CATEGORIES: {
    LIST: "/accounts/categories",
    CREATE: "/accounts/categories",
    BY_TYPE: "/accounts/categories/by-type",
    UPDATE: "/accounts/categories/:id",
    DELETE: "/accounts/categories/:id",
  },
  // Transactions
  CREATE: "/accounts",
  GET_BY_ID: "/accounts/:id",
  UPDATE: "/accounts/:id",
  DELETE: "/accounts/:id",
  // Parish transactions
  PARISH: {
    LIST: "/accounts/parish/:parishId",
    SUMMARY: "/accounts/parish/:parishId/summary",
    BY_TYPE: "/accounts/parish/:parishId/type",
    BY_DATE_RANGE: "/accounts/parish/:parishId/date-range",
    BY_CATEGORY: "/accounts/parish/:parishId/category",
    SEARCH: "/accounts/parish/:parishId/search",
    EXPORT_CSV: "/accounts/parish/:parishId/export-csv",
    IMPORT_CSV: "/accounts/parish/:parishId/import-csv",
  },
};

const USERS = {
  LIST: "/users",
  PARISH: {
    LIST: "roles/users/parish/:parishId",
  },
};

export const API_ENDPOINTS = {
  AUTH,
  SUBSCRIPTIONS,
  ROLES,
  FAMILIES,
  PRAYER_REQUESTS,
  WARDS,
  PARISHIONERS,
  PARISH,
  BIBLE,
  AUDIOBOOKS,
  ACCOUNTS,
  USERS
};
