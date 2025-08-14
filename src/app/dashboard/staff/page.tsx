'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  MessageSquare,
  Wrench,
  Bell,
  MapPin,
  Star,
  Download
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
}

interface CheckInOut {
  id: string;
  guestName: string;
  roomNumber: string;
  type: 'checkin' | 'checkout';
  scheduledTime: string;
  status: 'pending' | 'completed';
  specialRequests: string[];
}

export default function StaffDashboard() {
  const [guestRequests, setGuestRequests] = useState<GuestRequest[]>([]);
  const [checkInOuts, setCheckInOuts] = useState<CheckInOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        const mockGuestRequests: GuestRequest[] = [
          {
            id: '1',
            guestName: 'John Smith',
            roomNumber: '205',
            requestType: 'Room Service',
            description: 'Extra towels and toiletries needed',
            priority: 'medium',
            status: 'pending',
            timestamp: '15 minutes ago'
          },
          {
            id: '2',
            guestName: 'Sarah Johnson',
            roomNumber: '301',
            requestType: 'Maintenance',
            description: 'AC not working properly',
            priority: 'high',
            status: 'in-progress',
            timestamp: '1 hour ago'
          },
          {
            id: '3',
            guestName: 'Mike Davis',
            roomNumber: '102',
            requestType: 'Concierge',
            description: 'Restaurant reservation for tonight',
            priority: 'low',
            status: 'completed',
            timestamp: '2 hours ago'
          }
        ];

        const mockCheckInOuts: CheckInOut[] = [
          {
            id: '1',
            guestName: 'Emily Wilson',
            roomNumber: '201',
            type: 'checkin',
            scheduledTime: '2:00 PM',
            status: 'pending',
            specialRequests: ['Early check-in', 'Room upgrade if available']
          },
          {
            id: '2',
            guestName: 'David Brown',
            roomNumber: '105',
            type: 'checkout',
            scheduledTime: '11:00 AM',
            status: 'completed',
            specialRequests: ['Late checkout', 'Taxi to airport']
          },
          {
            id: '3',
            guestName: 'Lisa Garcia',
            roomNumber: '308',
            type: 'checkin',
            scheduledTime: '3:00 PM',
            status: 'pending',
            specialRequests: ['Accessible room', 'Extra pillows']
          }
        ];

        setGuestRequests(mockGuestRequests);
        setCheckInOuts(mockCheckInOuts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">Daily operations and guest services</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Daily Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {guestRequests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-600">Guest requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checkInOuts.filter(c => c.type === 'checkin' && c.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-600">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-outs</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checkInOuts.filter(c => c.type === 'checkout' && c.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-600">Scheduled</p>
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
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Guest Requests</TabsTrigger>
          <TabsTrigger value="checkins">Check-ins/Check-outs</TabsTrigger>
          <TabsTrigger value="operations">Daily Operations</TabsTrigger>
          <TabsTrigger value="tools">Staff Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guest Requests</CardTitle>
              <CardDescription>Manage guest service requests and maintenance issues</CardDescription>
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
                      </div>
                      <h4 className="font-semibold mt-2">
                        {request.guestName} - Room {request.roomNumber}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>{request.requestType}:</strong> {request.description}
                      </p>
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
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check-ins & Check-outs</CardTitle>
              <CardDescription>Today's scheduled arrivals and departures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkInOuts.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge variant={check.type === 'checkin' ? 'default' : 'secondary'}>
                          {check.type === 'checkin' ? 'Check-in' : 'Check-out'}
                        </Badge>
                        <Badge variant={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{check.scheduledTime}</span>
                      </div>
                      <h4 className="font-semibold mt-2">
                        {check.guestName} - Room {check.roomNumber}
                      </h4>
                      {check.specialRequests.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Special Requests:</strong>
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {check.specialRequests.map((request, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {request}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {check.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          Process
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

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Room Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Room Status Overview</CardTitle>
                <CardDescription>Current room availability and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Available
                    </span>
                    <Badge variant="default">15</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      Occupied
                    </span>
                    <Badge variant="secondary">25</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      Maintenance
                    </span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      Reserved
                    </span>
                    <Badge variant="outline">2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common operational tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  Update Room Status
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="w-4 h-4 mr-2" />
                  Report Maintenance Issue
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Guest Lookup
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Communication Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Tools</CardTitle>
                <CardDescription>Stay connected with guests and staff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Guest Message
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Guest
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="w-4 h-4 mr-2" />
                  Broadcast Announcement
                </Button>
              </CardContent>
            </Card>

            {/* Information Access */}
            <Card>
              <CardHeader>
                <CardTitle>Information Access</CardTitle>
                <CardDescription>Quick access to hotel information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Hotel Map & Amenities
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Local Attractions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Event Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
