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
  const [success, setSuccess] = useState(""); // FIX 1: was missing
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateField = (name, value) => {
  setFieldErrors((prev) => ({
    ...prev,
    [name]: name === "email" ? validateEmail(value) : validatePassword(value),
  }));
};

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  
  setError(""); // 👈 add this — clears "Invalid credentials" on keystroke

  if (touched[name]) {
    validateField(name, value);
  }
};

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value); // FIX 2: reuse validateField instead of duplicating logic
  };

  const isFormValid = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    return !emailError && !passwordError && formData.email && formData.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);

      if (response.status === 200) {
        const { token } = response.data;

        if (token) {
          setSuccess("Login successful! Redirecting...");
          login(response.data, token);
          setTimeout(() => {
            navigate("/dashboard"); // FIX 3: use navigate instead of window.location.href
          }, 1500);
        }
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      if (err.response?.data?.message) {
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
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: "#1e3a8a" }}
          >
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

          {/* FIX 4: render success message so the redirect delay is meaningful */}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
          )}

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