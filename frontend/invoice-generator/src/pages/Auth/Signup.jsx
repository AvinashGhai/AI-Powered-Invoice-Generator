import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, FileText, User } from "lucide-react";
import { API_PATHS } from "../../utils/apiPaths";
import { useAuth } from "../../context/authContext";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateName = (name) => {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (name.length > 50) return "Name must be less than 50 characters";
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  const validateField = (name, value, currentFormData) => {
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (name === "name") updated.name = validateName(value);
      if (name === "email") updated.email = validateEmail(value);
      if (name === "password") {
        updated.password = validatePassword(value);
        if (currentFormData?.confirmPassword) {
          updated.confirmPassword = validateConfirmPassword(
            currentFormData.confirmPassword,
            value
          );
        }
      }
      if (name === "confirmPassword") {
        updated.confirmPassword = validateConfirmPassword(
          value,
          currentFormData?.password || ""
        );
      }
      return updated;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setError("");
    if (touched[name]) {
      validateField(name, value, updatedFormData);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value, formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setFieldErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      setTouched({ name: true, email: true, password: true, confirmPassword: true });
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        const { token, ...userData } = response.data;

        if (token) {
          setSuccess("Account created successfully!");
          setFormData({ name: "", email: "", password: "", confirmPassword: "" });
          setTouched({ name: false, email: false, password: false, confirmPassword: false });
          setAgreedToTerms(false);
          login(userData, token);
          navigate("/dashboard");
        }
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("API error:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: "#1e3a8a" }}
          >
            <FileText className="text-white" size={26} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Account</h1>
          <p className="text-sm text-gray-400">Join Invoice Generator today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className={`w-full pl-9 pr-4 py-3 text-sm border rounded-2xl bg-white text-gray-900
                  placeholder-gray-300 outline-none transition-colors
                  focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10
                  ${fieldErrors.name && touched.name ? "border-red-400" : "border-gray-200"}`}
              />
            </div>
            {fieldErrors.name && touched.name && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

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
                className={`w-full pl-9 pr-4 py-3 text-sm border rounded-2xl bg-white text-gray-900
                  placeholder-gray-300 outline-none transition-colors
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
                placeholder="Min. 6 characters"
                className={`w-full pl-9 pr-10 py-3 text-sm border rounded-2xl bg-white text-gray-900
                  placeholder-gray-300 outline-none transition-colors
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Re-enter your password"
                className={`w-full pl-9 pr-10 py-3 text-sm border rounded-2xl bg-white text-gray-900
                  placeholder-gray-300 outline-none transition-colors
                  focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10
                  ${fieldErrors.confirmPassword && touched.confirmPassword
                    ? "border-red-400"
                    : "border-gray-200"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && touched.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms of Service */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked) setError("");
              }}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: "#1e3a8a" }}
            />
            <label htmlFor="terms" className="text-sm text-gray-500 cursor-pointer">
              I agree to the{" "}
              <Link to="/terms" className="font-semibold text-gray-900 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-semibold text-gray-900 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Success */}
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
            className="w-full py-3 rounded-2xl text-sm font-semibold text-white
              flex items-center justify-center gap-2 transition-opacity
              hover:opacity-90 disabled:opacity-60 mt-2"
            style={{ backgroundColor: "#1e3a8a" }}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>Create Account <span className="text-base">→</span></>
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="border-t border-gray-200 mt-6 pt-5 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SignUp;