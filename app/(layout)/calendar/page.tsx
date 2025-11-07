import React from "react";
import CalendarComponent from "@/components/Calendar";

export const metadata = {
  title: "Parish Calendar - Church Management",
  description: "View and manage parish events, masses, and schedules",
};

export default function CalendarPage() {
  return <CalendarComponent />;
}
