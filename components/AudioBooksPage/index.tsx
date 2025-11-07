/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import { Card } from "@/components/Card";
import Badge from "@/components/Badge";
import { promiseTracker } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/hooks";
import toaster from "@/lib/toastify";
import StoreProvider from "@/store/provider";
import { Plus, BookOpen, Edit2, Trash2, Filter, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AddAudiobookModal, {
  addAudiobookSchema,
  AddAudiobookFormType,
} from "@/components/Modal/AddAudiobookModal";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import {
  createAudiobook,
  updateAudiobook,
  deleteAudiobook,
} from "@/lib/actions/audiobooks";
import { httpServerGet } from "@/lib/api";
import {
  fetchAudiobooksList,
  searchAudiobooks,
  clearSearchResults,
} from "@/store/slices/audiobooks";
import { Audiobook } from "@/types";
import "./styles.scss";

const AudioBooksPageComp = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [isAddAudiobookModalOpen, setIsAddAudiobookModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreatingAudiobook, setIsCreatingAudiobook] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAudiobook, setEditingAudiobook] = useState<Audiobook | null>(
    null
  );
  const [deletingAudiobook, setDeletingAudiobook] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const profile = useAppSelector((state) => state.profile.userProfile);

  // Check if user has permission to manage audiobooks
  const canManageAudiobooks = profile?.permissions?.some(
    (permission) => permission.permission_code === "MANAGE_AUDIOBOOKS"
  );

  // Get data from Redux store
  const {
    audiobooksList,
    currentPage,
    totalPages,
    totalRecords,
    isLoading,
    isSearching,
    searchResults,
  } = useAppSelector((state) => state.audiobooks);

  const pageSize = 20;
  const parishId = Number(profile?.parish?.parish_id);

  const addAudiobookHookForm = useForm<AddAudiobookFormType>({
    resolver: zodResolver(addAudiobookSchema),
    defaultValues: {
      parish_id: Number(parishId),
      title: "",
      author: "",
      narrator: "",
      description: "",
      thumbnail_url: "",
      audio_file_url: "",
      duration_minutes: "",
      file_size_mb: "",
      category: "",
      language: { label: "", value: "" },
      publication_year: "",
    },
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch audiobooks from Redux
  useEffect(() => {
    if (!parishId || debouncedSearchQuery) return;
    if (audiobooksList.length === 0) {
      dispatch(fetchAudiobooksList(Number(parishId), currentPage, pageSize));
    }
  }, [dispatch, parishId, currentPage, debouncedSearchQuery]);

  // Search audiobooks using Redux
  useEffect(() => {
    if (!parishId) return;

    if (debouncedSearchQuery) {
      dispatch(searchAudiobooks(Number(parishId), debouncedSearchQuery));
    } else {
      dispatch(clearSearchResults());
    }
  }, [dispatch, parishId, debouncedSearchQuery]);

  const displayAudiobooks = debouncedSearchQuery
    ? searchResults
    : audiobooksList;

  const filteredAudiobooks = displayAudiobooks.filter((audiobook) => {
    const matchesLanguage =
      selectedLanguage === "all" || audiobook.language === selectedLanguage;
    return matchesLanguage;
  });

  const languages = Array.from(
    new Set(displayAudiobooks.map((a) => a.language))
  ).sort();

  const handleNextPage = () => {
    if (currentPage < totalPages && parishId) {
      dispatch(
        fetchAudiobooksList(Number(parishId), currentPage + 1, pageSize)
      );
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && parishId) {
      dispatch(
        fetchAudiobooksList(Number(parishId), currentPage - 1, pageSize)
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateAudiobookClick = () => {
    setIsEditMode(false);
    setEditingAudiobook(null);
    addAudiobookHookForm.reset({
      parish_id: Number(parishId),
      title: "",
      author: "",
      narrator: "",
      description: "",
      thumbnail_url: "",
      audio_file_url: "",
      duration_minutes: "",
      file_size_mb: "",
      category: "",
      language: { label: "", value: "" },
      publication_year: "",
    });
    setIsAddAudiobookModalOpen(true);
  };

  const handleEditAudiobookClick = async (audiobookId: number) => {
    setIsEditMode(true);
    setIsAddAudiobookModalOpen(true);
    try {
      const response = await promiseTracker(
        httpServerGet<Audiobook>(`/audiobooks/${audiobookId}`)
      );
      if (response.data) {
        setEditingAudiobook(response.data);
      } else {
        toaster.error("Failed to fetch audiobook details for editing.");
        setIsAddAudiobookModalOpen(false);
      }
    } catch (error) {
      toaster.error("Failed to fetch audiobook details. Please try again.");
      console.error("Error fetching audiobook:", error);
      setIsAddAudiobookModalOpen(false);
    }
  };

  const handleDeleteAudiobookClick = (audiobookId: number, title: string) => {
    setDeletingAudiobook({ id: audiobookId, title });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAudiobook) return;

    try {
      await promiseTracker(deleteAudiobook(deletingAudiobook.id));
      toaster.success("Audiobook deleted successfully!");
      dispatch(fetchAudiobooksList(Number(parishId), 1, pageSize));
      setIsDeleteModalOpen(false);
      setDeletingAudiobook(null);
    } catch (error) {
      toaster.error("Failed to delete audiobook. Please try again.");
      console.error("Error deleting audiobook:", error);
    }
  };

  const onAddAudiobookSubmit = async (data: AddAudiobookFormType) => {
    setIsCreatingAudiobook(true);
    try {
      // Convert string form values to numbers before sending to API
      const audiobookData = {
        parish_id: Number(parishId),
        title: data.title,
        author: data.author,
        narrator: data.narrator || undefined,
        description: data.description || undefined,
        thumbnail_url: data.thumbnail_url || undefined,
        audio_file_url: data.audio_file_url || undefined,
        duration_minutes: data.duration_minutes
          ? parseInt(data.duration_minutes, 10)
          : undefined,
        file_size_mb: data.file_size_mb
          ? parseFloat(data.file_size_mb)
          : undefined,
        category: data.category || undefined,
        language: data.language.value as
          | "English"
          | "Spanish"
          | "Portuguese"
          | "French"
          | "German"
          | "Italian"
          | "Other",
        publication_year: data.publication_year
          ? parseInt(data.publication_year, 10)
          : undefined,
      };

      if (isEditMode && editingAudiobook) {
        await promiseTracker(
          updateAudiobook(editingAudiobook.audiobook_id, audiobookData)
        );
        toaster.success("Audiobook updated successfully!");
      } else {
        await promiseTracker(createAudiobook(audiobookData));
        toaster.success("Audiobook created successfully!");
      }

      setIsAddAudiobookModalOpen(false);
      setEditingAudiobook(null);
      setIsEditMode(false);
      dispatch(fetchAudiobooksList(Number(parishId), 1, pageSize));
    } catch (error) {
      toaster.error(
        `Failed to ${
          isEditMode ? "update" : "create"
        } audiobook. Please try again.`
      );
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} audiobook:`,
        error
      );
    } finally {
      setIsCreatingAudiobook(false);
    }
  };

  return (
    <div className="audiobooks-page-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Audio Book Library</h1>
          <div className="subtitle-with-info">
            <p>
              Listen to spiritual books selected by the parish (
              {debouncedSearchQuery
                ? `${filteredAudiobooks.length} search results`
                : `${totalRecords} total audiobooks`}
              )
            </p>
            <div
              className="info-tooltip"
              title="Audiobooks provide spiritual nourishment through literature, available anytime for parish members"
            >
              <Info size={16} />
            </div>
          </div>
        </div>
        {canManageAudiobooks && (
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleCreateAudiobookClick}
          >
            Add Audiobook
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="audiobooks-controls-wrapper">
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
            placeholder="Search by title, author, or category..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {isSearching && <span className="search-loading">Searching...</span>}
        </div>
        <div className="filter-controls">
          <Filter size={18} className="filter-icon" />
          <select
            className="filter-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            aria-label="Filter by language"
          >
            <option value="all">All Languages</option>
            {languages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !debouncedSearchQuery && (
        <div className="loading-state">
          <p>Loading audiobooks...</p>
        </div>
      )}

      {/* Audiobooks Grid */}
      {!isLoading && (
        <>
          <div className="row g-4">
            {filteredAudiobooks.map((audiobook) => (
              <div key={audiobook.audiobook_id} className="col-md-6 col-lg-6">
                <Card className="audiobook-card">
                <div className="audiobook-card-content">
                  <div className="audiobook-icon">
                    <BookOpen size={32} />
                  </div>
                  <div className="audiobook-info">
                    <h3 className="audiobook-title">{audiobook.title}</h3>
                    <p className="audiobook-author">{audiobook.author}</p>
                    <div className="audiobook-meta-row">
                      <span className="audiobook-duration">
                        {audiobook.duration_minutes}
                      </span>
                      {audiobook.category && (
                        <Badge variant="primary" className="category-badge">
                          {audiobook.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="audiobook-card-footer">
                  <Button
                    variant="ghost"
                    className="play-button"
                    onClick={() =>
                      window.open(audiobook.audio_file_url, "_blank")
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Play
                  </Button>
                  <Button
                    variant="outline"
                    className="details-button"
                    onClick={() => {
                      toaster.success("View audiobook details");
                    }}
                  >
                    Details
                  </Button>
                  {canManageAudiobooks && (
                    <div className="action-icons">
                      <button
                        className="icon-button edit-button"
                        onClick={() =>
                          handleEditAudiobookClick(audiobook.audiobook_id)
                        }
                        title="Edit audiobook"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-button delete-button"
                        onClick={() =>
                          handleDeleteAudiobookClick(
                            audiobook.audiobook_id,
                            audiobook.title
                          )
                        }
                        title="Delete audiobook"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAudiobooks.length === 0 && (
            <div className="empty-state">
              <BookOpen size={64} />
              <p>
                {debouncedSearchQuery
                  ? "No audiobooks found matching your search"
                  : "No audiobooks available yet"}
              </p>
              {!debouncedSearchQuery && canManageAudiobooks && (
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  onClick={handleCreateAudiobookClick}
                >
                  Add Your First Audiobook
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
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

      {/* Add/Edit Audiobook Modal */}
      <AddAudiobookModal
        isOpen={isAddAudiobookModalOpen}
        onClose={() => {
          setIsAddAudiobookModalOpen(false);
          setEditingAudiobook(null);
          setIsEditMode(false);
        }}
        hookForm={addAudiobookHookForm}
        isCreating={isCreatingAudiobook}
        onSubmit={onAddAudiobookSubmit}
        isEditMode={isEditMode}
        initialValues={editingAudiobook}
        parishId={parishId}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAudiobook(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Audiobook"
        message={`Are you sure you want to delete "${deletingAudiobook?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

const AudioBooksPage = () => {
  return (
    <StoreProvider>
      <AudioBooksPageComp />
    </StoreProvider>
  );
};

export default AudioBooksPage;
