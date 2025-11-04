/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import { Card } from "@/components/Card";
import Badge from "@/components/Badge";
import { httpServerGet } from "@/lib/api";
import { useAppSelector, useAppDispatch } from "@/hooks";
import toaster from "@/lib/toastify";
import { createWard, updateWard } from "@/lib/actions/wards";
import StoreProvider from "@/store/provider";
import { Plus, Search, Home, Users } from "lucide-react";
import MembersModal from "../Modal/MembersModal";
import FamiliesModal from "../Modal/FamiliesModal";
import MemberDetailModal from "../Modal/MemberDetailModal";
import CreateWardModal, {
  createWardSchema,
  CreateWardFormType,
} from "../Modal/CreateWardModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchWardsList,
  searchWards,
  clearSearchResults,
} from "@/store/slices/wards";
import {
  Ward,
  Family,
  Parishioner,
  ParishionersByFamilyResponse,
  FamiliesByWardResponse,
} from "@/types";

const WardsPageComp = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Get data from Redux store
  const {
    wardsList,
    currentPage,
    totalPages,
    totalRecords,
    isLoading,
    isSearching,
    searchResults,
  } = useAppSelector((state) => state.wards);

  const pageSize = 20;

  // Modal states
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showFamiliesModal, setShowFamiliesModal] = useState(false);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Parishioner | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWardForEdit, setSelectedWardForEdit] = useState<Ward | null>(
    null
  );

  // Families data for modal
  const [wardFamilies, setWardFamilies] = useState<Family[]>([]);
  const [isFetchingFamilies, setIsFetchingFamilies] = useState(false);

  // Members/Parishioners data for modal
  const [wardMembers, setWardMembers] = useState<Parishioner[]>([]);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);

  // Create ward form state
  const [isCreating, setIsCreating] = useState(false);

  // Get parish ID from user profile
  const profile = useAppSelector((state) => state.profile.userProfile);
  const parishId = Number(profile?.parish?.parish_id) ?? null;

  // React Hook Form for Create Ward Modal
  const createWardHookForm = useForm<CreateWardFormType>({
    resolver: zodResolver(createWardSchema),
    defaultValues: {
      parish_id: Number(parishId) || null,
      ward_name: "",
      ward_number: "",
      description: "",
      coordinator_id: null,
      area_coverage: "",
    },
  });

  const {
    reset: resetCreateWardForm,
    formState: { errors },
  } = createWardHookForm;
  console.log(errors);
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch wards from Redux when component mounts or page changes
  useEffect(() => {
    if (!parishId || debouncedSearchQuery) return;
    if (wardsList.length === 0) {
      dispatch(fetchWardsList(parishId, currentPage, pageSize));
    }
  }, [dispatch, parishId, currentPage, debouncedSearchQuery]);

  // Search wards using Redux
  useEffect(() => {
    if (!parishId) return;

    if (debouncedSearchQuery) {
      dispatch(searchWards(parishId, debouncedSearchQuery));
    } else {
      dispatch(clearSearchResults());
    }
  }, [dispatch, parishId, debouncedSearchQuery]);

  // Determine which wards to display
  const displayWards = debouncedSearchQuery ? searchResults : wardsList;

  // Filter only active wards
  const activeWards = displayWards.filter((ward) => ward.is_active);

  const handleNextPage = () => {
    if (currentPage < totalPages && parishId) {
      dispatch(fetchWardsList(parishId, currentPage + 1, pageSize));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && parishId) {
      dispatch(fetchWardsList(parishId, currentPage - 1, pageSize));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewMembers = async (ward: Ward) => {
    setSelectedWard(ward);
    setShowMembersModal(true);

    try {
      setIsFetchingMembers(true);
      setWardMembers([]);

      const familiesResponse = await httpServerGet<FamiliesByWardResponse>(
        `/families/ward/${ward.ward_id}`
      );

      let families: Family[] = [];
      if (familiesResponse.data) {
        if (Array.isArray(familiesResponse.data)) {
          families = familiesResponse.data;
        } else if (familiesResponse.data.data) {
          families = familiesResponse.data.data;
        }
      }

      const allParishioners: Parishioner[] = [];
      for (const family of families) {
        try {
          const parishionersResponse =
            await httpServerGet<ParishionersByFamilyResponse>(
              `/parishioners/family/${family.family_id}`
            );

          if (parishionersResponse.data) {
            if (Array.isArray(parishionersResponse.data)) {
              allParishioners.push(...parishionersResponse.data);
            } else if (parishionersResponse.data.data) {
              allParishioners.push(...parishionersResponse.data.data);
            }
          }
        } catch (error) {
          console.error(
            `Error fetching parishioners for family ${family.family_id}:`,
            error
          );
        }
      }

      setWardMembers(allParishioners);
    } catch (error) {
      toaster.error("Failed to fetch members for this ward");
      console.error("Error fetching ward members:", error);
      setWardMembers([]);
    } finally {
      setIsFetchingMembers(false);
    }
  };

  const handleViewFamilies = async (ward: Ward) => {
    setSelectedWard(ward);
    setShowFamiliesModal(true);

    try {
      setIsFetchingFamilies(true);
      setWardFamilies([]);

      const response = await httpServerGet<FamiliesByWardResponse>(
        `/families/ward/${ward.ward_id}`
      );

      if (response.data) {
        if (Array.isArray(response.data)) {
          setWardFamilies(response.data);
        } else if (response.data.data) {
          setWardFamilies(response.data.data);
        }
      }
    } catch (error) {
      toaster.error("Failed to fetch families for this ward");
      console.error("Error fetching ward families:", error);
      setWardFamilies([]);
    } finally {
      setIsFetchingFamilies(false);
    }
  };

  const handleViewMemberDetail = (member: Parishioner) => {
    setSelectedMember(member);
    setShowMemberDetailModal(true);
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleOpenCreateModal = (wardToEdit?: Ward) => {
    if (wardToEdit) {
      setSelectedWardForEdit(wardToEdit);
      resetCreateWardForm({
        parish_id: Number(wardToEdit.parish_id),
        ward_name: wardToEdit.ward_name,
        ward_number: wardToEdit.ward_number,
        description: wardToEdit.description || "",
        coordinator_id: wardToEdit.coordinator_id || null,
        area_coverage: wardToEdit.area_coverage || "",
      });
    } else {
      setSelectedWardForEdit(null);
      resetCreateWardForm({
        parish_id: parishId,
        ward_name: "",
        ward_number: "",
        description: "",
        coordinator_id: undefined,
        area_coverage: "",
      });
    }
    setShowCreateModal(true);
  };

  const handleCreateWard = async (data: CreateWardFormType) => {
    try {
      setIsCreating(true);
      let result;
      if (selectedWardForEdit) {
        result = await updateWard(selectedWardForEdit.ward_id, {
          ...data,
          ward_id: selectedWardForEdit.ward_id,
        });
      } else {
        result = await createWard(data);
      }

      if (result.success) {
        toaster.success(result.message);
        setShowCreateModal(false);
        setSelectedWardForEdit(null);
        // Refresh wards list using Redux
        if (parishId) {
          dispatch(fetchWardsList(parishId, 1, pageSize));
        }
      } else {
        toaster.error(result.error?.message || "Operation failed");
      }
    } catch (error) {
      toaster.error("An error occurred during the operation");
      console.error("Error creating/updating ward:", error);
    } finally {
      setIsCreating(false);
    }
  };
  console.log(parishId, "parishId");
  return (
    <div className="wards-page-content">
      <div className="page-header">
        <div>
          <h1>Wards</h1>
          <p>
            Manage parish wards and their coordinators (
            {debouncedSearchQuery
              ? `${activeWards.length} search results`
              : `${totalRecords} total wards`}
            )
          </p>
        </div>
        {parishId !== null && (
          <Button
            variant="primary"
            icon={<Plus />}
            onClick={() => handleOpenCreateModal()}
          >
            Add Ward
          </Button>
        )}
      </div>

      <div className="wards-controls-wrapper">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search wards by name, number, or area coverage..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {isSearching && <span className="search-loading">Searching...</span>}
        </div>
      </div>

      {isLoading && !debouncedSearchQuery && (
        <div className="loading-state">
          <p>Loading wards...</p>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="row g-4">
            {activeWards.map((ward) => (
              <div key={ward.ward_id} className="col-md-6">
                <Card className="ward-card">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div style={{ flex: 1 }}>
                      <h3 className="ward-title">
                        {ward.ward_name}
                        <Badge variant="outline" className="ms-2">
                          {ward.ward_number}
                        </Badge>
                      </h3>
                      <div className="ward-info">
                        {ward.description && (
                          <p className="ward-description">{ward.description}</p>
                        )}
                        {ward.area_coverage && (
                          <p>
                            <span>Area:</span> {ward.area_coverage}
                          </p>
                        )}
                        {ward.coordinator_id && (
                          <p>
                            <span>Coordinator ID:</span> {ward.coordinator_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ward-icon">
                      <Home />
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="stat-box">
                        <div className="stat-label">
                          <Home />
                          <span>Families</span>
                        </div>
                        <div className="stat-value">
                          {ward.total_families || 0}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-box">
                        <div className="stat-label">
                          <Users />
                          <span>Members</span>
                        </div>
                        <div className="stat-value">
                          {ward.total_members || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-fill"
                      onClick={() => handleViewFamilies(ward)}
                    >
                      View Families
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-fill"
                      onClick={() => handleViewMembers(ward)}
                    >
                      View Members
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleOpenCreateModal(ward)}
                    >
                      Edit
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {!debouncedSearchQuery && totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {!isLoading && !isSearching && activeWards.length === 0 && (
        <div className="no-results">
          <p>
            {debouncedSearchQuery
              ? "No wards found matching your search criteria."
              : "No active wards found."}
          </p>
        </div>
      )}

      <MembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        selectedWard={selectedWard}
        wardMembers={wardMembers}
        isFetchingMembers={isFetchingMembers}
        onViewMemberDetail={handleViewMemberDetail}
        calculateAge={calculateAge}
      />

      <FamiliesModal
        isOpen={showFamiliesModal}
        onClose={() => setShowFamiliesModal(false)}
        selectedWard={selectedWard}
        wardFamilies={wardFamilies}
        isFetchingFamilies={isFetchingFamilies}
      />

      <MemberDetailModal
        isOpen={showMemberDetailModal}
        onClose={() => setShowMemberDetailModal(false)}
        selectedMember={selectedMember}
        calculateAge={calculateAge}
      />

      <CreateWardModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedWardForEdit(null);
        }}
        hookForm={createWardHookForm}
        isCreating={isCreating}
        onSubmit={handleCreateWard}
        isEditMode={!!selectedWardForEdit}
      />
    </div>
  );
};

const WardsPage = () => {
  return (
    <StoreProvider>
      <WardsPageComp />
    </StoreProvider>
  );
};

export default WardsPage;
