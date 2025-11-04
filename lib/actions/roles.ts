/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
import { API_ENDPOINTS } from "@/config/api";
import { httpPost, httpPut, httpDelete } from "@/lib/api/server";
import {
  Role,
  CreateRoleRequestBody,
  UpdateRoleRequestBody,
  AssignRoleRequestBody,
} from "@/types";
import { handleErrors } from "@/utils/apiHelpers";

// ============================================
// ROLE ACTIONS
// ============================================

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleRequestBody) {
  try {
    const url = API_ENDPOINTS.ROLES.CREATE;
    const response = await httpPost<Role>(url, data);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Update an existing role
 */
export async function updateRole(roleId: number, data: UpdateRoleRequestBody) {
  try {
    const url = API_ENDPOINTS.ROLES.UPDATE.replace(":roleId", String(roleId));
    const response = await httpPut<Role>(url, data);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: number) {
  try {
    const url = API_ENDPOINTS.ROLES.DELETE.replace(":roleId", String(roleId));
    const response = await httpDelete<Role>(url);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

// ============================================
// ROLE ASSIGNMENT ACTIONS
// ============================================

/**
 * Assign a role to a user
 * @param userId - The user ID to assign the role to
 * @param data - Role assignment data including role_id and optional expires_at
 */
export async function assignRole(userId: number, data: AssignRoleRequestBody) {
  try {
    const url = API_ENDPOINTS.ROLES.USER.ASSIGN.replace(":userId", String(userId));
    const response = await httpPost<any>(url, data);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Unassign a role from a user
 * @param userId - The user ID to unassign the role from
 * @param roleId - The role ID to unassign
 */
export async function unassignRole(userId: number, roleId: number) {
  try {
    const url = API_ENDPOINTS.ROLES.USER.UNASSIGN
      .replace(":userId", String(userId))
      .replace(":roleId", String(roleId));
    const response = await httpDelete<any>(url);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

// ============================================
// ROLE PERMISSION ACTIONS
// ============================================

/**
 * Assign a permission to a role
 * @param roleId - The role ID to assign the permission to
 * @param permissionId - The permission ID to assign
 */
export async function assignPermissionToRole(roleId: number, permissionId: number) {
  try {
    const url = API_ENDPOINTS.ROLES.PERMISSIONS.ASSIGN.replace(":roleId", String(roleId));
    const response = await httpPost<any>(url, { permission_id: permissionId });
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Unassign a permission from a role
 * @param roleId - The role ID to unassign the permission from
 * @param permissionId - The permission ID to unassign
 */
export async function unassignPermissionFromRole(roleId: number, permissionId: number) {
  try {
    const url = API_ENDPOINTS.ROLES.PERMISSIONS.UNASSIGN
      .replace(":roleId", String(roleId))
      .replace(":permissionId", String(permissionId));
    const response = await httpDelete<any>(url);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}
