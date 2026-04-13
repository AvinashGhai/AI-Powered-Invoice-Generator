import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, FileText } from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/authContext";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleInputChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  // Real-time validation
  if (touched[name]) {
    const newFieldErrors = { ...fieldErrors };

    if (name === "email") {
      newFieldErrors.email = validateEmail(value);
    } else if (name === "password") {
      newFieldErrors.password = validatePassword(value);
    }

    setFieldErrors(newFieldErrors);
  }
};

  const handleBlur = (e) => {
  const { name } = e.target;

  setTouched((prev) => ({
    ...prev,
    [name]: true,
  }));

  // Validate on blur
  const newFieldErrors = { ...fieldErrors };

  if (name === "email") {
    newFieldErrors.email = validateEmail(formData.email);
  } else if (name === "password") {
    newFieldErrors.password = validatePassword(formData.password);
  }

  setFieldErrors(newFieldErrors);
};

  const validateField = (name, value) => {
    let err = "";
    if (name === "email") {
      if (!value) err = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) err = "Invalid email format";
    }
    if (name === "password") {
      if (!value) err = "Password is required";
      else if (value.length < 6) err = "Password must be at least 6 characters";
    }
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const isFormValid = () =>
    formData.email && formData.password && !fieldErrors.email && !fieldErrors.password;

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate all fields before submission
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);

  if (emailError || passwordError) {
    setFieldErrors({
      email: emailError,
      password: passwordError,
    });

    setTouched({
      email: true,
      password: true,
    });

    return;
  }

  setIsLoading(true);
  setError("");
  setSuccess("");

  try {
    const response = await axiosInstance.post(
      API_PATHS.AUTH.LOGIN,
      formData
    );

    if (response.status === 200) {
      const { token } = response.data;

      if (token) {
        setSuccess("Login successful");

        // NOTE: your login takes (userData, token)
        login(response.data, token);

        // Redirect based on role
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    } else {
      setError(response.data.message || "Invalid credentials");
    }
  } catch (err) {
    if (
      err.response &&
      err.response.data &&
      err.response.data.message
    ) {
      setError(err.response.data.message);
    } else {
      setError("An error occurred during login.");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        {/* Icon + heading */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: "#1e3a8a" }}>
            <FileText className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Login to Your Account
          </h1>
          <p className="text-sm text-gray-500">Welcome back to Invoice Generator</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={`w-full pl-9 pr-4 py-3 text-sm border rounded-xl bg-white text-gray-900
                  placeholder-gray-400 outline-none transition-colors
                  focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10
                  ${fieldErrors.email && touched.email ? "border-red-400" : "border-gray-200"}`}
              />
            </div>
            {fieldErrors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`w-full pl-9 pr-10 py-3 text-sm border rounded-xl bg-white text-gray-900
                  placeholder-gray-400 outline-none transition-colors
                  focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10
                  ${fieldErrors.password && touched.password ? "border-red-400" : "border-gray-200"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && touched.password && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white
              flex items-center justify-center gap-2 transition-opacity
              hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#1e3a8a" }}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>Sign in <span className="text-base">→</span></>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-6 pt-5 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-gray-900 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;