// Standardized activity types for logging
// This will help prevent duplication of activity types and provide better consistency

// Define all possible user activity types
export const USER_ACTIVITY_TYPES = [
  // Authentication activities
  'login_success',
  'login_failure',
  'logout',
  'register',
  'password_reset',
  'password_change',
  'security_question_update',
  
  // User profile activities
  'profile_update',
  'profile_view',
  
  // Account management
  'account_lock',
  'account_unlock',
  'account_deactivation',
  'account_deletion',
  
  // API management
  'api_key_generate',
  'api_key_revoke',
  
  // Admin activities
  'admin_access',
  'admin_action',
  'admin_access_denied',
  'superadmin_access_denied',
  
  // Admin user management
  'view_all_users',
  'view_user_details',
  'update_user_status', 
  'delete_user',
  'send_password_reset',
  
  // Admin system management
  'view_error_logs',
  'view_feature_limits',
  'update_feature_limits',
  'view_system_notifications',
  'view_data_imports',
  'view_dashboard_summary',
  
  // Feature usage
  'feature_usage',
  'career_analysis_created',
  'skill_gap_analyzed',
  'learning_resources_viewed',
  'pathway_generated',
  'pdf_exported',
  
  // Other
  'search_performed',
  'resource_saved',
  'resource_removed',
  'other'
] as const;

// Type for user activity
export type UserActivityType = typeof USER_ACTIVITY_TYPES[number];

// Ensure these match the enum values in UserActivityLogDocument
export const ACTIVITY_CATEGORIES = [
  'ADMIN',
  'USER',
  'AUTH',
  'API',
  'FEATURE',
  'SYSTEM'
] as const;

// Type for activity category
export type ActivityCategory = 'ADMIN' | 'USER' | 'AUTH' | 'API' | 'FEATURE' | 'SYSTEM';