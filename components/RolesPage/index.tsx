"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchRoles, fetchUsersWithRoles } from "@/store/slices/roles";
import {
  Plus,
  Edit2,
  Trash2,
  Shield,
  Star,
  UserPlus,
  UserMinus,
} from "lucide-react";
import Button from "@/components/Button";
import AddRoleModal, {
  AddRoleFormType,
  addRoleSchema,
} from "@/components/Modal/AddRoleModal";
import AssignRoleModal, {
  AssignRoleFormType,
  assignRoleSchema,
} from "@/components/Modal/AssignRoleModal";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import ViewRolePermissionsModal from "@/components/Modal/ViewRolePermissionsModal";
import ManageRolePermissionsModal from "@/components/Modal/ManageRolePermissionsModal";
import {
  createRole,
  updateRole,
  deleteRole,
  assignRole,
  unassignRole,
} from "@/lib/actions/roles";
import { promiseTracker } from "@/lib/api";
import "./styles.scss";
import { Role, Permission, UserWithRole } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks";
import StoreProvider from "@/store/provider";

type TabType = "roles" | "users";

const RolesPageComp = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const rolesState = useAppSelector((state) => state.roles);

  const {
    roles = [],
    usersWithRoles = [],
    isLoading = false,
    isUsersLoading = false,
    currentPage = 1,
    totalPages = 1,
  } = rolesState || {};

  const [activeTab, setActiveTab] = useState<TabType>("roles");
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isManagePermissionsModalOpen, setIsManagePermissionsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [viewingPermissionsRole, setViewingPermissionsRole] = useState<Role | null>(null);

  const addRoleHookForm = useForm<AddRoleFormType>({
    resolver: zodResolver(addRoleSchema),
  });

  const assignRoleHookForm = useForm<AssignRoleFormType>({
    resolver: zodResolver(assignRoleSchema),
  });

  const parishId = profile?.userProfile?.parish?.parish_id;

  const canManageRoles = profile?.userProfile?.permissions?.some(
    (permission: Permission) => permission.permission_code === "MANAGE_ROLES"
  );

  const canManagePermissions = profile?.userProfile?.permissions?.some(
    (permission: Permission) => permission.permission_code === "MANAGE_PERMISSIONS"
  );

  useEffect(() => {
    dispatch(fetchRoles(parishId));
  }, [dispatch, parishId]);

  useEffect(() => {
    if (activeTab === "users") {
      dispatch(fetchUsersWithRoles(parishId, 1, 20));
    }
  }, [dispatch, parishId, activeTab]);

  const handlePageChange = (page: number) => {
    if (parishId) {
      dispatch(fetchUsersWithRoles(parishId, page, 20));
    }
  };

  const handleCreateRoleClick = () => {
    setEditingRole(null);
    setIsEditMode(false);
    setIsAddRoleModalOpen(true);
  };

  const handleEditRoleClick = (role: Role) => {
    setEditingRole(role);
    setIsEditMode(true);
    setIsAddRoleModalOpen(true);
  };

  const handleDeleteRoleClick = (roleId: number) => {
    setDeletingRoleId(roleId);
    setIsDeleteModalOpen(true);
  };

  const handleAssignRoleClick = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsAssignRoleModalOpen(true);
  };

  const handleUnassignRoleClick = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsUnassignModalOpen(true);
  };

  const handleViewPermissionsClick = (role: Role) => {
    setViewingPermissionsRole(role);
    setIsPermissionsModalOpen(true);
  };

  const handleManagePermissionsClick = () => {
    setIsPermissionsModalOpen(false);
    setIsManagePermissionsModalOpen(true);
  };

  const handleManagePermissionsClose = () => {
    setIsManagePermissionsModalOpen(false);
    // Optionally reopen the view permissions modal
    setIsPermissionsModalOpen(true);
  };

  const handlePermissionsUpdated = () => {
    // This will be called when permissions are updated to refresh the role data
    dispatch(fetchRoles(parishId));
  };

  const onAddRoleSubmit = async (data: AddRoleFormType) => {
    setIsCreating(true);
    try {
      const roleData = {
        role_name: data.role_name,
        role_code: data.role_code,
        description: data.description || undefined,
        parish_id: parishId,
        priority: data.priority ? parseInt(data.priority, 10) : undefined,
      };

      if (editingRole) {
        await promiseTracker(updateRole(Number(editingRole.role_id), roleData));
      } else {
        await promiseTracker(createRole(roleData));
      }

      setIsAddRoleModalOpen(false);
      setEditingRole(null);
      setIsEditMode(false);
      dispatch(fetchRoles(parishId));
    } catch (error) {
      console.error("Error saving role:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoleId) return;

    try {
      await promiseTracker(deleteRole(deletingRoleId));
      setIsDeleteModalOpen(false);
      setDeletingRoleId(null);
      dispatch(fetchRoles(parishId));
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const onAssignRoleSubmit = async (data: AssignRoleFormType) => {
    if (!selectedUser) return;

    setIsAssigning(true);
    try {
      const roleId = parseInt(data.role_id.value, 10);
      const userId = typeof selectedUser.user_id === 'string'
        ? parseInt(selectedUser.user_id, 10)
        : selectedUser.user_id;

      const assignData = {
        role_id: roleId,
        expires_at: data.expires_at || undefined,
      };

      await promiseTracker(assignRole(userId, assignData));
      setIsAssignRoleModalOpen(false);
      setSelectedUser(null);
      dispatch(fetchUsersWithRoles(parishId, currentPage, 20));
    } catch (error) {
      console.error("Error assigning role:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignConfirm = async () => {
    if (!selectedUser || !selectedUser.roles || selectedUser.roles.length === 0) return;

    try {
      const userId = typeof selectedUser.user_id === 'string'
        ? parseInt(selectedUser.user_id, 10)
        : selectedUser.user_id;

      // Unassign all roles for the user
      // If you want to unassign specific roles, you'll need to modify this logic
      for (const role of selectedUser.roles) {
        await promiseTracker(unassignRole(userId, role.role_id));
      }
      setIsUnassignModalOpen(false);
      setSelectedUser(null);
      dispatch(fetchUsersWithRoles(parishId, currentPage, 20));
    } catch (error) {
      console.error("Error unassigning roles:", error);
    }
  };

  return (
    <div className="roles-page">
      <div className="roles-header">
        <div className="header-content">
          <h1>Roles & Permissions</h1>
          <p>Manage user roles and permissions across communities, events, and classes</p>
        </div>
        <div className="header-right">
          {canManageRoles && activeTab === "roles" && (
            <Button variant="primary" onClick={handleCreateRoleClick}>
              <Plus size={16} />
              Create Role
            </Button>
          )}
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            Role Management
          </button>
          <button
            className={`tab-button ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            User Role Management
          </button>
        </div>

        {activeTab === "roles" && (
          <div className="roles-section">
            {isLoading ? (
              <div className="loading-state">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="empty-state">
                <p>No roles found</p>
                {canManageRoles && (
                  <Button variant="primary" onClick={handleCreateRoleClick}>
                    Create Your First Role
                  </Button>
                )}
              </div>
            ) : (
              <div className="roles-list">
                {roles.map((role) => (
                  <div key={role.role_id} className="role-item">
                    <div className="role-main">
                      <div className="role-icon">
                        <Shield size={20} />
                      </div>
                      <div className="role-details">
                        <div className="role-name">
                          {role.role_name}
                          <span className="role-code">{role.role_code}</span>
                        </div>
                        {role.description && (
                          <div className="role-description">{role.description}</div>
                        )}
                        <div className="role-meta">
                          {role.priority !== undefined && (
                            <div className="meta-item">
                              <Star size={14} />
                              Priority: {role.priority}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="role-right">
                      {role.is_system_role && (
                        <div className="badge system-badge">System Role</div>
                      )}
                      {!role.is_system_role && (
                        <div className="badge custom-badge">Custom Role</div>
                      )}
                      {!role.is_active && (
                        <div className="badge inactive-badge">Inactive</div>
                      )}
                      <div className="role-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewPermissionsClick(role)}
                          title="View Permissions"
                        >
                          <Shield size={16} />
                        </button>
                        {canManageRoles && (
                          <>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEditRoleClick(role)}
                              disabled={role.is_system_role}
                              title="Edit Role"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteRoleClick(Number(role.role_id))}
                              disabled={role.is_system_role}
                              title="Delete Role"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-section">
            {isUsersLoading ? (
              <div className="loading-state">Loading users...</div>
            ) : usersWithRoles.length === 0 ? (
              <div className="empty-state">
                <p>No users found</p>
              </div>
            ) : (
              <>
                <div className="users-list">
                  {usersWithRoles.map((user) => (
                    <div key={user.user_id} className="user-item">
                      <div className="user-main">
                        <div className="user-icon">
                          {user.first_name.charAt(0)}
                          {user.last_name.charAt(0)}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="user-email">{user.email}</div>
                          {user.ward_name && (
                            <div className="user-meta">
                              <span className="meta-label">Ward:</span> {user.ward_name}
                              {user.family_name && (
                                <> | <span className="meta-label">Family:</span> {user.family_name}</>
                              )}
                            </div>
                          )}
                          <div className="user-roles">
                            {user.roles && user.roles.length > 0 ? (
                              <>
                                <span className="roles-label">Roles:</span>
                                <div className="roles-badges">
                                  {user.roles.map((role) => (
                                    <span key={role.role_id} className="role-badge" title={role.description}>
                                      {role.role_name}
                                    </span>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <span className="no-role">No roles assigned</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="user-right">
                        {canManageRoles && (
                          <div className="user-actions">
                            <button
                              className="action-btn assign-btn"
                              onClick={() => handleAssignRoleClick(user)}
                              title="Assign Role"
                            >
                              <UserPlus size={16} />
                            </button>
                            {user.roles && user.roles.length > 0 && (
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleUnassignRoleClick(user)}
                                title="Unassign Roles"
                              >
                                <UserMinus size={16} />
                              </button>
                            )}
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
        )}
      </div>

      {/* Modals */}
      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        onClose={() => {
          setIsAddRoleModalOpen(false);
          setEditingRole(null);
          setIsEditMode(false);
        }}
        hookForm={addRoleHookForm}
        isCreating={isCreating}
        onSubmit={onAddRoleSubmit}
        isEditMode={isEditMode}
        initialValues={editingRole}
      />

      <AssignRoleModal
        isOpen={isAssignRoleModalOpen}
        onClose={() => {
          setIsAssignRoleModalOpen(false);
          setSelectedUser(null);
        }}
        hookForm={assignRoleHookForm}
        isAssigning={isAssigning}
        onSubmit={onAssignRoleSubmit}
        userName={
          selectedUser
            ? `${selectedUser.first_name} ${selectedUser.last_name}`
            : undefined
        }
        roles={roles}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRoleId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
      />

      <ConfirmationModal
        isOpen={isUnassignModalOpen}
        onClose={() => {
          setIsUnassignModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleUnassignConfirm}
        title="Unassign Roles"
        message={`Are you sure you want to remove all roles from ${selectedUser?.first_name} ${selectedUser?.last_name}? This will unassign ${selectedUser?.roles?.length || 0} role(s).`}
      />

      <ViewRolePermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setViewingPermissionsRole(null);
        }}
        role={viewingPermissionsRole}
        onManageClick={handleManagePermissionsClick}
        canManagePermissions={canManagePermissions}
      />

      <ManageRolePermissionsModal
        isOpen={isManagePermissionsModalOpen}
        onClose={handleManagePermissionsClose}
        role={viewingPermissionsRole}
        onPermissionsUpdated={handlePermissionsUpdated}
      />
    </div>
  );
};

const RolesPage = () => {
  return (
    <StoreProvider>
      <RolesPageComp />
    </StoreProvider>
  );
};

export default RolesPage;
