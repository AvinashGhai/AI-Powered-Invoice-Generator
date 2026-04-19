import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { Loader2, User, Mail, Building, Phone, MapPin } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

import InputField from "../../components/UI/inputField";
import TextareaField from "../../components/UI/TextAreaField";

const ProfilePage = () => {
  const { user, loading, updateUser } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    address: "",
    phone: "",
  });

  // ✅ Set user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        businessName: user.businessName || "",
        address: user.address || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // ✅ Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        formData
      );

      updateUser(response.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500">
          Manage your personal and business information
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleUpdateProfile}
        className="bg-white p-6 rounded-xl shadow-sm border space-y-6"
      >
        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              disabled
              className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
            />
          </div>
        </div>

        {/* Full Name */}
        <InputField
          label="Full Name"
          name="name"
          icon={User}
          type="text"
          value={formData.name ?? ""}
          onChange={handleInputChange}
        />

        {/* Business Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Business Information
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This will be used to pre-fill your invoices
          </p>

          <div className="space-y-4">
            <InputField
              label="Business Name"
              name="businessName"
              icon={Building}
              type="text"
              value={formData.businessName ?? ""}
              onChange={handleInputChange}
            />

            <TextareaField
              label="Address"
              name="address"
              icon={MapPin}
              value={formData.address ?? ""}
              onChange={handleInputChange}
            />

            <InputField
              label="Phone"
              name="phone"
              icon={Phone}
              type="tel"
              value={formData.phone ?? ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;