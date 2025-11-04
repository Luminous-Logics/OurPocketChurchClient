/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"
import { API_ENDPOINTS } from "@/config/api";
import { httpPost, httpPut, httpDelete } from "@/lib/api/server";
import {
  Transaction,
  CreateTransactionRequestBody,
  UpdateTransactionRequestBody,
  AccountCategory,
  CreateCategoryRequestBody,
  UpdateCategoryRequestBody
} from "@/types";
import { handleErrors } from "@/utils/apiHelpers";

// ============================================
// TRANSACTION ACTIONS
// ============================================

/**
 * Create a new transaction
 */
export async function createTransaction(transactionData: CreateTransactionRequestBody) {
  try {
    const url = API_ENDPOINTS.ACCOUNTS.CREATE;
    const response = await httpPost<Transaction>(url, transactionData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(transactionId: number, transactionData: UpdateTransactionRequestBody) {
  try {
    const url = API_ENDPOINTS.ACCOUNTS.UPDATE.replace(":id", String(transactionId));
    const response = await httpPut<Transaction>(url, transactionData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: number) {
  try {
    const url = API_ENDPOINTS.ACCOUNTS.DELETE.replace(":id", String(transactionId));
    const response = await httpDelete<Transaction>(url);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

// ============================================
// CATEGORY ACTIONS
// ============================================

/**
 * Create a new category
 */
export async function createCategory(categoryData: CreateCategoryRequestBody) {
  try {
    const url = API_ENDPOINTS.ACCOUNTS.CATEGORIES.CREATE;
    const response = await httpPost<AccountCategory>(url, categoryData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(categoryId: number, categoryData: UpdateCategoryRequestBody) {
  try {
    const url = API_ENDPOINTS.ACCOUNTS.CATEGORIES.UPDATE.replace(":id", String(categoryId));
    const response = await httpPut<AccountCategory>(url, categoryData);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(categoryId: number) {
  try {
    const url = API_ENDPOINTS.ACCOUNTS.CATEGORIES.DELETE.replace(":id", String(categoryId));
    const response = await httpDelete<AccountCategory>(url);
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}

// ============================================
// CSV IMPORT
// ============================================

/**
 * Import transactions from CSV
 */
export async function importTransactionsCSV(parishId: number, csvData: string) {
  try {
    const url = API_ENDPOINTS.ACCOUNTS.PARISH.IMPORT_CSV.replace(":parishId", String(parishId));
    const response = await httpPost<any>(url, { csvData });
    return response.data;
  } catch (err) {
    throw handleErrors(err);
  }
}
