"use client";
import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import "./styles.scss";

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive: boolean;
}

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Generate breadcrumb items from pathname
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    // If on dashboard root, show nothing or just dashboard
    if (pathname === "/dashboard" || pathname === "/") {
      return [];
    }

    const paths = pathname.split("/").filter((path) => path && path !== "dashboard");
    const items: BreadcrumbItem[] = [];

    // Build cumulative paths
    let currentPath = "/dashboard";

    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;

      // Format the label (convert kebab-case to Title Case)
      const label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      items.push({
        label,
        path: currentPath,
        isActive: isLast,
      });
    });

    return items;
  }, [pathname]);

  // Don't render if no items
  if (breadcrumbItems.length === 0) {
    return null;
  }

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {/* Dashboard Home */}
        <li className="breadcrumb-item">
          <button
            onClick={() => handleNavigate("/dashboard")}
            className="breadcrumb-link"
            aria-label="Go to Dashboard"
          >
            <Home size={16} className="breadcrumb-home-icon" />
            <span>Dashboard</span>
          </button>
        </li>

        {/* Dynamic breadcrumb items */}
        {breadcrumbItems.map((item) => (
          <React.Fragment key={item.path}>
            <li className="breadcrumb-separator" aria-hidden="true">
              <ChevronRight size={16} />
            </li>
            <li className="breadcrumb-item">
              {item.isActive ? (
                <span className="breadcrumb-active" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => handleNavigate(item.path)}
                  className="breadcrumb-link"
                  aria-label={`Go to ${item.label}`}
                >
                  {item.label}
                </button>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
