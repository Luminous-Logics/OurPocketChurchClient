// layout.tsx
import "./globals.scss";
import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";
import { Loader } from "@/components/Loader";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body className="position-relative">
        {children}
        <Loader />
        <ToastContainer position="bottom-right" />
      </body>
    </html>
  );
}
