// Explicitly define activity categories
export const ACTIVITY_CATEGORIES = [
  'ADMIN',
  'USER', 
  'AUTH', 
  'API', 
  'FEATURE', 
  'SYSTEM'
] as const;

// Define the category type 
export type ActivityCategory = 'ADMIN' | 'USER' | 'AUTH' | 'API' | 'FEATURE' | 'SYSTEM';

// Define all user activity types
export const USER_ACTIVITY_TYPES = [
  'login_success',
  'login_failure', 
  'logout', 
  'register', 
  'password_reset', 
  'password_change', 
  'security_question_update', 
  'profile_update', 
  'profile_view', 
  'account_lock', 
  'account_unlock', 
  'account_deactivation',
  'account_deletion',
  'api_key_generate', 
  'api_key_revoke', 
  'admin_access', 
  'admin_action', 
  'admin_access_denied', 
  'superadmin_access_denied',
  'view_all_users',
  'view_user_details',
  'update_user_status',
  'delete_user',
  'send_password_reset',
  'view_error_logs',
  'view_feature_limits',
  'update_feature_limits',
  'view_system_notifications',
  'view_data_imports',
  'view_dashboard_summary',
  'feature_usage',
  'career_analysis_created',
  'skill_gap_analyzed',
  'learning_resources_viewed',
  'pathway_generated',
  'pdf_exported',
  'search_performed',
  'resource_saved',
  'resource_removed',
  'other'
] as const;

// Define the activity type
export type UserActivityType = 
  | 'login_success' 
  | 'login_failure' 
  | 'logout' 
  | 'register' 
  | 'password_reset' 
  | 'password_change' 
  | 'security_question_update' 
  | 'profile_update' 
  | 'profile_view' 
  | 'account_lock' 
  | 'account_unlock' 
  | 'account_deactivation'
  | 'account_deletion'
  | 'api_key_generate' 
  | 'api_key_revoke' 
  | 'admin_access' 
  | 'admin_action' 
  | 'admin_access_denied' 
  | 'superadmin_access_denied'
  | 'view_all_users'
  | 'view_user_details'
  | 'update_user_status'
  | 'delete_user'
  | 'send_password_reset'
  | 'view_error_logs'
  | 'view_feature_limits'
  | 'update_feature_limits'
  | 'view_system_notifications'
  | 'view_data_imports'
  | 'view_dashboard_summary'
  | 'feature_usage'
  | 'career_analysis_created'
  | 'skill_gap_analyzed'
  | 'learning_resources_viewed'
  | 'pathway_generated'
  | 'pdf_exported'
  | 'search_performed'
  | 'resource_saved'
  | 'resource_removed'
  | 'other';