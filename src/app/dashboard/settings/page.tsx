'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Clock, 
  Bell, 
  Shield, 
  Wrench, 
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SystemSettings {
  hotel: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    timezone: string;
    currency: string;
  };
  booking: {
    checkInTime: string;
    checkOutTime: string;
    maxAdvanceBooking: number;
    minAdvanceBooking: number;
    allowSameDayBooking: boolean;
    requireDeposit: boolean;
    depositPercentage: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    bookingConfirmations: boolean;
    paymentReminders: boolean;
    checkInReminders: boolean;
    checkOutReminders: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireTwoFactor: boolean;
    passwordMinLength: number;
    passwordComplexity: string;
  };
  maintenance: {
    maintenanceMode: boolean;
    maintenanceMessage: string;
    scheduledMaintenance: boolean;
    maintenanceStartTime: string | null;
    maintenanceEndTime: string | null;
  };
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        await fetchSettings(); // Refresh settings
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings' });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Error updating settings' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSave = () => {
    if (settings) {
      updateSettings(settings);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Failed to load settings</h2>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
          <Button onClick={fetchSettings} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure application settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <Tabs defaultValue="hotel" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hotel" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hotel</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Booking</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center space-x-2">
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Maintenance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Information</CardTitle>
              <CardDescription>Basic hotel details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={settings.hotel.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      hotel: { ...settings.hotel, name: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.hotel.address}
                    onChange={(e) => setSettings({
                      ...settings,
                      hotel: { ...settings.hotel, address: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.hotel.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      hotel: { ...settings.hotel, phone: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.hotel.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      hotel: { ...settings.hotel, email: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={settings.hotel.website}
                    onChange={(e) => setSettings({
                      ...settings,
                      hotel: { ...settings.hotel, website: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={settings.hotel.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      hotel: { ...settings.hotel, timezone: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="UTC-8">UTC-8 (PST)</option>
                    <option value="UTC-7">UTC-7 (MST)</option>
                    <option value="UTC-6">UTC-6 (CST)</option>
                    <option value="UTC-5">UTC-5 (EST)</option>
                    <option value="UTC+0">UTC (GMT)</option>
                    <option value="UTC+1">UTC+1 (CET)</option>
                    <option value="UTC+2">UTC+2 (EET)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Configuration</CardTitle>
              <CardDescription>Configure booking policies and procedures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={settings.booking.checkInTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, checkInTime: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={settings.booking.checkOutTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, checkOutTime: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    value={settings.booking.maxAdvanceBooking}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, maxAdvanceBooking: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    value={settings.booking.minAdvanceBooking}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, minAdvanceBooking: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowSameDay"
                    checked={settings.booking.allowSameDayBooking}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, allowSameDayBooking: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="allowSameDay" className="text-sm font-medium text-gray-700">
                    Allow Same Day Booking
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireDeposit"
                    checked={settings.booking.requireDeposit}
                    onChange={(e) => setSettings({
                      ...settings,
                      booking: { ...settings.booking, requireDeposit: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="requireDeposit" className="text-sm font-medium text-gray-700">
                    Require Deposit
                  </label>
                </div>
                {settings.booking.requireDeposit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit Percentage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.booking.depositPercentage}
                      onChange={(e) => setSettings({
                        ...settings,
                        booking: { ...settings.booking, depositPercentage: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure system notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
                    SMS Notifications
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bookingConfirmations"
                    checked={settings.notifications.bookingConfirmations}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, bookingConfirmations: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="bookingConfirmations" className="text-sm font-medium text-gray-700">
                    Booking Confirmations
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="paymentReminders"
                    checked={settings.notifications.paymentReminders}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, paymentReminders: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="paymentReminders" className="text-sm font-medium text-gray-700">
                    Payment Reminders
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="checkInReminders"
                    checked={settings.notifications.checkInReminders}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, checkInReminders: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="checkInReminders" className="text-sm font-medium text-gray-700">
                    Check-in Reminders
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="checkOutReminders"
                    checked={settings.notifications.checkOutReminders}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, checkOutReminders: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="checkOutReminders" className="text-sm font-medium text-gray-700">
                    Check-out Reminders
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Min Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Complexity
                  </label>
                  <select
                    value={settings.security.passwordComplexity}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordComplexity: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireTwoFactor"
                    checked={settings.security.requireTwoFactor}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, requireTwoFactor: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="requireTwoFactor" className="text-sm font-medium text-gray-700">
                    Require Two-Factor Authentication
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Configure system maintenance and downtime</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.maintenance.maintenanceMode}
                    onChange={(e) => setSettings({
                      ...settings,
                      maintenance: { ...settings.maintenance, maintenanceMode: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                    Enable Maintenance Mode
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="scheduledMaintenance"
                    checked={settings.maintenance.scheduledMaintenance}
                    onChange={(e) => setSettings({
                      ...settings,
                      maintenance: { ...settings.maintenance, scheduledMaintenance: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <label htmlFor="scheduledMaintenance" className="text-sm font-medium text-gray-700">
                    Scheduled Maintenance
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Message
                  </label>
                  <textarea
                    value={settings.maintenance.maintenanceMessage}
                    onChange={(e) => setSettings({
                      ...settings,
                      maintenance: { ...settings.maintenance, maintenanceMessage: e.target.value }
                    })}
                    rows={3}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter maintenance message for users..."
                  />
                </div>
                {settings.maintenance.scheduledMaintenance && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={settings.maintenance.maintenanceStartTime || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          maintenance: { ...settings.maintenance, maintenanceStartTime: e.target.value }
                        })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={settings.maintenance.maintenanceEndTime || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          maintenance: { ...settings.maintenance, maintenanceEndTime: e.target.value }
                        })}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
