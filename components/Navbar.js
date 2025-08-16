"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import Image from 'next/image';
import GoogleDriveStatus from './GoogleDriveStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFolder, faBell, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { handleLogout as handleLogoutActivity } from '@/lib/services/auth-service';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  let pathname = "/";
  try {
    const maybeUsePathname = usePathname;
    pathname =
      typeof maybeUsePathname === "function" ? maybeUsePathname() : "/";
  } catch (e) {
    pathname = "/";
  }
  const router = useRouter();

  const isActive = (path) => pathname === path;

  const handleLogout = async () => {
    try {
      const currentUser = auth.currentUser;
      await auth.signOut();
      if (currentUser) {
        await handleLogoutActivity(currentUser);
      }
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
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
              <Link href="/dashboard" className="hover:opacity-75">
                <h1 className="text-xl font-bold text-gray-900">
                  SecureDocShare
                </h1>
                <p className="text-sm text-gray-600">
                  Digital Document Management
                </p>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Dashboard
            </Link>
            <Link
              href="/documents"
              className={`nav-link ${isActive("/documents") ? "active" : ""}`}
            >
              <FontAwesomeIcon icon={faFolder} className="mr-2" />
              My Documents
            </Link>
            {/* Icons only for notifications, drive, profile */}
            <Link
              href="/notifications"
              className={`nav-link p-2 rounded-full hover:bg-gray-100 ${isActive("/notifications") ? "bg-gray-200" : ""}`}
              title="Notifications"
            >
              <FontAwesomeIcon icon={faBell} className="text-lg" />
            </Link>
            <div title="Google Drive Status">
              <GoogleDriveStatus />
            </div>
            <Link
              href="/profile"
              className={`nav-link p-2 rounded-full hover:bg-gray-100 ${isActive("/profile") ? "bg-gray-200" : ""}`}
              title="Profile"
            >
              <FontAwesomeIcon icon={faUser} className="text-lg" />
            </Link>
            <button onClick={handleLogout} className="btn btn-outline ml-2" title="Logout">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faSignOutAlt : faHome} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <Link
              href="/dashboard"
              className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                isActive("/dashboard") ? "font-bold" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/documents"
              className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                isActive("/documents") ? "font-bold" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Documents
            </Link>
            <Link
              href="/notifications"
              className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                isActive("/notifications") ? "font-bold" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Notifications
            </Link>
            <Link
              href="/profile"
              className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                isActive("/profile") ? "font-bold" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="px-4 py-2 border-t border-gray-200">
              <GoogleDriveStatus />
            </div>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
