import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { BibleBook, BibleChapter, BibleChapterContent, BibleBooksResponse, BibleChaptersResponse, BibleChapterContentResponse } from "@/types";

interface BibleState {
  selectedBibleId: string;
  selectedBookId: string;
  selectedChapterId: string;
  books: BibleBook[];
  chapters: BibleChapter[];
  chapterContent: BibleChapterContent | null;
  loadingBooks: boolean;
  loadingChapters: boolean;
  loadingChapterContent: boolean;
}

const initialState: BibleState = {
  selectedBibleId: "",
  selectedBookId: "",
  selectedChapterId: "",
  books: [],
  chapters: [],
  chapterContent: null,
  loadingBooks: false,
  loadingChapters: false,
  loadingChapterContent: false,
};

const bibleSlice = createSlice({
  name: "bible",
  initialState,
  reducers: {
    setSelectedBibleId: (state, action: PayloadAction<string>) => {
      state.selectedBibleId = action.payload;
      // Reset dependent selections
      state.selectedBookId = "";
      state.selectedChapterId = "";
      state.books = [];
      state.chapters = [];
      state.chapterContent = null;
    },
    setSelectedBookId: (state, action: PayloadAction<string>) => {
      state.selectedBookId = action.payload;
      // Reset dependent selections
      state.selectedChapterId = "";
      state.chapters = [];
      state.chapterContent = null;
    },
    setSelectedChapterId: (state, action: PayloadAction<string>) => {
      state.selectedChapterId = action.payload;
      state.chapterContent = null;
    },
    setBooks: (state, action: PayloadAction<BibleBook[]>) => {
      state.books = action.payload;
    },
    setChapters: (state, action: PayloadAction<BibleChapter[]>) => {
      state.chapters = action.payload;
    },
    setChapterContent: (state, action: PayloadAction<BibleChapterContent | null>) => {
      state.chapterContent = action.payload;
    },
    setLoadingBooks: (state, action: PayloadAction<boolean>) => {
      state.loadingBooks = action.payload;
    },
    setLoadingChapters: (state, action: PayloadAction<boolean>) => {
      state.loadingChapters = action.payload;
    },
    setLoadingChapterContent: (state, action: PayloadAction<boolean>) => {
      state.loadingChapterContent = action.payload;
    },
    resetBibleState: () => initialState,
  },
});

export const {
  setSelectedBibleId,
  setSelectedBookId,
  setSelectedChapterId,
  setBooks,
  setChapters,
  setChapterContent,
  setLoadingBooks,
  setLoadingChapters,
  setLoadingChapterContent,
  resetBibleState,
} = bibleSlice.actions;

export default bibleSlice.reducer;

// Fetch books for a specific Bible
export function fetchBibleBooks(bibleId: string) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoadingBooks(true));

      const resp = await promiseTracker(
        httpServerGet<BibleBooksResponse>(
          `/bible/bibles/${bibleId}/books`
        )
      );

      if (resp.data) {
        if (Array.isArray(resp.data)) {
          dispatch(setBooks(resp.data));
        } else if (resp.data.data) {
          dispatch(setBooks(resp.data.data));
        }
        return resp.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch Bible books. Please try again later");
      console.error("Error fetching Bible books:", error);
      dispatch(setBooks([]));
      return null;
    } finally {
      dispatch(setLoadingBooks(false));
    }
  };
}

// Fetch chapters for a specific book
export function fetchBibleChapters(bibleId: string, bookId: string) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoadingChapters(true));

      const resp = await promiseTracker(
        httpServerGet<BibleChaptersResponse>(
          `/bible/bibles/${bibleId}/books/${bookId}/chapters`
        )
      );

      if (resp.data) {
        if (Array.isArray(resp.data)) {
          dispatch(setChapters(resp.data));
        } else if (resp.data.data) {
          dispatch(setChapters(resp.data.data));
        }
        return resp.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch chapters. Please try again later");
      console.error("Error fetching chapters:", error);
      dispatch(setChapters([]));
      return null;
    } finally {
      dispatch(setLoadingChapters(false));
    }
  };
}

// Fetch chapter content with full text
export function fetchBibleChapterContent(bibleId: string, chapterId: string) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoadingChapterContent(true));

      const resp = await promiseTracker(
        httpServerGet<BibleChapterContentResponse>(
          `/bible/bibles/${bibleId}/chapters/${chapterId}/verses`
        )
      );

      if (resp.data) {
        if (resp.data.data) {
          dispatch(setChapterContent(resp.data.data));
        } else {
          dispatch(setChapterContent(resp.data as unknown as BibleChapterContent));
        }
        return resp.data;
      }

      return null;
    } catch (error) {
      toaster.error("Failed to fetch chapter content. Please try again later");
      console.error("Error fetching chapter content:", error);
      dispatch(setChapterContent(null));
      return null;
    } finally {
      dispatch(setLoadingChapterContent(false));
    }
  };
}
