"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchTransactions,
  fetchFinancialSummary,
  fetchCategories,
} from "@/store/slices/accounts";
import {
  Download,
  Upload,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import Button from "@/components/Button";
import AddEntryModal, {
  AddEntryFormType,
  addEntrySchema,
} from "@/components/Modal/AddEntryModal";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/actions/accounts";
import { promiseTracker } from "@/lib/api";
import "./styles.scss";
import { Transaction, Permission } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks";
import StoreProvider from "@/store/provider";

const AccountsPageComp = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const {
    transactions,
    categories,
    summary,
    currentPage,
    totalPages,
    isLoading,
    isSummaryLoading,
  } = useAppSelector((state) => state.accounts);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    number | null
  >(null);

  const addEntryHookForm = useForm<AddEntryFormType>({
    resolver: zodResolver(addEntrySchema),
  });

  const parishId = profile?.userProfile?.parish?.parish_id;

  const canManageAccounts = profile?.userProfile?.permissions?.some(
    (permission: Permission) => permission.permission_code === "MANAGE_ACCOUNTS"
  );

  useEffect(() => {
    if (parishId) {
      dispatch(fetchTransactions(parishId, 1, 20));
      dispatch(fetchFinancialSummary(parishId));
      dispatch(fetchCategories());
    }
  }, [dispatch, parishId]);

  const handlePageChange = (page: number) => {
    if (parishId) {
      dispatch(fetchTransactions(parishId, page, 20));
    }
  };

  const handleCreateTransactionClick = () => {
    setEditingTransaction(null);
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  const handleEditTransactionClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleDeleteTransactionClick = (transactionId: number) => {
    setDeletingTransactionId(transactionId);
    setIsDeleteModalOpen(true);
  };

  const onAddEntrySubmit = async (data: AddEntryFormType) => {
    if (!parishId) return;

    setIsCreating(true);
    try {
      const transactionData = {
        parish_id: parishId,
        transaction_date: data.transaction_date,
        transaction_type: data.transaction_type.value as "income" | "expense",
        category_id: parseInt(data.category_id.value, 10),
        amount: parseFloat(data.amount),
        description: data.description,
        reference_number: data.reference_number || undefined,
        payment_method: (data.payment_method?.value || undefined) as
          | "cash"
          | "check"
          | "bank_transfer"
          | "credit_card"
          | "online"
          | "other"
          | undefined,
      };

      if (editingTransaction) {
        await promiseTracker(
          updateTransaction(editingTransaction.transaction_id, transactionData)
        );
      } else {
        await promiseTracker(createTransaction(transactionData));
      }

      setIsAddModalOpen(false);
      setEditingTransaction(null);
      setIsEditMode(false);
      dispatch(fetchTransactions(parishId, currentPage, 20));
      dispatch(fetchFinancialSummary(parishId));
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransactionId || !parishId) return;

    try {
      await promiseTracker(deleteTransaction(deletingTransactionId));
      setIsDeleteModalOpen(false);
      setDeletingTransactionId(null);
      dispatch(fetchTransactions(parishId, currentPage, 20));
      dispatch(fetchFinancialSummary(parishId));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="accounts-page">
      <div className="accounts-header">
        <div className="header-left">
          <h1>Accounts Management</h1>
        </div>
        <div className="header-right">
          {canManageAccounts && (
            <>
              <Button variant="secondary" onClick={() => {}}>
                <Download size={16} />
                Export CSV
              </Button>
              <Button variant="secondary" onClick={() => {}}>
                <Upload size={16} />
                Import CSV
              </Button>
              <Button variant="primary" onClick={handleCreateTransactionClick}>
                <Plus size={16} />
                Add Entry
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income-card">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <div className="card-label">Total Income</div>
            <div className="card-amount income">
              {isSummaryLoading
                ? "Loading..."
                : formatCurrency(summary?.total_income || 0)}
            </div>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-icon">
            <TrendingDown size={24} />
          </div>
          <div className="card-content">
            <div className="card-label">Total Expenses</div>
            <div className="card-amount expense">
              {isSummaryLoading
                ? "Loading..."
                : formatCurrency(summary?.total_expenses || 0)}
            </div>
          </div>
        </div>

        <div className="summary-card balance-card">
          <div className="card-icon">
            <Wallet size={24} />
          </div>
          <div className="card-content">
            <div className="card-label">Current Balance</div>
            <div className="card-amount balance">
              {isSummaryLoading
                ? "Loading..."
                : formatCurrency(summary?.current_balance || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="transactions-section">
        <div className="transactions-header">
          <h2>Transaction History</h2>
        </div>

        {isLoading ? (
          <div className="loading-state">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found</p>
            {canManageAccounts && (
              <Button variant="primary" onClick={handleCreateTransactionClick}>
                Add Your First Entry
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div
                  key={transaction.transaction_id}
                  className="transaction-item"
                >
                  <div className="transaction-main">
                    <div
                      className={`transaction-icon ${transaction.transaction_type}`}
                    >
                      {transaction.transaction_type === "income" ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-category">
                        {transaction.category_name || "Uncategorized"}
                      </div>
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                      <div className="transaction-meta">
                        <span className="transaction-date">
                          {formatDate(transaction.transaction_date)}
                        </span>
                        {transaction.reference_number && (
                          <>
                            <span className="meta-separator">•</span>
                            <span className="transaction-reference">
                              Ref: {transaction.reference_number}
                            </span>
                          </>
                        )}
                        {transaction.payment_method && (
                          <>
                            <span className="meta-separator">•</span>
                            <span className="transaction-payment">
                              {transaction.payment_method.replace("_", " ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="transaction-right">
                    <div
                      className={`transaction-amount ${transaction.transaction_type}`}
                    >
                      {transaction.transaction_type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    {canManageAccounts && (
                      <div className="transaction-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() =>
                            handleEditTransactionClick(transaction)
                          }
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() =>
                            handleDeleteTransactionClick(
                              transaction.transaction_id
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddEntryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
          setIsEditMode(false);
        }}
        hookForm={addEntryHookForm}
        isCreating={isCreating}
        onSubmit={onAddEntrySubmit}
        isEditMode={isEditMode}
        initialValues={editingTransaction}
        categories={categories}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTransactionId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
};

const AccountsPage = () => {
  return (
    <StoreProvider>
      <AccountsPageComp />
    </StoreProvider>
  );
};

export default AccountsPage;
