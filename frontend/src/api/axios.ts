import axios from "axios";
import { Capacitor } from "@capacitor/core";

// ============================================================================
// Runtime Information
// ============================================================================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("================================================");
console.log("🚀 APPLICATION STARTED");
console.log("Platform          :", Capacitor.getPlatform());
console.log("Is Native         :", Capacitor.isNativePlatform());
console.log("API Base URL      :", API_BASE_URL ?? "❌ UNDEFINED");
console.log("User Agent        :", navigator.userAgent);
console.log("Current Origin    :", window.location.origin);
console.log("================================================");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("✅ Axios created");
console.log("Base URL:", api.defaults.baseURL);

// ============================================================================
// Request Interceptor
// ============================================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.group("🚀 API REQUEST");
    console.log("Method      :", config.method?.toUpperCase());
    console.log("Base URL    :", config.baseURL);
    console.log("Endpoint    :", config.url);
    console.log("Full URL    :", `${config.baseURL}${config.url}`);
    console.log("Headers     :", config.headers);
    console.log("Token Exists:", !!token);

    if (config.data) {
      console.log("Payload     :", config.data);
    }

    console.groupEnd();

    return config;
  },
  (error) => {
    console.error("❌ REQUEST CREATION FAILED");
    console.error(error);
    return Promise.reject(error);
  },
);

// ============================================================================
// Response Interceptor
// ============================================================================
api.interceptors.response.use(
  (response) => {
    console.group("✅ API RESPONSE");
    console.log("Status :", response.status);
    console.log("URL    :", response.config.url);
    console.log("Body   :", response.data);
    console.groupEnd();

    return response;
  },
  (error) => {
    console.group("❌ API ERROR");

    console.log("Message :", error.message);
    console.log("Code    :", error.code);

    if (error.config) {
      console.log("URL     :", `${error.config.baseURL}${error.config.url}`);
      console.log("Method  :", error.config.method);
      console.log("Headers :", error.config.headers);

      if (error.config.data) {
        console.log("Payload :", error.config.data);
      }
    }

    if (error.response) {
      console.log("HTTP Status :", error.response.status);
      console.log("Response    :", error.response.data);

      if (error.response.status === 401) {
        console.log("Removing expired token");
        localStorage.removeItem("token");
      }
    } else if (error.request) {
      console.error("⚠️ REQUEST REACHED AXIOS BUT NO RESPONSE");
      console.log("This usually indicates:");
      console.log("- Network connectivity problem");
      console.log("- SSL/TLS handshake failure");
      console.log("- DNS lookup failure");
      console.log("- Backend unreachable");
      console.log("- Android network security issue");
      console.log("- Request blocked before response");
    } else {
      console.error("⚠️ AXIOS CONFIGURATION ERROR");
    }

    console.log("Complete Error Object:");
    console.log(error);

    console.groupEnd();

    return Promise.reject(error);
  },
);

export default api;
