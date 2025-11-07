/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import * as z from "zod";
import Link from "next/link";
import toaster from "@/lib/toastify";
import { useForm } from "react-hook-form";
import InputText from "../InputComponents/InputText";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const hookForm = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const { handleSubmit, setFocus } = hookForm;

  // Auto-focus email field on mount
  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const loginHandler = async (data: LoginFormType) => {
    try {
      setIsLoading(true);
      const resp = await loginAction(data);
      if (resp.success) {
        toaster.success("Welcome back! Redirecting to dashboard...");

        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem("rememberEmail", data.email);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        console.log("Logged in user:", resp.data?.user);
        setTimeout(() => router.push("/dashboard"), 500);
      } else {
        toaster.error(resp.message || "Invalid email or password. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      toaster.error("Unable to connect. Please check your internet and try again.");
      setIsLoading(false);
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberEmail");
    if (rememberedEmail) {
      hookForm.setValue("email", rememberedEmail);
      setRememberMe(true);
    }
  }, [hookForm]);

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

              <div className="feature-indicators" role="tablist" aria-label="Feature navigation">
                {features.map((feature, idx) => (
                  <button
                    key={idx}
                    className={`indicator ${idx === currentFeature ? 'active' : ''}`}
                    onClick={() => setCurrentFeature(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setCurrentFeature(idx);
                      }
                    }}
                    role="tab"
                    aria-label={`${feature.title}`}
                    aria-selected={idx === currentFeature}
                    tabIndex={idx === currentFeature ? 0 : -1}
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
              <p>Sign in to access your Parish Dashboard</p>
            </div>

            <form onSubmit={handleSubmit(loginHandler)}>
              {/* Email */}
              <div className="form-group">
                <InputText
                  hookForm={hookForm}
                  field="email"
                  label="Email Address"
                  labelMandatory
                  placeholder="your@email.com"
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  aria-label="Email address"
                />
              </div>

              {/* Password with Toggle */}
              <div className="form-group">
                <label className="form-control-label">
                  Password
                  <span className="text-danger">*</span>
                </label>
                <div className="password-input-wrapper">
                  <InputText
                    hookForm={hookForm}
                    field="password"
                    label=""
                    labelMandatory={false}
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={isLoading}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group d-flex justify-content-between align-items-center">
                <div>
                  <div className="form-check custom-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberme"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      aria-label="Remember my email"
                    />
                    <label className="form-check-label" htmlFor="rememberme">
                      Remember Me
                    </label>
                  </div>
                </div>
                <Link
                  href="/forgot-password"
                  className="forgotpwd"
                  tabIndex={0}
                  aria-label="Forgot your password?"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="form-group">
                <button
                  className="btn btn-login"
                  type="submit"
                  disabled={isLoading}
                  aria-label={isLoading ? "Signing in..." : "Sign in to your account"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="spinner-icon" size={18} />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <p className="newuser">
              New to Our Pocket Church?{" "}
              <a
                role="button"
                onClick={() => !isLoading && router.push("/register")}
                className="btn_register"
                style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                aria-label="Create a new account"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
                    e.preventDefault();
                    router.push("/register");
                  }
                }}
              >
                Create Account
              </a>
            </p>

            {/* Security Badge */}
            <div className="security-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Your data is secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}