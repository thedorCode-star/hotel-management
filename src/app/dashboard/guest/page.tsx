'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Star, 
  Gift, 
  Phone, 
  MessageSquare, 
  Wrench,
  Bell,
  MapPin,
  Clock,
  CreditCard,
  Key,
  Heart,
  Download,
  Settings,
  Plus,
  ShoppingBag,
  Car
} from 'lucide-react';

interface LoyaltyInfo {
  points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  nextTierPoints: number;
  benefits: string[];
}

interface ServiceRequest {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp: string;
  estimatedTime?: string;
}

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  category: string;
}

export default function GuestDashboard() {
  const [loyaltyInfo, setLoyaltyInfo] = useState<LoyaltyInfo | null>(null);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        const mockLoyaltyInfo: LoyaltyInfo = {
          points: 1250,
          tier: 'SILVER',
          nextTierPoints: 500,
          benefits: [
            'Free WiFi',
            'Late checkout (1 PM)',
            'Welcome drink',
            'Room upgrade (subject to availability)'
          ]
        };

        const mockServiceRequests: ServiceRequest[] = [
          {
            id: '1',
            type: 'Room Service',
            description: 'Breakfast delivery - Continental breakfast for 2',
            status: 'completed',
            timestamp: '2 hours ago'
          },
          {
            id: '2',
            type: 'Maintenance',
            description: 'AC temperature adjustment needed',
            status: 'in-progress',
            timestamp: '1 hour ago',
            estimatedTime: '30 minutes'
          },
          {
            id: '3',
            type: 'Concierge',
            description: 'Restaurant reservation for tonight at 8 PM',
            status: 'pending',
            timestamp: 'Just now'
          }
        ];

        const mockSpecialOffers: SpecialOffer[] = [
          {
            id: '1',
            title: 'Weekend Getaway',
            description: 'Book 2 nights, get 1 night free',
            discount: '33% OFF',
            validUntil: 'Dec 31, 2024',
            category: 'Accommodation'
          },
          {
            id: '2',
            title: 'Spa Package',
            description: 'Relaxing massage and facial treatment',
            discount: '25% OFF',
            validUntil: 'Jan 15, 2025',
            category: 'Wellness'
          },
          {
            id: '3',
            title: 'Dining Credit',
            description: '$50 credit at our signature restaurant',
            discount: 'Free',
            validUntil: 'Jan 31, 2025',
            category: 'Dining'
          }
        ];

        setLoyaltyInfo(mockLoyaltyInfo);
        setServiceRequests(mockServiceRequests);
        setSpecialOffers(mockSpecialOffers);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'GOLD': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'SILVER': return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 'BRONZE': return 'bg-gradient-to-r from-orange-600 to-red-600';
      default: return 'bg-gray-200';
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
          <h1 className="text-3xl font-bold text-gray-900">Guest Dashboard</h1>
          <p className="text-gray-600">Your personalized hotel experience</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      {/* Loyalty Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Loyalty Program</CardTitle>
              <CardDescription>Earn points and unlock exclusive benefits</CardDescription>
            </div>
            <div className={`px-4 py-2 rounded-full text-white font-semibold ${getTierColor(loyaltyInfo?.tier || '')}`}>
              {loyaltyInfo?.tier}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{loyaltyInfo?.points}</div>
              <p className="text-sm text-gray-600">Current Points</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{loyaltyInfo?.nextTierPoints}</div>
              <p className="text-sm text-gray-600">Points to Next Tier</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">4</div>
              <p className="text-sm text-gray-600">Active Benefits</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Your Benefits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {loyaltyInfo?.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button className="h-20 flex-col justify-center" variant="outline">
          <Phone className="w-6 h-6 mb-2" />
          <span className="text-sm">Call Front Desk</span>
        </Button>
        <Button className="h-20 flex-col justify-center" variant="outline">
          <MessageSquare className="w-6 h-6 mb-2" />
          <span className="text-sm">Send Message</span>
        </Button>
        <Button className="h-20 flex-col justify-center" variant="outline">
          <Wrench className="w-6 h-6 mb-2" />
          <span className="text-sm">Report Issue</span>
        </Button>
        <Button className="h-20 flex-col justify-center" variant="outline">
          <MapPin className="w-6 h-6 mb-2" />
          <span className="text-sm">Hotel Map</span>
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Service Requests</TabsTrigger>
          <TabsTrigger value="offers">Special Offers</TabsTrigger>
          <TabsTrigger value="amenities">Hotel Amenities</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Requests</CardTitle>
              <CardDescription>Track your service requests and get updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{request.timestamp}</span>
                        {request.estimatedTime && (
                          <span className="text-sm text-blue-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {request.estimatedTime}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold mt-2">{request.type}</h4>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <Button size="sm" variant="outline">
                          Cancel
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Service Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Special Offers</CardTitle>
              <CardDescription>Exclusive deals and promotions just for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialOffers.map((offer) => (
                  <Card key={offer.id} className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="font-bold">
                          {offer.discount}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {offer.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>Valid until: {offer.validUntil}</span>
                        <Badge variant="outline">{offer.category}</Badge>
                      </div>
                      <Button className="w-full" size="sm">
                        <Gift className="w-4 h-4 mr-2" />
                        Claim Offer
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amenities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotel Services */}
            <Card>
              <CardHeader>
                <CardTitle>Hotel Services</CardTitle>
                <CardDescription>Available services and amenities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Spa & Wellness
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fitness Center
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Swimming Pool
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Restaurant & Bar
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="w-4 h-4 mr-2" />
                  Business Center
                </Button>
              </CardContent>
            </Card>

            {/* Local Information */}
            <Card>
              <CardHeader>
                <CardTitle>Local Information</CardTitle>
                <CardDescription>Discover the area around the hotel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Tourist Attractions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Restaurants & Cafes
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shopping Centers
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Car className="w-4 h-4 mr-2" />
                  Transportation
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Local Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
              <CardDescription>Customize your stay experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Room Temperature</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Cool (20°C)</option>
                      <option>Moderate (22°C)</option>
                      <option>Warm (24°C)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pillow Type</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Soft</option>
                      <option>Medium</option>
                      <option>Firm</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Requests</label>
                  <textarea 
                    className="w-full p-2 border rounded-md" 
                    rows={3}
                    placeholder="Any special requests for your stay..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="newsletter" className="rounded" />
                  <label htmlFor="newsletter" className="text-sm">
                    Receive special offers and updates
                  </label>
                </div>

                <Button className="w-full">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
