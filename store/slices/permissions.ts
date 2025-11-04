import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { PermissionsResponse, Permission } from "@/types";

interface PermissionsState {
  allPermissions: Permission[];
  groupedPermissions: Record<string, Permission[]>;
  isLoaded: boolean;
}

const initialState: PermissionsState = {
  allPermissions: [],
  groupedPermissions: {},
  isLoaded: false,
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<PermissionsResponse>) => {
      state.allPermissions = action.payload.all;
      state.groupedPermissions = action.payload.grouped;
      state.isLoaded = true;
    },
    clearPermissions: (state) => {
      state.allPermissions = [];
      state.groupedPermissions = {};
      state.isLoaded = false;
    },
  },
});

export const { setPermissions, clearPermissions } = permissionsSlice.actions;

export default permissionsSlice.reducer;

export function fetchAllPermissions() {
  return async function (dispatch: Dispatch) {
    try {
      const resp = await promiseTracker(
        httpServerGet<PermissionsResponse>(`/roles/permissions`)
      );

      // resp.data is now directly the PermissionsResponse object
      if (resp.data) {
        dispatch(setPermissions(resp.data));
        return resp.data;
      }

      return null;
    } catch {
      toaster.error("Failed to fetch permissions. Please try again later");
    }
  };
}
