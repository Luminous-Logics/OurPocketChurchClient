/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Button from "@/components/Button";
import { Card } from "@/components/Card";
import Badge from "@/components/Badge";
import { httpServerGet } from "@/lib/api";
import { PrayerRequest } from "@/types";
import { useAppSelector } from "@/hooks";
import toaster from "@/lib/toastify";
import {
  approvePrayerRequest,
  closePrayerRequest,
  createPrayerRequest
} from "@/lib/actions/prayer-request";
import { Permission } from "@/types";
import StoreProvider from "@/store/provider";

// Set app element for accessibility
if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

interface PrayerRequestsApiResponse {
  data?: PrayerRequest[];
}

const PrayerRequestsPageComp = () => {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookPrayerSlot, setBookPrayerSlot] = useState(false);
  const [activePrayerRequests, setActivePrayerRequests] = useState<PrayerRequest[]>([]);
  const [pastPrayerRequests, setPastPrayerRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requesterName: "",
    subject: "",
    description: "",
    bookingDate: "",
    bookingTime: "",
    isAnonymous: false,
    isUrgent: false,
    isPublic: true,
  });

  // Get parish ID from user profile
  const profile = useAppSelector((state) => state.profile.userProfile);
  const parishId = Number(profile?.parish?.parish_id) || 1;

  // Get user permissions from profile
  const userPermissions = profile?.permissions || [];
  const canApprovePrayerRequests = userPermissions.some(
    (permission: Permission) => permission.permission_code === "APPROVE_PRAYER_REQUESTS"
  );
console.log(canApprovePrayerRequests)
  // Fetch active prayer requests
  useEffect(() => {
    if (!parishId) return;

    const fetchActivePrayerRequests = async () => {
      try {
        setIsLoading(true);
        const response = await httpServerGet<PrayerRequestsApiResponse>(
          `/prayer-requests/parish/${parishId}/active`
        );

        if (response.data) {
          if (Array.isArray(response.data)) {
            setActivePrayerRequests(response.data.filter(Boolean));
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setActivePrayerRequests(response.data.data.filter(Boolean));
          } else {
            setActivePrayerRequests([]);
          }
        } else {
          setActivePrayerRequests([]);
        }
      } catch (error) {
        toaster.error("Failed to fetch active prayer requests. Please try again later");
        console.error("Error fetching active prayer requests:", error);
        setActivePrayerRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivePrayerRequests();
  }, [parishId]);

  // Fetch past prayer requests
  useEffect(() => {
    if (!parishId) return;

    const fetchPastPrayerRequests = async () => {
      try {
        const response = await httpServerGet<PrayerRequestsApiResponse>(
          `/prayer-requests/parish/${parishId}/past`
        );

        if (response.data) {
          if (Array.isArray(response.data)) {
            setPastPrayerRequests(response.data.filter(Boolean));
          } else if (response.data.data && Array.isArray(response.data.data)) {
            setPastPrayerRequests(response.data.data.filter(Boolean));
          } else {
            setPastPrayerRequests([]);
          }
        } else {
          setPastPrayerRequests([]);
        }
      } catch (error) {
        toaster.error("Failed to fetch past prayer requests. Please try again later");
        console.error("Error fetching past prayer requests:", error);
        setPastPrayerRequests([]);
      }
    };

    fetchPastPrayerRequests();
  }, [parishId]);

  // Determine which prayer requests to display based on active tab
  const displayPrayerRequests = activeTab === "active" ? activePrayerRequests : pastPrayerRequests;

  // Refresh active prayer requests from server
  const refreshActivePrayerRequests = async () => {
    try {
      const response = await httpServerGet<PrayerRequestsApiResponse>(
        `/prayer-requests/parish/${parishId}/active`
      );

      if (response.data) {
        if (Array.isArray(response.data)) {
          setActivePrayerRequests(response.data.filter(Boolean));
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setActivePrayerRequests(response.data.data.filter(Boolean));
        } else {
          setActivePrayerRequests([]);
        }
      }
    } catch (error) {
      console.error("Error refreshing prayer requests:", error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setApprovingId(id);
      const response = await approvePrayerRequest(id);

      if (response.success) {
        toaster.success(response.message || "Prayer request approved successfully");

        // Update the local state with the updated prayer request
        setActivePrayerRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.prayer_request_id === id
              ? { ...request, status: "confirmed" as const }
              : request
          )
        );
      } else {
        toaster.error(
          response.error?.message || "Failed to approve prayer request"
        );
      }
    } catch (error) {
      console.error("Error approving prayer request:", error);
      toaster.error("An error occurred while approving the prayer request");
    } finally {
      setApprovingId(null);
    }
  };

  const handleClose = async (id: number) => {
    try {
      setClosingId(id);
      const response = await closePrayerRequest(id);

      if (response.success) {
        toaster.success(response.message || "Prayer request closed successfully");

        // Remove from active requests and add to past requests
        setActivePrayerRequests((prevRequests) =>
          prevRequests.filter((request) => request.prayer_request_id !== id)
        );

        // Add to past requests with updated status
        const closedRequest = activePrayerRequests.find(
          (request) => request.prayer_request_id === id
        );
        if (closedRequest) {
          setPastPrayerRequests((prevRequests) => [
            { ...closedRequest, status: "completed" as const },
            ...prevRequests,
          ]);
        }
      } else {
        toaster.error(
          response.error?.message || "Failed to close prayer request"
        );
      }
    } catch (error) {
      console.error("Error closing prayer request:", error);
      toaster.error("An error occurred while closing the prayer request");
    } finally {
      setClosingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const requestData: {
        parish_id: number;
        requester_name: string;
        subject: string;
        description: string;
        booking_date?: string;
        booking_time?: string;
        is_anonymous: boolean;
        is_urgent: boolean;
        is_public: boolean;
      } = {
        parish_id: parishId,
        requester_name: formData.requesterName,
        subject: formData.subject,
        description: formData.description,
        is_anonymous: formData.isAnonymous,
        is_urgent: formData.isUrgent,
        is_public: formData.isPublic,
      };

      // Only add booking date/time if prayer slot is booked and values are provided
      if (bookPrayerSlot && formData.bookingDate && formData.bookingTime) {
        requestData.booking_date = formData.bookingDate;
        requestData.booking_time = formData.bookingTime;
      }

      const response = await createPrayerRequest(requestData);

      if (response.success) {
        toaster.success(response.message || "Prayer request created successfully");

        // Refresh the active prayer requests list to get latest data from server
        await refreshActivePrayerRequests();

        // Close modal and reset form
        setIsModalOpen(false);
        resetForm();
      } else {
        toaster.error(
          response.error?.message || "Failed to create prayer request"
        );
      }
    } catch (error) {
      console.error("Error creating prayer request:", error);
      toaster.error("An error occurred while creating the prayer request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      requesterName: "",
      subject: "",
      description: "",
      bookingDate: "",
      bookingTime: "",
      isAnonymous: false,
      isUrgent: false,
      isPublic: true,
    });
    setBookPrayerSlot(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="prayer-requests-page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Prayer Requests</h1>
          <p>View and manage prayer requests from parish members</p>
        </div>
        <Button variant="primary" icon={<PlusIcon />} onClick={() => setIsModalOpen(true)}>
          Add Prayer Request
        </Button>
      </div>

      {/* Tabs */}
      <div className="prayer-tabs">
        <button
          className={`prayer-tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active/New
        </button>
        <button
          className={`prayer-tab ${activeTab === "past" ? "active" : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Past Requests
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <p>Loading prayer requests...</p>
        </div>
      )}

      {/* Prayer Requests List */}
      {!isLoading && (
        <div className="prayer-requests-list">
          {displayPrayerRequests.filter(Boolean).map((request) => (
            <Card key={request.prayer_request_id} className="prayer-request-card">
              <div className="prayer-request-header">
                <div className="prayer-icon">
                  <HeartIcon />
                </div>
                <div className="prayer-info">
                  <h3 className="prayer-title">{request.subject}</h3>
                  <p className="prayer-requester">
                    <UserIcon />
                    {request.is_anonymous ? "Anonymous" : request.requester_name}
                  </p>
                </div>
                <div className="prayer-actions">
                  {activeTab === "active" && canApprovePrayerRequests && (
                    <>
                      {request.status !== "confirmed" && (
                        <button
                          className="action-button approve"
                          onClick={() => handleApprove(request.prayer_request_id)}
                          disabled={approvingId === request.prayer_request_id || closingId === request.prayer_request_id}
                        >
                          <CheckIcon />
                          {approvingId === request.prayer_request_id
                            ? "Approving..."
                            : "Approve"}
                        </button>
                      )}
                      <button
                        className="action-button close"
                        onClick={() => handleClose(request.prayer_request_id)}
                        disabled={closingId === request.prayer_request_id || approvingId === request.prayer_request_id}
                      >
                        <XIcon />
                        {closingId === request.prayer_request_id
                          ? "Closing..."
                          : "Close"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="prayer-request-body">
                <p className="prayer-description">{request.description}</p>

                <div className="prayer-meta">
                  <Badge variant={request.is_urgent ? "danger" : "secondary"}>
                    {request.is_urgent ? "Urgent" : "Normal"}
                  </Badge>
                  <Badge
                    variant={
                      request.status === "pending"
                        ? "outline"
                        : request.status === "confirmed"
                        ? "primary"
                        : request.status === "completed"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                  {request.booking_date && request.booking_time && (
                    <span className="prayer-time">
                      <ClockIcon />
                      Slot: {new Date(request.booking_date).toLocaleDateString()}{" "}
                      {request.booking_time}
                    </span>
                  )}
                  {request.created_at && (
                    <span className="prayer-time">
                      <ClockIcon />
                      Created: {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {request.notes && (
                  <div className="prayer-notes">
                    <strong>Notes:</strong> {request.notes}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && displayPrayerRequests.length === 0 && (
        <div className="no-results">
          <p>No prayer requests found.</p>
        </div>
      )}

      {/* Add Prayer Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancel}
        className="modal-content"
        overlayClassName="modal-overlay"
        closeTimeoutMS={200}
      >
        <div className="modal-header">
          <div>
            <h2>Add Prayer Request</h2>
            <p>Submit a new prayer request</p>
          </div>
          <button className="modal-close" onClick={handleCancel} type="button">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="requesterName">
                Your Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="requesterName"
                className="form-input"
                value={formData.requesterName}
                onChange={(e) =>
                  setFormData({ ...formData, requesterName: e.target.value })
                }
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                Subject <span className="required">*</span>
              </label>
              <input
                type="text"
                id="subject"
                className="form-input"
                placeholder="e.g., Prayer for healing, Death memory day"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                className="form-textarea"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) =>
                  setFormData({ ...formData, isAnonymous: e.target.checked })
                }
                disabled={isSubmitting}
              />
              <label htmlFor="isAnonymous">Submit anonymously</label>
            </div>

            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="isUrgent"
                checked={formData.isUrgent}
                onChange={(e) =>
                  setFormData({ ...formData, isUrgent: e.target.checked })
                }
                disabled={isSubmitting}
              />
              <label htmlFor="isUrgent">Mark as urgent</label>
            </div>

            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                disabled={isSubmitting}
              />
              <label htmlFor="isPublic">Make public</label>
            </div>

            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="bookPrayerSlot"
                checked={bookPrayerSlot}
                onChange={(e) => setBookPrayerSlot(e.target.checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="bookPrayerSlot">Book a prayer slot</label>
            </div>

            {bookPrayerSlot && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bookingDate">
                    Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="bookingDate"
                    className="form-input"
                    value={formData.bookingDate}
                    onChange={(e) =>
                      setFormData({ ...formData, bookingDate: e.target.value })
                    }
                    required={bookPrayerSlot}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bookingTime">
                    Time <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    id="bookingTime"
                    className="form-input"
                    value={formData.bookingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, bookingTime: e.target.value })
                    }
                    required={bookPrayerSlot}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Icon components
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const HeartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const UserIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const PrayerRequestsPage = () => {
  return (
    <StoreProvider>
      <PrayerRequestsPageComp />
    </StoreProvider>
  );
};

export default PrayerRequestsPage;
