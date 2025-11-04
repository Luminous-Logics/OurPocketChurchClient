"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ChevronRight, ChevronLeft } from "lucide-react";
import "./styles.scss";
import StoreProvider from "@/store/provider";
import { fetchUserProfile } from "@/store/slices/profile";
import { fetchAllPermissions } from "@/store/slices/permissions";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  generateMenuPermissions,
  hasAnyPermission,
  MenuKey,
} from "@/constants/permissions";
import { logoutAction } from "@/lib/actions/auth";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  key?: string; // Used for permission checking
}

export interface SidebarProps {
  items: SidebarItem[];
  logo?: React.ReactNode;
  logoText?: string;
  className?: string;
}

const SideBarComp = ({
  items,
  logo,
  logoText = "Our Pocket Church",
  className = "",
}: SidebarProps) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.userProfile);
  const { groupedPermissions, isLoaded: permissionsLoaded } = useAppSelector(
    (state) => state.permissions
  );

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fetch user profile and all permissions when component mounts
  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchAllPermissions());
  }, [dispatch]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Generate menu permissions dynamically from grouped permissions
  const menuPermissions = useMemo(() => {
    if (
      !permissionsLoaded ||
      !groupedPermissions ||
      Object.keys(groupedPermissions).length === 0
    ) {
      return {};
    }
    return generateMenuPermissions(groupedPermissions);
  }, [groupedPermissions, permissionsLoaded]);

  // Filter menu items based on user permissions
  const filteredItems = useMemo(() => {
    // If permissions haven't loaded yet, show only public items
    if (!permissionsLoaded || Object.keys(menuPermissions).length === 0) {
      return items.filter((item) => {
        const menuKey = (item.key || item.href.substring(1)) as MenuKey;
        // Show items with no module mapping (public items)
        return !menuKey || menuPermissions[menuKey]?.length === 0;
      });
    }

    // If no profile loaded yet, show only public items
    if (!profile || !profile.permissions) {
      return items.filter((item) => {
        const menuKey = (item.key || item.href.substring(1)) as MenuKey;
        const requiredPermissions = menuPermissions[menuKey] || [];
        return requiredPermissions.length === 0; // Show only public items
      });
    }

    // Filter based on permissions
    return items.filter((item) => {
      const menuKey = (item.key || item.href.substring(1)) as MenuKey;
      const requiredPermissions = menuPermissions[menuKey] || [];

      return hasAnyPermission(requiredPermissions, profile.permissions);
    });
  }, [profile, items, menuPermissions, permissionsLoaded]);

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-open" : ""
        } ${className}`.trim()}
      >
        {/* Desktop collapse toggle */}
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
        </button>

        <div className="sidebar-header">
          {logo && <div className="sidebar-logo">{logo}</div>}
          {!isCollapsed && <h1 className="sidebar-title">{logoText}</h1>}
        </div>

        <nav className="sidebar-nav">
          {filteredItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`.trim()}
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon && (
                  <span className="sidebar-nav-icon">{item.icon}</span>
                )}
                {!isCollapsed && (
                  <span className="sidebar-nav-label">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={() => logoutAction()}
            className="sidebar-logout-button"
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const SideBar = (props: SidebarProps) => {
  return (
    <StoreProvider>
      <SideBarComp {...props} />
    </StoreProvider>
  );
};

export default SideBar;
