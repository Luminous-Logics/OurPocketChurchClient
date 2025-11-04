// lib/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";
import { LoginData, RegisterData, AuthResponse } from "@/types";
import { setAccessToken, clearToken } from "../cookies";
import { httpPost } from "../api/server";

// Login - Server Action
export async function loginAction(data: LoginData) {
  const response = await httpPost<AuthResponse>(
    API_ENDPOINTS.AUTH.AUTH_LOGIN,
    data
  );

  if (response.success && response.data) {
    const { token, expires_in } = response.data;
    setAccessToken(token, expires_in);
  console.log(expires_in,"responsedddddddddddddd")

    return {
      success: true,
      data: response.data,
      message: "Login successful",
    };
  }
  return {
    success: false,
    message: response.message || "Login failed",
  };
}

// Register - Server Action
export async function registerAction(data: RegisterData) {
  const response = await httpPost<AuthResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    data
  );

  if (response.success && response.data) {
    const { token, expires_in } = response.data;
    setAccessToken(token, expires_in);

    return {
      success: true,
      data: response.data,
      message: "Registration successful",
    };
  }

  return {
    success: false,
    message: response.message || "Registration failed",
  };
}

// Clear token - Server Action (callable from client)
export async function clearTokenAction() {
  clearToken();
}

// Logout - Server Action
export async function logoutAction() {
  clearToken();
  redirect("/login");
}
