import { prepareContent } from './cloud/content-sync';
import { syncSaveOnLaunch } from './cloud/save-sync';

/**
 * Admin-managed content (Supabase, or its offline cache) is applied before any UI module is imported,
 * so data derived at import time reflects it too. A newer cloud save is pulled before the app reads
 * its save. Both steps are time-limited and fall back to the offline app.
 */
const isAdmin = /^\/admin\/?$/.test(window.location.pathname);
void Promise.allSettled([prepareContent(), isAdmin ? Promise.resolve() : syncSaveOnLaunch()])
  .finally(() => (isAdmin ? import('./admin/admin-main') : import('./bootstrap')));
