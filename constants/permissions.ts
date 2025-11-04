// constants/permissions.ts
import { Permission } from "@/types";

/**
 * Menu key to module mapping
 * Maps sidebar menu keys to their corresponding backend permission modules
 * IMPORTANT: Module names must match EXACTLY with the "module" field in permissions
 */
export const MENU_MODULE_MAPPING: Record<string, string | string[]> = {
  dashboard: [], // Public - no permissions needed
  families: "Families", // Changed from "family" to "Families"
  wards: "Wards", // Changed from "ward" to "Wards"
  "prayer-requests": "Prayers", // Changed from "prayers" to "Prayers"
  events: "Events",
  posts: "Announcements", // You might need to verify this module name
  communities: "Families", // Changed from "family" to "Families"
  calendar: "Events",
  notifications: [], // Public - no permissions needed
  sacraments: "Families", // Changed from "family" to "Families"
  certificates: "Families", // Changed from "family" to "Families"
  "class-management": "Users",
  announcements: "Announcements",
  bible: [], // Public - no permissions needed
  audiobooks: "Audiobooks", // Audio Books menu
  "audio-books": "Audiobooks", // Audio Books menu (alternate path)
  accounts: "Accounts", // Accounts/Transactions menu
  donations: "Accounting", // Changed from "donations" - verify your actual module name
  family: "Families", // Changed from "family" to "Families"
  parish: "Parishes", // Changed from "parish" to "Parishes"
  prayers: "Prayers", // Changed from "prayers" to "Prayers"
  roles: "Roles",
  users: "Users",
  ward: "Wards", // Changed from "ward" to "Wards"
  "church-management": "Parishes", // This is correct - matches "Parishes" module
};

export type MenuKey = keyof typeof MENU_MODULE_MAPPING;

/**
 * Generate sidebar menu permissions from grouped permissions data
 * @param groupedPermissions - Permissions grouped by module from API
 * @returns Map of menu keys to permission codes
 */
export function generateMenuPermissions(
  groupedPermissions: Record<string, Permission[]>
): Record<string, string[]> {
  const menuPermissions: Record<string, string[]> = {};

  Object.entries(MENU_MODULE_MAPPING).forEach(([menuKey, modules]) => {
    if (Array.isArray(modules) && modules.length === 0) {
      // Public menu - no permissions required
      menuPermissions[menuKey] = [];
    } else if (typeof modules === "string") {
      // Single module
      const permissions = groupedPermissions[modules] || [];
      menuPermissions[menuKey] = permissions
        .filter((p) => p.action === "read" || p.action === "manage" || p.action === "view")
        .map((p) => p.permission_code);
    } else if (Array.isArray(modules)) {
      // Multiple modules
      const permissionCodes: string[] = [];
      modules.forEach((module) => {
        const permissions = groupedPermissions[module] || [];
        permissionCodes.push(
          ...permissions
            .filter((p) => p.action === "read" || p.action === "manage" || p.action === "view")
            .map((p) => p.permission_code)
        );
      });
      menuPermissions[menuKey] = permissionCodes;
    }
  });

  return menuPermissions;
}

/**
 * Check if user has any of the required permissions
 * @param requiredPermissions - Array of permission codes required for access
 * @param userPermissions - User's permissions from profile
 * @returns true if user has at least one of the required permissions, or if no permissions required
 */
export function hasAnyPermission(
  requiredPermissions: readonly string[],
  userPermissions: Permission[]
): boolean {
  // If no permissions required, menu is public
  if (requiredPermissions.length === 0) return true;

  // Extract permission codes from user's permissions
  const userPermissionCodes = userPermissions.map((p) => p.permission_code);

  // Check if user has any of the required permissions
  return requiredPermissions.some((perm) =>
    userPermissionCodes.includes(perm)
  );
}

/**
 * Check if user has all required permissions
 * @param requiredPermissions - Array of permission codes required for access
 * @param userPermissions - User's permissions from profile
 * @returns true if user has all required permissions
 */
export function hasAllPermissions(
  requiredPermissions: readonly string[],
  userPermissions: Permission[]
): boolean {
  if (requiredPermissions.length === 0) return true;

  const userPermissionCodes = userPermissions.map((p) => p.permission_code);

  return requiredPermissions.every((perm) =>
    userPermissionCodes.includes(perm)
  );
}

/**
 * Check if user has a specific permission
 * @param permissionCode - Permission code to check
 * @param userPermissions - User's permissions from profile
 * @returns true if user has the permission
 */
export function hasPermission(
  permissionCode: string,
  userPermissions: Permission[]
): boolean {
  return userPermissions.some((p) => p.permission_code === permissionCode);
}