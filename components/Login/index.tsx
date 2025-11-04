/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import * as z from "zod";
import Link from "next/link";
import toaster from "@/lib/toastify";
import { useForm } from "react-hook-form";
import InputText from "../InputComponents/InputText";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormType = z.infer<typeof loginSchema>;

export default function LoginComp() {
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);

  const hookForm = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  });

  const { handleSubmit } = hookForm;

  const loginHandler = async (data: LoginFormType) => {
    try {
      const resp = await loginAction(data);
      if (resp.success) {
        // Success - user is logged in
        toaster.success("Login Successful!");
        console.log("Logged in user:", resp.data?.user);
        router.push("/dashboard");
      } else {
        // Error - show error message
        toaster.error(resp.message || "Login Failed");
      }
    } catch (err) {
      console.error(err);
      toaster.error("Something went wrong");
    }
  };

  const features = [
    {
      title: "Comprehensive Member Management",
      description: "Easily manage parishioner records, families, and member engagement with intuitive tools."
    },
    {
      title: "Event & Sacrament Tracking",
      description: "Schedule events, track sacraments, and maintain detailed spiritual journey records."
    },
    {
      title: "Financial Management",
      description: "Track donations, manage budgets, and generate comprehensive financial reports effortlessly."
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="login-page login-bg">
      <div className="login-wrapper">
        {/* Left Side - Feature Showcase */}
        <div className="login-feature-panel">
          <div className="feature-content">
            <div className="brand-section">
              <h1 className="brand-title">Our Pocket Church</h1>
              <p className="brand-tagline">Complete Parish Management Solution</p>
            </div>

            <div className="feature-showcase">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">
                  {currentFeature === 0 && (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )}
                  {currentFeature === 1 && (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  )}
                  {currentFeature === 2 && (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  )}
                </div>
              </div>
              
              <h2 className="feature-title">{features[currentFeature].title}</h2>
              <p className="feature-description">{features[currentFeature].description}</p>

              <div className="feature-indicators">
                {features.map((_, idx) => (
                  <button
                    key={idx}
                    className={`indicator ${idx === currentFeature ? 'active' : ''}`}
                    onClick={() => setCurrentFeature(idx)}
                    aria-label={`Feature ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="powered-by">
              Powered by <strong>Luminous Logics</strong>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-panel">
          <div className="loginForm">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue to Our Pocket Church</p>
            </div>

            <form onSubmit={handleSubmit(loginHandler)}>
              {/* Email */}
              <div className="form-group">
                <InputText
                  hookForm={hookForm}
                  field="email"
                  label="Email"
                  labelMandatory
                  errorText="Please enter a valid email"
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <InputText
                  hookForm={hookForm}
                  field="password"
                  label="Password"
                  labelMandatory
                  errorText="Password is required"
                  type="password"
                />
              </div>

              <div className="form-group d-flex justify-content-between align-items-center">
                <div>
                  <div className="form-check custom-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberme"
                    />
                    <label className="form-check-label" htmlFor="rememberme">
                      Remember Me
                    </label>
                  </div>
                </div>
                <Link href="/forgot-password" className="forgotpwd">
                  Forgot Password?
                </Link>
              </div>

              <div className="form-group">
                <button className="btn btn-login" type="submit">
                  Sign In
                </button>
              </div>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="newuser">
              Don't have an account?
              <a
                role="button"
                onClick={() => router.push("/register")}
                className="btn_register"
                style={{ cursor: "pointer" }}
              >
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}