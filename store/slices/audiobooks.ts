import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { Audiobook } from "@/types";

interface AudiobooksApiResponse {
  data?: Audiobook[];
  pagination?: {
    totalPages: number;
    totalRecords: number;
    currentPage: number;
    pageSize: number;
  };
}

interface SearchResponse {
  data: Audiobook[];
}

interface AudiobooksState {
  audiobooksList: Audiobook[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  isLoading: boolean;
  isSearching: boolean;
  searchResults: Audiobook[];
  audiobookDetails?: Audiobook | null;
}

const initialState: AudiobooksState = {
  audiobooksList: [],
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  isLoading: false,
  isSearching: false,
  searchResults: [],
  audiobookDetails: null,
};

const audiobooksSlice = createSlice({
  name: "audiobooks",
  initialState,
  reducers: {
    setAudiobooksList: (state, action: PayloadAction<Audiobook[]>) => {
      state.audiobooksList = action.payload;
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
    setSearchResults: (state, action: PayloadAction<Audiobook[]>) => {
      state.searchResults = action.payload;
    },
    setAudiobookDetails: (state, action: PayloadAction<Audiobook | null>) => {
      state.audiobookDetails = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
});

export const {
  setAudiobooksList,
  setPagination,
  setLoading,
  setSearching,
  setSearchResults,
  clearSearchResults,
  setAudiobookDetails
} = audiobooksSlice.actions;

export default audiobooksSlice.reducer;


export function getAudiobookDetailsById(audiobookId: string) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await promiseTracker(
        httpServerGet<Audiobook>(`/audiobooks/${audiobookId}`)
      );

      if (response.data) {
        dispatch(setAudiobookDetails(response.data));
        return response.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch audiobook details. Please try again later");
      console.error("Error fetching audiobook details:", error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };
}


// Fetch paginated audiobooks
export function fetchAudiobooksList(parishId: number, page: number = 1, limit: number = 20) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));

      const response = await promiseTracker(
        httpServerGet<AudiobooksApiResponse>(
          `/parish/${parishId}/audiobooks?page=${page}&limit=${limit}`
        )
      );

      if (response.data) {
        if (Array.isArray(response.data)) {
          dispatch(setAudiobooksList(response.data));
          dispatch(setPagination({
            currentPage: page,
            totalPages: 1,
            totalRecords: response.data.length,
          }));
        } else if (response.data.data) {
          dispatch(setAudiobooksList(response.data.data));
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
      toaster.error("Failed to fetch audiobooks. Please try again later");
      console.error("Error fetching audiobooks:", error);
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Search audiobooks
export function searchAudiobooks(parishId: number, query: string) {
  return async function (dispatch: Dispatch) {
    if (!query) {
      dispatch(clearSearchResults());
      return;
    }

    try {
      dispatch(setSearching(true));

      const response = await promiseTracker(
        httpServerGet<SearchResponse>(
          `/parish/${parishId}/audiobooks/search?q=${encodeURIComponent(query)}`
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
      console.error("Error searching audiobooks:", error);
      dispatch(setSearchResults([]));
      return null;
    } finally {
      dispatch(setSearching(false));
    }
  };
}
