"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/services/user-service";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateAadhar,
} from "@/lib/utils/form-validator";
import { handleError } from "@/lib/utils/error-handler";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    phone: "",
    aadharNumber: "",
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate form data
      validateEmail(formData.email);
      validatePassword(formData.password);
      validateName(formData.displayName);
      validatePhone(formData.phone);
      validateAadhar(formData.aadharNumber);

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      // Create user
      await createUser(formData.email, formData.password, {
        displayName: formData.displayName,
        phone: formData.phone,
        aadharNumber: formData.aadharNumber,
      });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      const errorDetails = handleError(err);
      setError(errorDetails.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      {/* Navigation Header */}
      <nav className="gov-header">
        <div className="bg-slate-800 text-white py-2 px-4 text-center text-sm">
          Government of India | Digital Document Management Portal
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className="emblem relative w-[50px] h-[50px]">
                <Image
                  src="/icon.svg"
                  alt="SecureDocShare Logo"
                  width={50}
                  height={50}
                  priority
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  SecureDocShare
                </h1>
                <p className="text-sm text-gray-600">
                  Digital Document Management
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="nav-link">
                Home
              </Link>
              <Link href="/login" className="btn btn-outline">
                Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-gray-700 hover:text-primary-600">
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary-600 text-white py-4 px-6">
            <h2 className="text-xl font-bold">Create New Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="py-6 px-8">
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="displayName"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Full Name:
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.displayName}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Phone Number:
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                pattern="[0-9]{10}"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="aadharNumber"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Aadhar Number:
              </label>
              <input
                type="text"
                id="aadharNumber"
                name="aadharNumber"
                required
                pattern="[0-9]{12}"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.aadharNumber}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-user-plus mr-2"></i> Register
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-800 font-bold"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
