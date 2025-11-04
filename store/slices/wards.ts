import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { Ward, WardsApiResponse, SearchResponse } from "@/types";

interface WardsState {
  wardsList: Ward[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  isLoading: boolean;
  isSearching: boolean;
  searchResults: Ward[];
}

const initialState: WardsState = {
  wardsList: [],
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  isLoading: false,
  isSearching: false,
  searchResults: [],
};

const wardsSlice = createSlice({
  name: "wards",
  initialState,
  reducers: {
    setWardsList: (state, action: PayloadAction<Ward[]>) => {
      state.wardsList = action.payload;
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
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Ward[]>) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
});

export const {
  setWardsList,
  setPagination,
  setLoading,
  setSearching,
  setSearchResults,
  clearSearchResults,
} = wardsSlice.actions;

export default wardsSlice.reducer;

// Fetch paginated wards
export function fetchWardsList(parishId?: number, page: number = 1, limit: number = 20) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));
      
      const resp = await promiseTracker(
        httpServerGet<WardsApiResponse>(
          `/wards/parish/${parishId}?page=${page}&limit=${limit}`
        )
      );

      if (resp.data) {
        if (Array.isArray(resp.data)) {
          dispatch(setWardsList(resp.data));
          dispatch(setPagination({
            currentPage: page,
            totalPages: 1,
            totalRecords: resp.data.length,
          }));
        } else if (resp.data.data) {
          dispatch(setWardsList(resp.data.data));
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
      toaster.error("Failed to fetch wards. Please try again later");
      console.error("Error fetching wards:", error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Search wards
export function searchWards(parishId: number, query: string) {
  return async function (dispatch: Dispatch) {
    if (!query) {
      dispatch(clearSearchResults());
      return;
    }

    try {
      dispatch(setSearching(true));
      
      const resp = await promiseTracker(
        httpServerGet<SearchResponse>(
          `/wards/parish/${parishId}/search?q=${encodeURIComponent(query)}`
        )
      );

      if (resp.data) {
        if (Array.isArray(resp.data)) {
          dispatch(setSearchResults(resp.data));
        } else if (resp.data.data) {
          dispatch(setSearchResults(resp.data.data));
        }
        return resp.data;
      }

      return null;
    } catch (error) {
      toaster.error("Search failed. Please try again");
      console.error("Error searching wards:", error);
      dispatch(setSearchResults([]));
      return null;
    } finally {
      dispatch(setSearching(false));
    }
  };
}

// Fetch all wards (no pagination)
export function fetchAllWards(parishId: number) {
  return async function (dispatch: Dispatch) {
    try {
      const resp = await promiseTracker(
        httpServerGet<Ward[]>(`/wards/parish/${parishId}/all`)
      );

      if (resp.data) {
        dispatch(setWardsList(resp.data));
        return resp.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch wards. Please try again later");
      console.error("Error fetching wards:", error);
      return null;
    }
  };
}