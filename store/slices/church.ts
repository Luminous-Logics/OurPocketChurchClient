import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { Parish, ParishesApiResponse } from "@/types";

interface ChurchState {
  parishesList: Parish[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  isLoading: boolean;
}

const initialState: ChurchState = {
  parishesList: [],
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  isLoading: false,
};

const churchSlice = createSlice({
  name: "church",
  initialState,
  reducers: {
    setParishesList: (state, action: PayloadAction<Parish[]>) => {
      state.parishesList = action.payload;
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
  },
});

export const { setParishesList, setPagination, setLoading } = churchSlice.actions;

export default churchSlice.reducer;

// Fetch paginated parishes
export function fetchParishesList(page: number = 1, limit: number = 20) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));
      
      const resp = await promiseTracker(
        httpServerGet<ParishesApiResponse>(
          `/parishes?page=${page}&limit=${limit}`
        )
      );

      if (resp.data) {
        if (Array.isArray(resp.data)) {
          dispatch(setParishesList(resp.data));
          dispatch(setPagination({
            currentPage: page,
            totalPages: 1,
            totalRecords: resp.data.length,
          }));
        } else if (resp.data.data) {
          dispatch(setParishesList(resp.data.data));
          dispatch(setPagination({
            currentPage: page,
            totalPages: resp.data.pagination?.totalPages || 1,
            totalRecords: resp.data.pagination?.totalRecords || 0,
          }));
        }
        return resp.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch parishes. Please try again later");
      console.error("Error fetching parishes:", error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };
}
