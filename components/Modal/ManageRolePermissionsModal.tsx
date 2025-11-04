/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-assign-module-variable */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import Button from "@/components/Button";
import { Role, Permission } from "@/types";
import { httpServerGet, promiseTracker } from "@/lib/api";
import { Shield, Plus, X,  Search } from "lucide-react";
import { assignPermissionToRole, unassignPermissionFromRole } from "@/lib/actions/roles";
import "./styles.scss";

interface ManageRolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onPermissionsUpdated: () => void;
}

const ManageRolePermissionsModal: React.FC<ManageRolePermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
  onPermissionsUpdated,
}) => {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("All");

  useEffect(() => {
    if (isOpen && role) {
      fetchData();
    }
  }, [isOpen, role]);

  const fetchData = async () => {
    if (!role) return;

    setIsLoading(true);
    try {
      // Fetch all permissions
      const allPermsResponse = await promiseTracker(
        httpServerGet<any>("/roles/permissions")
      );

      // Fetch current role permissions
      const rolePermsResponse = await promiseTracker(
        httpServerGet<any>(`/roles/${role.role_id}/permissions`)
      );
      debugger;
      if (allPermsResponse.data) {
        const perms = Array.isArray(allPermsResponse.data.all)
          ? allPermsResponse.data.all
          : allPermsResponse.data.all || [];
        setAllPermissions(perms);
      }

      if (rolePermsResponse.data) {
        const perms = Array.isArray(rolePermsResponse.data)
          ? rolePermsResponse.data
          : rolePermsResponse.data.data || [];
        setRolePermissions(perms);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = async (permission: Permission) => {
    if (!role || isUpdating) return;

    const isAssigned = rolePermissions.some(
      (p) => p.permission_id === permission.permission_id
    );

    setIsUpdating(true);
    try {
      if (isAssigned) {
        await promiseTracker(
          unassignPermissionFromRole(
            Number(role.role_id),
            Number(permission.permission_id)
          )
        );
        setRolePermissions((prev) =>
          prev.filter((p) => p.permission_id !== permission.permission_id)
        );
      } else {
        await promiseTracker(
          assignPermissionToRole(
            Number(role.role_id),
            Number(permission.permission_id)
          )
        );
        setRolePermissions((prev) => [...prev, permission]);
      }
      onPermissionsUpdated();
    } catch (error) {
      console.error("Error toggling permission:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isPermissionAssigned = (permissionId: string | number) => {
    return rolePermissions.some((p) => p.permission_id === permissionId);
  };

  // Group permissions by module
  const groupedPermissions = allPermissions.reduce(
    (acc: Record<string, Permission[]>, perm: Permission) => {
      const module = perm.module || "Other";
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(perm);
      return acc;
    },
    {}
  );

  const modules = ["All", ...Object.keys(groupedPermissions).sort()];

  // Filter permissions based on search and module
  const filteredPermissions =
    selectedModule === "All"
      ? allPermissions
      : groupedPermissions[selectedModule] || [];

  const searchFilteredPermissions = filteredPermissions.filter(
    (perm) =>
      perm.permission_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.permission_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignedCount = rolePermissions.length;
  const totalCount = allPermissions.length;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Manage Role Permissions"
      className="modal-content modal-xl"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      <div className="modal-header">
        <div className="flex items-center gap-3">
          <div className="role-icon-large">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="modal-title">Manage Permissions</h3>
            <p className="text-sm text-gray-600 mt-1">
              {role?.role_name} - {assignedCount} of {totalCount} permissions assigned
            </p>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
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

      <div className="modal-body manage-permissions-body">
        {isLoading ? (
          <div className="loading-state">Loading permissions...</div>
        ) : (
          <>
            {/* Filters */}
            <div className="permissions-filters">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="module-tabs">
                {modules.map((module) => (
                  <button
                    key={module}
                    className={`module-tab ${selectedModule === module ? "active" : ""}`}
                    onClick={() => setSelectedModule(module)}
                  >
                    {module}
                    {module !== "All" && (
                      <span className="tab-count">
                        {groupedPermissions[module]?.length || 0}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions List */}
            <div className="manage-permissions-list">
              {searchFilteredPermissions.length === 0 ? (
                <div className="empty-state">
                  <p>No permissions found</p>
                </div>
              ) : (
                searchFilteredPermissions.map((permission) => {
                  const isAssigned = isPermissionAssigned(permission.permission_id);
                  return (
                    <div
                      key={permission.permission_id}
                      className={`permission-toggle-item ${isAssigned ? "assigned" : ""}`}
                    >
                      <div className="permission-info">
                        <div className="permission-header">
                          <span className="permission-name">{permission.permission_name}</span>
                          <div className="permission-badges">
                            <span className="module-badge">{permission.module}</span>
                            <span className="action-badge">{permission.action}</span>
                          </div>
                        </div>
                        {permission.description && (
                          <div className="permission-description">{permission.description}</div>
                        )}
                        <div className="permission-code">{permission.permission_code}</div>
                      </div>

                      <button
                        className={`toggle-button ${isAssigned ? "remove" : "add"}`}
                        onClick={() => handleTogglePermission(permission)}
                        disabled={isUpdating || role?.is_system_role}
                        title={isAssigned ? "Remove permission" : "Add permission"}
                      >
                        {isAssigned ? (
                          <>
                            <X size={16} />
                            Remove
                          </>
                        ) : (
                          <>
                            <Plus size={16} />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <div className="modal-footer">
        <div className="permission-summary">
          <span className="text-sm text-gray-600">
            <strong>{assignedCount}</strong> of <strong>{totalCount}</strong> permissions assigned
          </span>
          {role?.is_system_role && (
            <span className="text-xs text-amber-600 ml-3">
              System roles cannot be modified
            </span>
          )}
        </div>
        <Button type="button" variant="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </ReactModal>
  );
};

export default ManageRolePermissionsModal;
