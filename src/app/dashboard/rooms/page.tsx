"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  Bed,
  Users,
  Star
} from "lucide-react";

interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  status: string;
  description?: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockRooms: Room[] = [
      {
        id: "1",
        number: "101",
        type: "SINGLE",
        capacity: 1,
        price: 120,
        status: "AVAILABLE",
        description: "Comfortable single room with city view"
      },
      {
        id: "2",
        number: "102",
        type: "DOUBLE",
        capacity: 2,
        price: 180,
        status: "OCCUPIED",
        description: "Spacious double room with balcony"
      },
      {
        id: "3",
        number: "103",
        type: "SUITE",
        capacity: 4,
        price: 350,
        status: "MAINTENANCE",
        description: "Luxury suite with separate living area"
      },
      {
        id: "4",
        number: "201",
        type: "DELUXE",
        capacity: 2,
        price: 250,
        status: "AVAILABLE",
        description: "Deluxe room with premium amenities"
      },
      {
        id: "5",
        number: "202",
        type: "SINGLE",
        capacity: 1,
        price: 130,
        status: "RESERVED",
        description: "Single room with garden view"
      },
      {
        id: "6",
        number: "203",
        type: "DOUBLE",
        capacity: 2,
        price: 190,
        status: "AVAILABLE",
        description: "Double room with mountain view"
      }
    ];

    setRooms(mockRooms);
    setIsLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "OCCUPIED":
        return "bg-red-100 text-red-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "RESERVED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SINGLE":
        return <Bed className="h-5 w-5" />;
      case "DOUBLE":
        return <Users className="h-5 w-5" />;
      case "SUITE":
        return <Star className="h-5 w-5" />;
      case "DELUXE":
        return <Building2 className="h-5 w-5" />;
      default:
        return <Bed className="h-5 w-5" />;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Room Management</h1>
            </div>
            <Link
              href="/dashboard/rooms/new"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mr-3">
                      {getTypeIcon(room.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Room {room.number}</h3>
                      <p className="text-sm text-gray-500 capitalize">{room.type.toLowerCase()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="font-medium">{room.capacity} person{room.capacity > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">${room.price}/night</span>
                  </div>
                </div>

                {room.description && (
                  <p className="text-sm text-gray-600 mb-4">{room.description}</p>
                )}

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/rooms/${room.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/dashboard/rooms/${room.id}/edit`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
} 