/* eslint-disable @typescript-eslint/no-explicit-any */
import toaster from "@/lib/toastify";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { Transaction, FinancialSummary, AccountCategory } from "@/types";

interface AccountsState {
  transactions: Transaction[];
  categories: AccountCategory[];
  summary: FinancialSummary | null;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  isLoading: boolean;
  isSummaryLoading: boolean;
}

const initialState: AccountsState = {
  transactions: [],
  categories: [],
  summary: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  isLoading: false,
  isSummaryLoading: false,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    setCategories: (state, action: PayloadAction<AccountCategory[]>) => {
      state.categories = action.payload;
    },
    setSummary: (state, action: PayloadAction<FinancialSummary>) => {
      state.summary = action.payload;
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
    setSummaryLoading: (state, action: PayloadAction<boolean>) => {
      state.isSummaryLoading = action.payload;
    },
  },
});

export const {
  setTransactions,
  setCategories,
  setSummary,
  setPagination,
  setLoading,
  setSummaryLoading,
} = accountsSlice.actions;

export default accountsSlice.reducer;

// Fetch transactions
export function fetchTransactions(parishId: number, page: number = 1, limit: number = 20) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setLoading(true));
      const response = await promiseTracker(
        httpServerGet<any>(`/parish/${parishId}/accounts?page=${page}&limit=${limit}`)
      );

      if (response.data) {
        const transactions = Array.isArray(response.data) ? response.data : response.data.data || [];
        dispatch(setTransactions(transactions));
        dispatch(setPagination({
          currentPage: page,
          totalPages: response.data.pagination?.totalPages || 1,
          totalRecords: response.data.pagination?.totalRecords || 0,
        }));
      }
    } catch (error) {
      toaster.error("Failed to fetch transactions");
      console.error("Error fetching transactions:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// Fetch financial summary
export function fetchFinancialSummary(parishId: number) {
  return async function (dispatch: Dispatch) {
    try {
      dispatch(setSummaryLoading(true));
      const response = await promiseTracker(
        httpServerGet<any>(`/parish/${parishId}/accounts/summary`)
      );

      if (response.data) {
        dispatch(setSummary(response.data));
      }
    } catch (error) {
      toaster.error("Failed to fetch financial summary");
      console.error("Error fetching summary:", error);
    } finally {
      dispatch(setSummaryLoading(false));
    }
  };
}

// Fetch categories
export function fetchCategories() {
  return async function (dispatch: Dispatch) {
    try {
      const response = await promiseTracker(
        httpServerGet<any>("/accounts/categories")
      );

      if (response.data) {
        const categories = Array.isArray(response.data) ? response.data : response.data.data || [];
        dispatch(setCategories(categories));
      }
    } catch (error) {
      toaster.error("Failed to fetch categories");
      console.error("Error fetching categories:", error);
    }
  };
}
