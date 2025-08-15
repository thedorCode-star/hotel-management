// Role-based permissions system for hotel management
export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CONCIERGE' | 'GUEST';

export interface Permission {
  canCreateRooms: boolean;
  canEditRooms: boolean;
  canDeleteRooms: boolean;
  canViewRooms: boolean;
  canCreateBookings: boolean;
  canEditBookings: boolean;
  canDeleteBookings: boolean;
  canViewBookings: boolean;
  canProcessPayments: boolean;
  canViewPayments: boolean;
  canProcessRefunds: boolean;
  canViewRefunds: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canExportReports: boolean;
  canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  ADMIN: {
    canCreateRooms: true,
    canEditRooms: true,
    canDeleteRooms: true,
    canViewRooms: true,
    canCreateBookings: true,
    canEditBookings: true,
    canDeleteBookings: true,
    canViewBookings: true,
    canProcessPayments: true,
    canViewPayments: true,
    canProcessRefunds: true,
    canViewRefunds: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canExportReports: true,
    canManageSettings: true,
  },
  MANAGER: {
    canCreateRooms: true,
    canEditRooms: true,
    canDeleteRooms: false, // Managers can't delete rooms
    canViewRooms: true,
    canCreateBookings: true,
    canEditBookings: true,
    canDeleteBookings: false, // Managers can't delete bookings
    canViewBookings: true,
    canProcessPayments: true,
    canViewPayments: true,
    canProcessRefunds: true,
    canViewRefunds: true,
    canManageUsers: false, // Managers can't manage users
    canViewAnalytics: true,
    canExportReports: true,
    canManageSettings: false, // Managers can't change system settings
  },
  STAFF: {
    canCreateRooms: false,
    canEditRooms: false,
    canDeleteRooms: false,
    canViewRooms: true,
    canCreateBookings: true,
    canEditBookings: true,
    canDeleteBookings: false,
    canViewBookings: true,
    canProcessPayments: true,
    canViewPayments: true,
    canProcessRefunds: false,
    canViewRefunds: true,
    canManageUsers: false,
    canViewAnalytics: false,
    canExportReports: false,
    canManageSettings: false,
  },
  CONCIERGE: {
    canCreateRooms: false,
    canEditRooms: false,
    canDeleteRooms: false,
    canViewRooms: true,
    canCreateBookings: true,
    canEditBookings: true,
    canDeleteBookings: false,
    canViewBookings: true,
    canProcessPayments: false,
    canViewPayments: true,
    canProcessRefunds: false,
    canViewRefunds: true,
    canManageUsers: false,
    canViewAnalytics: false,
    canExportReports: false,
    canManageSettings: false,
  },
  GUEST: {
    canCreateRooms: false,
    canEditRooms: false,
    canDeleteRooms: false,
    canViewRooms: true,
    canCreateBookings: true,
    canEditBookings: false, // Guests can't edit bookings
    canDeleteBookings: false,
    canViewBookings: true,
    canProcessPayments: false,
    canViewPayments: true,
    canProcessRefunds: false,
    canViewRefunds: true,
    canManageUsers: false,
    canViewAnalytics: false,
    canExportReports: false,
    canManageSettings: false,
  },
};

// Helper function to check if a user has a specific permission
export function hasPermission(userRole: UserRole, permission: keyof Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
}

// Helper function to get all permissions for a role
export function getRolePermissions(userRole: UserRole): Permission {
  return ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.GUEST;
}

// Helper function to check if user can perform room management actions
export function canManageRooms(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canCreateRooms') || 
         hasPermission(userRole, 'canEditRooms') || 
         hasPermission(userRole, 'canDeleteRooms');
}

// Helper function to check if user can create rooms
export function canCreateRooms(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canCreateRooms');
}

// Helper function to check if user can edit rooms
export function canEditRooms(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canEditRooms');
}

// Helper function to check if user can delete rooms
export function canDeleteRooms(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canDeleteRooms');
}

// Helper function to check if user can view rooms
export function canViewRooms(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canViewRooms');
}

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    MANAGER: 'Manager',
    STAFF: 'Staff Member',
    CONCIERGE: 'Concierge',
    GUEST: 'Guest',
  };
  return displayNames[role] || role;
}

// Helper function to get role description
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    ADMIN: 'Full system access and control',
    MANAGER: 'Department management and oversight',
    STAFF: 'Operational tasks and guest services',
    CONCIERGE: 'Guest assistance and front desk operations',
    GUEST: 'Basic booking and review access',
  };
  return descriptions[role] || 'Limited access';
}

// Helper function to get role color for UI
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    MANAGER: 'bg-purple-100 text-purple-800 border-purple-200',
    STAFF: 'bg-blue-100 text-blue-800 border-blue-200',
    CONCIERGE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    GUEST: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
}
