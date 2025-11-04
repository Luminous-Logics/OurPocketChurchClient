import Sidebar from "@/components/Sidebar";
import "./layout.scss";
import {
  LayoutGrid,
  Home,
  Users,
  Heart,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  BookOpen,
  Award,
  GraduationCap,
  Megaphone,
  Library,
  DollarSign,
  UserCog,
  Shield,
  MapPin,
  Headphones,
  Wallet,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigationItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutGrid size={18} />,
    },
    {
      key: "church-management",
      label: "Church Management",
      href: "/church-management",
      icon: <UserCog size={18} />, // pick any lucide icon you like
    },
    { key: "wards", label: "Wards", href: "/wards", icon: <Home size={18} /> },
    {
      key: "families",
      label: "Families",
      href: "/families",
      icon: <Users size={18} />,
    },
    {
      key: "prayer-requests",
      label: "Prayer Requests",
      href: "/prayer-requests",
      icon: <Heart size={18} />,
    },
    {
      key: "events",
      label: "Events",
      href: "/events",
      icon: <Calendar size={18} />,
    },
    {
      key: "posts",
      label: "Posts",
      href: "/posts",
      icon: <FileText size={18} />,
    },
    {
      key: "communities",
      label: "Communities",
      href: "/communities",
      icon: <MessageSquare size={18} />,
    },
    {
      key: "calendar",
      label: "Calendar",
      href: "/calendar",
      icon: <Calendar size={18} />,
    },
    {
      key: "notifications",
      label: "Notifications",
      href: "/notifications",
      icon: <Bell size={18} />,
    },
    {
      key: "sacraments",
      label: "Sacraments",
      href: "/sacraments",
      icon: <BookOpen size={18} />,
    },
    {
      key: "certificates",
      label: "Certificates",
      href: "/certificates",
      icon: <Award size={18} />,
    },
    {
      key: "class-management",
      label: "Class Management",
      href: "/class-management",
      icon: <GraduationCap size={18} />,
    },
    {
      key: "announcements",
      label: "Announcements",
      href: "/announcements",
      icon: <Megaphone size={18} />,
    },
    {
      key: "bible",
      label: "Bible",
      href: "/bible",
      icon: <Library size={18} />,
    },
    {
      key: "audiobooks",
      label: "Audio Books",
      href: "/audio-books",
      icon: <Headphones size={18} />,
    },
    {
      key: "accounts",
      label: "Accounts",
      href: "/accounts",
      icon: <Wallet size={18} />,
    },
    {
      key: "donations",
      label: "Donations",
      href: "/donations",
      icon: <DollarSign size={18} />,
    },
    {
      key: "family",
      label: "Family Management",
      href: "/family",
      icon: <Users size={18} />,
    },
    {
      key: "parish",
      label: "Parish Settings",
      href: "/parish",
      icon: <UserCog size={18} />,
    },
    {
      key: "prayers",
      label: "Prayers",
      href: "/prayers",
      icon: <Heart size={18} />,
    },
    {
      key: "roles",
      label: "Roles & Permissions",
      href: "/roles",
      icon: <Shield size={18} />,
    },
    { key: "users", label: "Users", href: "/users", icon: <Users size={18} /> },
    {
      key: "ward",
      label: "Ward Management",
      href: "/ward",
      icon: <MapPin size={18} />,
    },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar items={navigationItems} logo="P" logoText="Our Pocket Parish" />
      <main className="main-content">{children}</main>
    </div>
  );
}
