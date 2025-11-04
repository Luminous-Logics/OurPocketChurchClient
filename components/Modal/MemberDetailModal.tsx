"use client";
import React from "react";
import ReactModal from "react-modal";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { Parishioner } from "@/types";
import "./styles.scss";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMember: Parishioner | null;
  calculateAge: (dateOfBirth?: string) => number | null;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  selectedMember,
  calculateAge,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Parishioner Details"
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">Parishioner Details</h3>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="modal-body">
        {selectedMember && (
          <>
            <div className="text-center mb-4">
              <Avatar
                src={selectedMember.photo_url}
                fallback={`Member ${selectedMember.parishioner_id}`}
                size="xl"
                className="mx-auto mb-3"
              />
              <h5 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                {selectedMember?.first_name}
              </h5>
              <div className="d-flex gap-2 justify-content-center">
                {selectedMember.member_status && (
                  <Badge variant="secondary">
                    {selectedMember.member_status}
                  </Badge>
                )}
                {selectedMember.is_active && (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
            </div>
            <div className="row g-3">
              {selectedMember.middle_name && (
                <div className="col-md-6">
                  <strong>Middle Name:</strong>
                  <div className="text-muted">{selectedMember.middle_name}</div>
                </div>
              )}
              {selectedMember.date_of_birth && (
                <div className="col-md-6">
                  <strong>Date of Birth:</strong>
                  <div className="text-muted">
                    {new Date(
                      selectedMember.date_of_birth
                    ).toLocaleDateString()}
                    {calculateAge(selectedMember.date_of_birth) && (
                      <> ({calculateAge(selectedMember.date_of_birth)} years)</>
                    )}
                  </div>
                </div>
              )}
              {selectedMember.gender && (
                <div className="col-md-6">
                  <strong>Gender:</strong>
                  <div className="text-muted">{selectedMember.gender}</div>
                </div>
              )}
              {selectedMember.marital_status && (
                <div className="col-md-6">
                  <strong>Marital Status:</strong>
                  <div className="text-muted">
                    {selectedMember.marital_status}
                  </div>
                </div>
              )}
              {selectedMember.occupation && (
                <div className="col-md-6">
                  <strong>Occupation:</strong>
                  <div className="text-muted">{selectedMember.occupation}</div>
                </div>
              )}
              {selectedMember.baptism_date && (
                <div className="col-md-6">
                  <strong>Baptism Date:</strong>
                  <div className="text-muted">
                    {new Date(selectedMember.baptism_date).toLocaleDateString()}
                  </div>
                </div>
              )}
              {selectedMember.first_communion_date && (
                <div className="col-md-6">
                  <strong>First Communion:</strong>
                  <div className="text-muted">
                    {new Date(
                      selectedMember.first_communion_date
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}
              {selectedMember.confirmation_date && (
                <div className="col-md-6">
                  <strong>Confirmation:</strong>
                  <div className="text-muted">
                    {new Date(
                      selectedMember.confirmation_date
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}
              {selectedMember.marriage_date && (
                <div className="col-md-6">
                  <strong>Marriage Date:</strong>
                  <div className="text-muted">
                    {new Date(
                      selectedMember.marriage_date
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}
              {selectedMember.address_line1 && (
                <div className="col-12">
                  <strong>Address:</strong>
                  <div className="text-muted">
                    {selectedMember.address_line1}
                    {selectedMember.address_line2 &&
                      `, ${selectedMember.address_line2}`}
                    <br />
                    {selectedMember.city && `${selectedMember.city}, `}
                    {selectedMember.state && `${selectedMember.state} `}
                    {selectedMember.postal_code}
                    {selectedMember.country && (
                      <>
                        <br />
                        {selectedMember.country}
                      </>
                    )}
                  </div>
                </div>
              )}
              {selectedMember.emergency_contact_name && (
                <div className="col-md-6">
                  <strong>Emergency Contact:</strong>
                  <div className="text-muted">
                    {selectedMember.emergency_contact_name}
                  </div>
                </div>
              )}
              {selectedMember.emergency_contact_phone && (
                <div className="col-md-6">
                  <strong>Emergency Phone:</strong>
                  <div className="text-muted">
                    {selectedMember.emergency_contact_phone}
                  </div>
                </div>
              )}
              {selectedMember.notes && (
                <div className="col-12">
                  <strong>Notes:</strong>
                  <div className="text-muted">{selectedMember.notes}</div>
                </div>
              )}
              {selectedMember.registration_date && (
                <div className="col-md-6">
                  <strong>Registration Date:</strong>
                  <div className="text-muted">
                    {new Date(
                      selectedMember.registration_date
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="modal-footer">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </ReactModal>
  );
};

export default MemberDetailModal;