export enum Permission {
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_STAFF_SCHEDULES = 'manage_staff_schedules',
  
  // Room Management
  VIEW_ROOMS = 'view_rooms',
  CREATE_ROOMS = 'create_rooms',
  EDIT_ROOMS = 'edit_rooms',
  DELETE_ROOMS = 'delete_rooms',
  MANAGE_ROOM_STATUS = 'manage_room_status',
  MANAGE_INVENTORY = 'manage_inventory',
  MANAGE_PRICING = 'manage_pricing',
  
  // Booking Management
  VIEW_BOOKINGS = 'view_bookings',
  CREATE_BOOKINGS = 'create_bookings',
  EDIT_BOOKINGS = 'edit_bookings',
  DELETE_BOOKINGS = 'delete_bookings',
  MANAGE_CHECKINS = 'manage_checkins',
  MANAGE_CHECKOUTS = 'manage_checkouts',
  VIEW_ALL_BOOKINGS = 'view_all_bookings',
  MANAGE_GUEST_REQUESTS = 'manage_guest_requests',
  
  // Payment Management
  VIEW_PAYMENTS = 'view_payments',
  PROCESS_PAYMENTS = 'process_payments',
  REFUND_PAYMENTS = 'refund_payments',
  VIEW_PAYMENT_HISTORY = 'view_payment_history',
  APPROVE_REFUNDS = 'approve_refunds',
  
  // Financial & Analytics
  VIEW_FINANCIAL_DATA = 'view_financial_data',
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
  VIEW_PERFORMANCE_METRICS = 'view_performance_metrics',
  
  // Reviews & Feedback
  VIEW_REVIEWS = 'view_reviews',
  MODERATE_REVIEWS = 'moderate_reviews',
  DELETE_REVIEWS = 'delete_reviews',
  VIEW_CUSTOMER_FEEDBACK = 'view_customer_feedback',
  
  // System Settings
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_LOGS = 'view_logs',
  
  // Profile Management
  EDIT_OWN_PROFILE = 'edit_own_profile',
  VIEW_OWN_BOOKINGS = 'view_own_bookings',
  VIEW_OWN_PAYMENTS = 'view_own_payments',
  
  // Guest Services
  VIEW_BOOKING_HISTORY = 'view_booking_history',
  VIEW_LOYALTY_POINTS = 'view_loyalty_points',
  REQUEST_ROOM_SERVICE = 'request_room_service',
  REPORT_MAINTENANCE_ISSUES = 'report_maintenance_issues',
  VIEW_HOTEL_AMENITIES = 'view_hotel_amenities',
  ACCESS_CONCIERGE_SERVICES = 'access_concierge_services',
  VIEW_SPECIAL_OFFERS = 'view_special_offers',
  MANAGE_NOTIFICATIONS = 'manage_notifications',
  ACCESS_DIGITAL_KEY = 'access_digital_key',
  VIEW_BILLING_DETAILS = 'view_billing_details',
  
  // Staff Operations
  VIEW_MAINTENANCE_REQUESTS = 'view_maintenance_requests',
  CREATE_INCIDENT_REPORTS = 'create_incident_reports',
  VIEW_DAILY_OCCUPANCY = 'view_daily_occupancy',
  MANAGE_ROOM_SERVICES = 'manage_room_services',
  
  // Concierge Services
  MANAGE_TRANSPORTATION = 'manage_transportation',
  ACCESS_EXTERNAL_SERVICES = 'access_external_services',
  VIEW_GUEST_PREFERENCES = 'view_guest_preferences',
  MANAGE_SPECIAL_REQUESTS = 'manage_special_requests',
  
  // Loyalty & Marketing
  MANAGE_LOYALTY_PROGRAM = 'manage_loyalty_program',
  MANAGE_SPECIAL_OFFERS = 'manage_special_offers',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    // Full access to everything
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_STAFF_SCHEDULES,
    Permission.VIEW_ROOMS,
    Permission.CREATE_ROOMS,
    Permission.EDIT_ROOMS,
    Permission.DELETE_ROOMS,
    Permission.MANAGE_ROOM_STATUS,
    Permission.MANAGE_INVENTORY,
    Permission.MANAGE_PRICING,
    Permission.VIEW_BOOKINGS,
    Permission.CREATE_BOOKINGS,
    Permission.EDIT_BOOKINGS,
    Permission.DELETE_BOOKINGS,
    Permission.MANAGE_CHECKINS,
    Permission.MANAGE_CHECKOUTS,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.MANAGE_GUEST_REQUESTS,
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_PAYMENTS,
    Permission.REFUND_PAYMENTS,
    Permission.VIEW_PAYMENT_HISTORY,
    Permission.APPROVE_REFUNDS,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.VIEW_PERFORMANCE_METRICS,
    Permission.VIEW_REVIEWS,
    Permission.MODERATE_REVIEWS,
    Permission.DELETE_REVIEWS,
    Permission.VIEW_CUSTOMER_FEEDBACK,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_LOGS,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.VIEW_OWN_PAYMENTS,
    Permission.MANAGE_LOYALTY_PROGRAM,
    Permission.MANAGE_SPECIAL_OFFERS,
  ],
  
  MANAGER: [
    // Enhanced operational access with management capabilities
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.VIEW_ROOMS,
    Permission.EDIT_ROOMS,
    Permission.MANAGE_ROOM_STATUS,
    Permission.MANAGE_INVENTORY,
    Permission.MANAGE_PRICING,
    Permission.VIEW_BOOKINGS,
    Permission.CREATE_BOOKINGS,
    Permission.EDIT_BOOKINGS,
    Permission.MANAGE_CHECKINS,
    Permission.MANAGE_CHECKOUTS,
    Permission.MANAGE_GUEST_REQUESTS,
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_PAYMENTS,
    Permission.REFUND_PAYMENTS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.VIEW_PERFORMANCE_METRICS,
    Permission.VIEW_REVIEWS,
    Permission.MODERATE_REVIEWS,
    Permission.VIEW_CUSTOMER_FEEDBACK,
    Permission.VIEW_LOGS,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.VIEW_OWN_PAYMENTS,
    Permission.MANAGE_LOYALTY_PROGRAM,
    Permission.MANAGE_SPECIAL_OFFERS,
    Permission.VIEW_MAINTENANCE_REQUESTS,
    Permission.VIEW_DAILY_OCCUPANCY,
    Permission.MANAGE_ROOM_SERVICES,
  ],
  
  STAFF: [
    // Enhanced operational access
    Permission.VIEW_ROOMS,
    Permission.VIEW_BOOKINGS,
    Permission.CREATE_BOOKINGS,
    Permission.EDIT_BOOKINGS,
    Permission.MANAGE_CHECKINS,
    Permission.MANAGE_CHECKOUTS,
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_PAYMENTS,
    Permission.REFUND_PAYMENTS,
    Permission.VIEW_REVIEWS,
    Permission.MODERATE_REVIEWS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.VIEW_OWN_PAYMENTS,
    Permission.MANAGE_GUEST_REQUESTS,
    Permission.VIEW_MAINTENANCE_REQUESTS,
    Permission.CREATE_INCIDENT_REPORTS,
    Permission.VIEW_DAILY_OCCUPANCY,
    Permission.MANAGE_ROOM_SERVICES,
  ],
  
  CONCIERGE: [
    // Specialized guest services
    Permission.VIEW_ROOMS,
    Permission.VIEW_BOOKINGS,
    Permission.MANAGE_GUEST_REQUESTS,
    Permission.ACCESS_CONCIERGE_SERVICES,
    Permission.VIEW_HOTEL_AMENITIES,
    Permission.MANAGE_ROOM_SERVICES,
    Permission.CREATE_INCIDENT_REPORTS,
    Permission.VIEW_SPECIAL_OFFERS,
    Permission.MANAGE_TRANSPORTATION,
    Permission.ACCESS_EXTERNAL_SERVICES,
    Permission.VIEW_GUEST_PREFERENCES,
    Permission.MANAGE_SPECIAL_REQUESTS,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.VIEW_OWN_PAYMENTS,
  ],
  
  GUEST: [
    // Enhanced guest experience
    Permission.VIEW_ROOMS,
    Permission.CREATE_BOOKINGS,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.VIEW_OWN_PAYMENTS,
    Permission.VIEW_BOOKING_HISTORY,
    Permission.VIEW_LOYALTY_POINTS,
    Permission.REQUEST_ROOM_SERVICE,
    Permission.REPORT_MAINTENANCE_ISSUES,
    Permission.VIEW_HOTEL_AMENITIES,
    Permission.ACCESS_CONCIERGE_SERVICES,
    Permission.VIEW_SPECIAL_OFFERS,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.ACCESS_DIGITAL_KEY,
    Permission.VIEW_BILLING_DETAILS,
  ],
};

export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

export function getUserPermissions(userRole: string): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

export function canAccessRoute(userRole: string, requiredPermissions: Permission[]): boolean {
  if (!userRole) return false;
  
  return requiredPermissions.every(permission => 
    hasPermission(userRole, permission)
  );
}

// Enhanced route-based permission checks
export const ROUTE_PERMISSIONS = {
  '/dashboard': [Permission.VIEW_OWN_BOOKINGS],
  '/dashboard/admin': [Permission.MANAGE_ROLES],
  '/dashboard/manager': [Permission.VIEW_PERFORMANCE_METRICS],
  '/dashboard/staff': [Permission.MANAGE_CHECKINS],
  '/dashboard/concierge': [Permission.MANAGE_GUEST_REQUESTS],
  '/dashboard/guest': [Permission.VIEW_OWN_BOOKINGS],
  '/dashboard/rooms': [Permission.VIEW_ROOMS],
  '/dashboard/bookings': [Permission.VIEW_BOOKINGS],
  '/dashboard/analytics': [Permission.VIEW_ANALYTICS],
  '/dashboard/payments': [Permission.VIEW_PAYMENTS],
  '/dashboard/refunds': [Permission.REFUND_PAYMENTS],
  '/dashboard/users': [Permission.VIEW_USERS],
  '/dashboard/settings': [Permission.MANAGE_SYSTEM_SETTINGS],
  '/dashboard/loyalty': [Permission.VIEW_LOYALTY_POINTS],
  '/dashboard/services': [Permission.ACCESS_CONCIERGE_SERVICES],
  '/dashboard/maintenance': [Permission.VIEW_MAINTENANCE_REQUESTS],
  '/dashboard/occupancy': [Permission.VIEW_DAILY_OCCUPANCY],
};
