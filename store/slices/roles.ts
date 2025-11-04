/* eslint-disable @typescript-eslint/no-explicit-any */
import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { Role, UserWithRole } from "@/types";

interface RolesState {
  roles: Role[];
  usersWithRoles: UserWithRole[];
  isLoading: boolean;
  isUsersLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

const initialState: RolesState = {
  roles: [],
  usersWithRoles: [],
  isLoading: false,
  isUsersLoading: false,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
};

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
    setUsersWithRoles: (state, action: PayloadAction<UserWithRole[]>) => {
      state.usersWithRoles = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<{
        currentPage: number;
        totalPages: number;
        totalRecords: number;
      }>
    ) => {
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.totalRecords = action.payload.totalRecords;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.isUsersLoading = action.payload;
    },
  },
});

export const {
  setRoles,
  setUsersWithRoles,
  setPagination,
  setLoading,
  setUsersLoading,
} = rolesSlice.actions;

export default rolesSlice.reducer;

// Fetch all roles
export function fetchRoles(parishId?: number) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));
      const url = parishId ? `/roles?parishId=${parishId}` : `/roles`;
      const response = await promiseTracker(httpServerGet<any>(url));

      if (response.data) {
        const roles = Array.isArray(response.data) ? response.data : response.data.data || [];
        dispatch(setRoles(roles));
      }
    } catch (error) {
      toaster.error("Failed to fetch roles");
      console.error("Error fetching roles:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Fetch users with their assigned roles
export function fetchUsersWithRoles(parishId?: number, page: number = 1, pageSize: number = 20) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setUsersLoading(true));
      // Note: Update this endpoint when the backend API is available
      const url = parishId
        ? `/parish/${parishId}/users?page=${page}&pageSize=${pageSize}`
        : `/users?page=${page}&pageSize=${pageSize}`;

      const response = await promiseTracker(httpServerGet<any>(url));

      if (response.data) {
        const users = Array.isArray(response.data) ? response.data : response.data.data || [];
        dispatch(setUsersWithRoles(users));
        dispatch(setPagination({
          currentPage: page,
          totalPages: response.data.pagination?.totalPages || 1,
          totalRecords: response.data.pagination?.totalRecords || 0,
        }));
      }
    } catch (error) {
      toaster.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      dispatch(setUsersLoading(false));
    }
  };
}
