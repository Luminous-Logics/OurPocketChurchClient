import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { Family } from "@/types";

interface FamiliesApiResponse {
  data?: Family[];
  pagination?: {
    totalPages: number;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
  };
}

interface SearchResponse {
  data: Family[];
}

interface FamiliesState {
  familiesList: Family[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  isLoading: boolean;
  isSearching: boolean;
  searchResults: Family[];
  familyDetails?: Family | null;
}

const initialState: FamiliesState = {
  familiesList: [],
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  isLoading: false,
  isSearching: false,
  searchResults: [],
  familyDetails: null,
};

const familiesSlice = createSlice({
  name: "families",
  initialState,
  reducers: {
    setFamiliesList: (state, action: PayloadAction<Family[]>) => {
      state.familiesList = action.payload;
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
    setSearchResults: (state, action: PayloadAction<Family[]>) => {
      state.searchResults = action.payload;
    },
    setFamilyDetails: (state, action: PayloadAction<Family | null>) => {
      state.familyDetails = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
});

export const {
  setFamiliesList,
  setPagination,
  setLoading,
  setSearching,
  setSearchResults,
  clearSearchResults,
  setFamilyDetails
} = familiesSlice.actions;

export default familiesSlice.reducer;


export function getFamilyDetailsById(familyId: string) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));   
      const response = await promiseTracker(
        httpServerGet<Family>(`/families/${familyId}`)
      );

      if (response.data) {
        dispatch(setFamilyDetails(response.data));
        return response.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch family details. Please try again later");
      console.error("Error fetching family details:", error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };
}


// Fetch paginated families
export function fetchFamiliesList(parishId: number, page: number = 1, limit: number = 20) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));
      
      const response = await promiseTracker(
        httpServerGet<FamiliesApiResponse>(
          `/parish/${parishId}/families?page=${page}&limit=${limit}`
        )
      );

      if (response.data) {
        if (Array.isArray(response.data)) {
          dispatch(setFamiliesList(response.data));
          dispatch(setPagination({
            currentPage: page,
            totalPages: 1,
            totalRecords: response.data.length,
          }));
        } else if (response.data.data) {
          dispatch(setFamiliesList(response.data.data));
          dispatch(setPagination({
            currentPage: page,
            totalPages: response.data.pagination?.totalPages || 1,
            totalRecords: response.data.pagination?.totalRecords || 0,
          }));
        }
        return response.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch families. Please try again later");
      console.error("Error fetching families:", error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Search families
export function searchFamilies(parishId: number, query: string) {
  return async function (dispatch: Dispatch) {
    if (!query) {
      dispatch(clearSearchResults());
      return;
    }

    try {
      dispatch(setSearching(true));
      
      const response = await promiseTracker(
        httpServerGet<SearchResponse>(
          `/parish/${parishId}/families/search?q=${encodeURIComponent(query)}`
        )
      );

      if (response.data) {
        if (Array.isArray(response.data)) {
          dispatch(setSearchResults(response.data));
        } else if (response.data.data) {
          dispatch(setSearchResults(response.data.data));
        }
        return response.data;
      }

      return null;
    } catch (error) {
      toaster.error("Search failed. Please try again");
      console.error("Error searching families:", error);
      dispatch(setSearchResults([]));
      return null;
    } finally {
      dispatch(setSearching(false));
    }
  };
}
