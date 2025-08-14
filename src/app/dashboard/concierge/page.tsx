'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Star, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Car,
  Plane,
  Train,
  Bus,
  Calendar,
  Gift,
  Heart,
  Download,
  Settings
} from 'lucide-react';

interface GuestRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  requestType: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  timestamp: string;
  estimatedTime?: string;
  specialNotes?: string;
}

interface TransportationRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  type: 'airport' | 'local' | 'long-distance';
  pickupTime: string;
  destination: string;
  passengers: number;
  status: 'pending' | 'confirmed' | 'completed';
  specialRequests: string[];
}

interface ExternalService {
  id: string;
  name: string;
  category: string;
  contact: string;
  rating: number;
  availability: string;
  specialNotes: string;
}

export default function ConciergeDashboard() {
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([]);
  const [transportationRequests, setTransportationRequests] = useState<TransportationRequest[]>([]);
  const [externalServices, setExternalServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        const mockGuestRequests: GuestRequest[] = [
          {
            id: '1',
            guestName: 'Emily Wilson',
            roomNumber: '201',
            requestType: 'Restaurant Reservation',
            description: 'Table for 4 at Italian restaurant, tonight at 8 PM',
            priority: 'medium',
            status: 'completed',
            timestamp: '2 hours ago',
            specialNotes: 'Guest prefers window seat, vegetarian options needed'
          },
          {
            id: '2',
            guestName: 'David Brown',
            roomNumber: '105',
            requestType: 'Tour Booking',
            description: 'City walking tour for tomorrow morning',
            priority: 'high',
            status: 'in-progress',
            timestamp: '1 hour ago',
            estimatedTime: '1 hour',
            specialNotes: 'Guest has mobility concerns, needs accessible tour'
          },
          {
            id: '3',
            guestName: 'Lisa Garcia',
            roomNumber: '308',
            requestType: 'Spa Appointment',
            description: 'Couples massage for Saturday afternoon',
            priority: 'low',
            status: 'pending',
            timestamp: 'Just now',
            specialNotes: 'Guest is pregnant, needs pregnancy-safe treatments'
          }
        ];

        const mockTransportationRequests: TransportationRequest[] = [
          {
            id: '1',
            guestName: 'John Smith',
            roomNumber: '205',
            type: 'airport',
            pickupTime: 'Tomorrow 6:00 AM',
            destination: 'International Airport',
            passengers: 2,
            status: 'confirmed',
            specialRequests: ['Early pickup', 'Extra luggage space']
          },
          {
            id: '2',
            guestName: 'Sarah Johnson',
            roomNumber: '301',
            type: 'local',
            pickupTime: 'Today 2:00 PM',
            destination: 'Downtown Shopping District',
            passengers: 1,
            status: 'pending',
            specialRequests: ['Shopping tour guide', 'Return pickup at 6 PM']
          }
        ];

        const mockExternalServices: ExternalService[] = [
          {
            id: '1',
            name: 'Luxury Limo Service',
            category: 'Transportation',
            contact: '+1-555-0123',
            rating: 4.8,
            availability: '24/7',
            specialNotes: 'Premium vehicles, professional drivers, airport transfers'
          },
          {
            id: '2',
            name: 'Elite Spa & Wellness',
            category: 'Wellness',
            contact: '+1-555-0456',
            rating: 4.9,
            availability: '9 AM - 8 PM',
            specialNotes: 'Luxury treatments, couples packages, mobile services'
          },
          {
            id: '3',
            name: 'Gourmet Catering Co.',
            category: 'Dining',
            contact: '+1-555-0789',
            rating: 4.7,
            availability: '7 AM - 10 PM',
            specialNotes: 'In-room dining, special diets, wine pairing'
          }
        ];

        setGuestRequests(mockGuestRequests);
        setTransportationRequests(mockTransportationRequests);
        setExternalServices(mockExternalServices);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getTransportationIcon = (type: string) => {
    switch (type) {
      case 'airport': return <Plane className="w-4 h-4" />;
      case 'local': return <Car className="w-4 h-4" />;
      case 'long-distance': return <Train className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Concierge Dashboard</h1>
          <p className="text-gray-600">Exceptional guest services and special requests</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Contact Services
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Service Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {guestRequests.filter(r => r.status !== 'completed').length}
            </div>
            <p className="text-xs text-gray-600">Pending & in-progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transportation</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transportationRequests.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-600">Pending bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {guestRequests.filter(r => r.priority === 'high').length}
            </div>
            <p className="text-xs text-gray-600">Urgent requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {guestRequests.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-xs text-gray-600">Requests fulfilled</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Guest Requests</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="services">External Services</TabsTrigger>
          <TabsTrigger value="tools">Concierge Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guest Service Requests</CardTitle>
              <CardDescription>Manage special requests and coordinate services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guestRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{request.timestamp}</span>
                        {request.estimatedTime && (
                          <span className="text-sm text-blue-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {request.estimatedTime}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold mt-2">
                        {request.guestName} - Room {request.roomNumber}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>{request.requestType}:</strong> {request.description}
                      </p>
                      {request.specialNotes && (
                        <p className="text-sm text-orange-600 mt-2">
                          <strong>Notes:</strong> {request.specialNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          Start
                        </Button>
                      )}
                      {request.status === 'in-progress' && (
                        <Button size="sm" variant="outline">
                          Complete
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transportation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transportation Services</CardTitle>
              <CardDescription>Coordinate airport transfers and local transportation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transportationRequests.map((transport) => (
                  <div key={transport.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getTransportationIcon(transport.type)}
                          <Badge variant={getStatusColor(transport.status)}>
                            {transport.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{transport.pickupTime}</span>
                      </div>
                      <h4 className="font-semibold mt-2">
                        {transport.guestName} - Room {transport.roomNumber}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Destination:</strong> {transport.destination}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Passengers:</strong> {transport.passengers}
                      </p>
                      {transport.specialRequests.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Special Requests:</strong>
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {transport.specialRequests.map((request, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {request}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {transport.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          Confirm
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Service Partners</CardTitle>
              <CardDescription>Trusted partners for exceptional guest experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {externalServices.map((service) => (
                  <Card key={service.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{service.rating}</span>
                        </div>
                      </div>
                      <CardDescription className="text-sm">
                        {service.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{service.contact}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{service.availability}</span>
                        </div>
                        <p className="text-gray-600 text-xs">{service.specialNotes}</p>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common concierge tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Restaurant
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Car className="w-4 h-4 mr-2" />
                  Arrange Transportation
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Gift className="w-4 h-4 mr-2" />
                  Send Gift to Room
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Book Spa Treatment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Local Recommendations
                </Button>
              </CardContent>
            </Card>

            {/* Information Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Information Resources</CardTitle>
                <CardDescription>Quick access to guest information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Guest Directory
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Event Calendar
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Area Map & Attractions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Restaurant Guide
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Service Directory
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
