import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { Parishioner } from "@/types";

interface ParishionersState {
  parishionersList: Parishioner[];
  isLoading: boolean;
}

const initialState: ParishionersState = {
  parishionersList: [],
  isLoading: false,
};

const parishionersSlice = createSlice({
  name: "parishioners",
  initialState,
  reducers: {
    setParishionersList: (state, action: PayloadAction<Parishioner[]>) => {
      state.parishionersList = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setParishionersList, setLoading } = parishionersSlice.actions;

export default parishionersSlice.reducer;

// Fetch parishioners by family ID
export function getParishionersByFamilyId(familyId: number) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));
      
      const resp = await promiseTracker(
        httpServerGet<Parishioner[]>(
          `/parishioners/family/${familyId}`
        )
      );
      console.log(resp.data)
      if (resp.data && resp.data) {
        dispatch(setParishionersList(resp.data));
        return resp.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch parishioners. Please try again later");
      console.error("Error fetching parishioners:", error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };
}
