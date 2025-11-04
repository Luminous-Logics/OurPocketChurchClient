/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";

import Button from "../Button";
import { RootState } from "@/store";
import toaster from "@/lib/toastify";
import StoreProvider from "@/store/provider";
import { CreateChurchRequestBody } from "./Schema";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchParishesList } from "@/store/slices/church";
import CreateChurchModal from "../Modal/CreateChurchModal";
import ConfirmationModal from "../Modal/ConfirmationModal";
import { createParish, updateParish, deleteParish } from "@/lib/actions/church";
interface ModalState {
  isOpen: boolean;
  mode: "create" | "edit";
  data: CreateChurchRequestBody | null;
  isSubmitting: boolean;
}

interface DeleteState {
  isOpen: boolean;
  parishId: string | null;
  isDeleting: boolean;
}

interface StatItem {
  label: string;
  value: number;
  color: string;
}

// Extracted Stats Card Component
const StatCard = React.memo(({ stat }: { stat: StatItem }) => (
  <div className="stat-card">
    <p>{stat.label}</p>
    <p className={`stat-value ${stat.color}`}>{stat.value}</p>
  </div>
));
StatCard.displayName = "StatCard";

// Extracted Table Row Component
const ParishRow = React.memo(
  ({
    parish,
    isSuperAdmin,
    onEdit,
    onDelete,
  }: {
    parish: any;
    isSuperAdmin: boolean;
    onEdit: (parish: CreateChurchRequestBody) => void;
    onDelete: (parishId: string) => void;
  }) => (
    <tr>
      <td>{parish.parish_name}</td>
      <td>{parish.diocese}</td>
      <td>{parish.city}</td>
      <td>
        <div className="contact-info">
          <div>{parish.phone}</div>
          <div className="contact-email">{parish.email}</div>
        </div>
      </td>
      <td className="capitalize">{parish.subscription_plan}</td>
      <td>
        <span
          className={`status-badge ${
            parish.is_active ? "status-active" : "status-pending"
          }`}
        >
          {parish.is_active ? "Active" : "Pending"}
        </span>
      </td>
      <td>
        {new Date(parish.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td>
        <div className="action-buttons">
          <button
            className="action-button icon-button edit-button"
            onClick={() => onEdit(parish)}
            aria-label="Edit parish"
          >
            <Edit2 size={16} />
          </button>
          {isSuperAdmin && (
            <button
              className="action-button icon-button delete-button"
              onClick={() => onDelete(parish.parish_id)}
              aria-label="Delete parish"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
);
ParishRow.displayName = "ParishRow";

// Extracted Search Bar Component
const SearchBar = React.memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by parish name, diocese, or city..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
);
SearchBar.displayName = "SearchBar";

const ChurchComp = () => {
  const dispatch = useAppDispatch();
  const { parishesList } = useAppSelector((state) => state.church);
  const { userProfile } = useAppSelector((state: RootState) => state.profile);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "create",
    data: null,
    isSubmitting: false,
  });

  const [deleteState, setDeleteState] = useState<DeleteState>({
    isOpen: false,
    parishId: null,
    isDeleting: false,
  });

  const [isLoadingParishList, setIsLoadingParishList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized user role check
  const isSuperAdmin = useMemo(
    () => userProfile?.user.user_type === "SUPER_ADMIN",
    [userProfile?.user.user_type]
  );

  // Memoized stats calculation
  const stats = useMemo<StatItem[]>(() => {
    const total = parishesList?.length || 0;
    const active = parishesList?.filter((p) => p.is_active)?.length || 0;

    return [
      { label: "Total Parishes", value: total, color: "text-gray-800" },
      { label: "Active", value: active, color: "text-blue-600" },
      {
        label: "Pending Approval",
        value: total - active,
        color: "text-yellow-600",
      },
      { label: "Total Subscribers", value: total, color: "text-gray-800" },
    ];
  }, [parishesList]);

  // Memoized filtered parishes
  const filteredParishes = useMemo(() => {
    if (!searchQuery.trim()) return parishesList;

    const query = searchQuery.toLowerCase();
    return parishesList?.filter(
      (parish) =>
        parish.parish_name?.toLowerCase().includes(query) ||
        parish.diocese?.toLowerCase().includes(query) ||
        parish.city?.toLowerCase().includes(query)
    );
  }, [parishesList, searchQuery]);

  // Memoized callbacks
  const handleOpenCreateModal = useCallback(() => {
    setModalState({
      isOpen: true,
      mode: "create",
      data: null,
      isSubmitting: false,
    });
  }, []);

  const handleOpenEditModal = useCallback((parish: CreateChurchRequestBody) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      data: parish,
      isSubmitting: false,
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleSubmit = useCallback(
    async (data: any) => {
      setModalState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        const transformedData = {
          ...data,
          timezone: data.timezone?.value || "UTC",
          subscription_plan: data.subscription_plan?.value || "",
        };

        if (modalState.mode === "edit" && modalState.data?.parish_id) {
          await updateParish(modalState.data.parish_id, transformedData);
          toaster.success("Church updated successfully");
        } else {
          await createParish(transformedData);
          toaster.success("Church created successfully");
        }

        dispatch(fetchParishesList());
        setModalState({
          isOpen: false,
          mode: "create",
          data: null,
          isSubmitting: false,
        });
      } catch (error: any) {
        toaster.error(error.message || "Operation failed");
        setModalState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [modalState.mode, modalState.data, dispatch]
  );

  const handleOpenDeleteConfirmation = useCallback((parishId: string) => {
    setDeleteState({
      isOpen: true,
      parishId,
      isDeleting: false,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteState.parishId) return;

    setDeleteState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await deleteParish(deleteState.parishId);
      toaster.success("Parish deleted successfully");
      dispatch(fetchParishesList());
      setDeleteState({ isOpen: false, parishId: null, isDeleting: false });
    } catch (error: any) {
      toaster.error(error.message || "Failed to delete parish");
      setDeleteState((prev) => ({ ...prev, isDeleting: false }));
    }
  }, [deleteState.parishId, dispatch]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Fetch parishes on mount
  useEffect(() => {
    const fetchParishList = async () => {
      setIsLoadingParishList(true);
      await dispatch(fetchParishesList());
      setIsLoadingParishList(false);
    };

    fetchParishList();
  }, [dispatch]);

  return (
    <div className="church-management-container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>Church Management</h1>
          <p>Manage parish registrations and approve new church requests</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleOpenCreateModal}
        >
          Add Church
        </Button>
      </div>

      {/* Modal */}
      <CreateChurchModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        isCreating={modalState.isSubmitting}
        onSubmit={handleSubmit}
        initialValues={modalState.data}
        isEditMode={modalState.mode === "edit"}
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Search Bar */}
      <SearchBar value={searchQuery} onChange={handleSearchChange} />

      {/* Table */}
      <div className="table-container">
        {isLoadingParishList ? (
          <p className="text-center py-4">Loading parishes...</p>
        ) : filteredParishes && filteredParishes.length > 0 ? (
          <table className="church-table">
            <thead>
              <tr>
                <th>Parish Name</th>
                <th>Diocese</th>
                <th>City</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParishes.map((parish: any) => (
                <ParishRow
                  key={parish.parish_id}
                  parish={parish}
                  isSuperAdmin={isSuperAdmin}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteConfirmation}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-4 text-gray-500">
            {searchQuery
              ? "No parishes match your search."
              : "No parishes found."}
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() =>
          setDeleteState({ isOpen: false, parishId: null, isDeleting: false })
        }
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to soft delete this parish? This action cannot be undone."
        isLoading={deleteState.isDeleting}
      />
    </div>
  );
};

const Church = () => {
  return (
    <StoreProvider>
      <ChurchComp />
    </StoreProvider>
  );
};

export default Church;
