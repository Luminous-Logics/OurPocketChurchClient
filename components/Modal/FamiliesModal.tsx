"use client";
import React from "react";
import ReactModal from "react-modal";
import { Card } from "@/components/Card";
import { Family, Ward } from "@/types";
import "./styles.scss";

interface FamiliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWard: Ward | null;
  wardFamilies: Family[];
  isFetchingFamilies: boolean;
}

const FamiliesModal: React.FC<FamiliesModalProps> = ({
  isOpen,
  onClose,
  selectedWard,
  wardFamilies,
  isFetchingFamilies,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={`Families in ${selectedWard?.ward_name}`}
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">Families in {selectedWard?.ward_name}</h3>
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
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {isFetchingFamilies && (
            <div className="text-center py-4">
              <p className="text-muted">Loading families...</p>
            </div>
          )}

          {!isFetchingFamilies && wardFamilies.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No families found in this ward.</p>
            </div>
          )}

          {!isFetchingFamilies &&
            wardFamilies.map((family) => (
              <Card key={family.family_id} className="member-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1">
                    <h6
                      className="mb-1"
                      style={{ fontWeight: 600, fontSize: "16px" }}
                    >
                      {family.family_name}
                    </h6>
                    <div className="text-muted small">
                      Contact ID: {family.primary_contact_id || "N/A"}
                    </div>
                    {family.home_phone && (
                      <div className="text-muted small">
                        Phone: {family.home_phone}
                      </div>
                    )}
                    {family.registration_date && (
                      <div className="text-muted small">
                        Registered:{" "}
                        {new Date(
                          family.registration_date
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </ReactModal>
  );
};

export default FamiliesModal;