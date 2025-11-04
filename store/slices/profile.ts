import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { ProfileResponse } from "@/types";

interface ProfileState {
  userProfile: ProfileResponse | null;
}

const initialState: ProfileState = {
  userProfile: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateUserProfile: (state, action: PayloadAction<ProfileResponse>) => {
      state.userProfile = action.payload;
    },
  },
});

export const { updateUserProfile } = profileSlice.actions;

export default profileSlice.reducer;

export function fetchUserProfile() {
  return async function (dispatch: Dispatch) {
    try {
      const resp = await promiseTracker(
        httpServerGet<ProfileResponse>(`/auth/profile`)
      );

      // resp.data is now directly the ProfileResponse object
      if (resp.data) {
        dispatch(updateUserProfile(resp.data));
        return resp.data;
      }

      return null;
    } catch {
      toaster.error("Failed to fetch user profile. Please try again later");
    }
  };
}
