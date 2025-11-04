"use client";
import React from "react";
import ReactModal from "react-modal";
import { Card } from "@/components/Card";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import { Parishioner, Ward } from "@/types";
import "./styles.scss";

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWard: Ward | null;
  wardMembers: Parishioner[];
  isFetchingMembers: boolean;
  onViewMemberDetail: (member: Parishioner) => void;
  calculateAge: (dateOfBirth?: string) => number | null;
}

const MembersModal: React.FC<MembersModalProps> = ({
  isOpen,
  onClose,
  selectedWard,
  wardMembers,
  isFetchingMembers,
  onViewMemberDetail,
  calculateAge,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={`Members of ${selectedWard?.ward_name}`}
      className="modal-content modal-xl"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <h3 className="modal-title">Members of {selectedWard?.ward_name}</h3>
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
          {isFetchingMembers && (
            <div className="text-center py-4">
              <p className="text-muted">Loading members...</p>
            </div>
          )}

          {!isFetchingMembers && wardMembers.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No members found in this ward.</p>
            </div>
          )}

          {!isFetchingMembers && wardMembers.length > 0 && (
            <div>
              <h6 className="fw-semibold mb-3" style={{ fontSize: "14px" }}>
                All Members ({wardMembers.length})
              </h6>
              {wardMembers.map((member) => {
                const age = calculateAge(member.date_of_birth);
                const displayName = `Member ${member.parishioner_id}`;

                return (
                  <Card
                    key={member.parishioner_id}
                    className="member-card"
                    onClick={() => onViewMemberDetail(member)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Avatar
                        src={member.photo_url}
                        fallback={displayName}
                        size="lg"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <strong>{member?.first_name}</strong>
                          {member.member_status && (
                            <Badge variant="secondary">
                              {member.member_status}
                            </Badge>
                          )}
                          {member.is_active && (
                            <Badge variant="success">Active</Badge>
                          )}
                        </div>
                        <div className="text-muted small">
                          {member.occupation && `${member.occupation}`}
                          {age && ` • Age: ${age}`}
                          {member.gender && ` • ${member.gender}`}
                        </div>
                        {member.emergency_contact_phone && (
                          <div className="text-muted small">
                            Emergency: {member.emergency_contact_phone}
                          </div>
                        )}
                        {member.marital_status && (
                          <div className="d-flex gap-1 mt-2">
                            <Badge variant="outline">
                              {member.marital_status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ReactModal>
  );
};

export default MembersModal;