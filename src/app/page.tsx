import Link from "next/link";
import { Building2, Calendar, Users, Star, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Hotel Management</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/auth/login"
                className="flex items-center px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Our Hotel Management System
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your hotel operations with our comprehensive management platform. 
            Handle bookings, manage rooms, and provide exceptional guest experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Management</h3>
            <p className="text-gray-600">
              Efficiently manage reservations, check-ins, and check-outs with our intuitive booking system.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Management</h3>
            <p className="text-gray-600">
              Track room availability, maintenance status, and room types with real-time updates.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Guest Services</h3>
            <p className="text-gray-600">
              Manage guest profiles, preferences, and provide personalized services.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews & Ratings</h3>
            <p className="text-gray-600">
              Collect and manage guest feedback to improve service quality and satisfaction.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Link
            href="/auth/register"
            className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold"
          >
            Get Started Today
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2025 Hotel Thedor Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
