/**
 * Export all models from a single entry point
 * This ensures we can import all models in a consistent way
 */

import UserActivityLog from './user-activity-log.js';
import SystemErrorLog from './system-error-log.js';
import FeatureLimits from './feature-limits.js';

// Export all models
export {
  UserActivityLog,
  SystemErrorLog,
  FeatureLimits
};

// Default export as an object of all models
export default {
  UserActivityLog,
  SystemErrorLog,
  FeatureLimits
};