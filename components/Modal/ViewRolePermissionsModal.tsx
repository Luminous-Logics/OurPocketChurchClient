/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-assign-module-variable */
"use client";

import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";
import { Role, Permission } from "@/types";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { Shield, Check } from "lucide-react";
import "./styles.scss";

interface ViewRolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onManageClick?: () => void;
  canManagePermissions?: boolean;
}

const ViewRolePermissionsModal: React.FC<ViewRolePermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
  onManageClick,
  canManagePermissions = false,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});

  useEffect(() => {
    if (isOpen && role) {
      fetchPermissions();
    }
  }, [isOpen, role]);

  const fetchPermissions = async () => {
    if (!role) return;

    setIsLoading(true);
    try {
      const response = await promiseTracker(
        httpServerGet<any>(`/roles/${role.role_id}/permissions`)
      );

      if (response.data) {
        const perms = Array.isArray(response.data) ? response.data : response.data.data || [];
        setPermissions(perms);

        // Group permissions by module
        const grouped = perms.reduce((acc: Record<string, Permission[]>, perm: Permission) => {
          const module = perm.module || "Other";
          if (!acc[module]) {
            acc[module] = [];
          }
          acc[module].push(perm);
          return acc;
        }, {});

        setGroupedPermissions(grouped);
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const modules = Object.keys(groupedPermissions).sort();

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="View Role Permissions"
      className="modal-content modal-lg"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <div className="flex items-center gap-3">
          <div className="role-icon-large">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="modal-title">{role?.role_name}</h3>
            {role?.description && (
              <p className="text-sm text-gray-600 mt-1">{role.description}</p>
            )}
          </div>
        </div>
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

      <div className="modal-body permissions-modal-body">
        {isLoading ? (
          <div className="loading-state">Loading permissions...</div>
        ) : permissions.length === 0 ? (
          <div className="empty-state">
            <p>No permissions assigned to this role</p>
          </div>
        ) : (
          <div className="permissions-grid">
            {modules.map((module) => (
              <div key={module} className="permission-module">
                <div className="module-header">
                  <h4 className="module-name">{module}</h4>
                  <span className="module-count">
                    {groupedPermissions[module].length} permission{groupedPermissions[module].length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="permissions-list">
                  {groupedPermissions[module].map((permission) => (
                    <div key={permission.permission_id} className="permission-item">
                      <div className="permission-check">
                        <Check size={16} />
                      </div>
                      <div className="permission-details">
                        <div className="permission-name">{permission.permission_name}</div>
                        {permission.description && (
                          <div className="permission-description">{permission.description}</div>
                        )}
                        <div className="permission-meta">
                          <span className="permission-code">{permission.permission_code}</span>
                          <span className="permission-action">{permission.action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="modal-footer">
        <div className="permission-summary">
          <span className="text-sm text-gray-600">
            Total: <strong>{permissions.length}</strong> permissions across <strong>{modules.length}</strong> modules
          </span>
        </div>
        <div className="flex gap-2">
          {canManagePermissions && !role?.is_system_role && (
            <Button
              type="button"
              variant="secondary"
              onClick={onManageClick}
            >
              Manage Permissions
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </ReactModal>
  );
};

export default ViewRolePermissionsModal;
