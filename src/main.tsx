import { prepareContent } from './cloud/content-sync';
import { syncSaveOnLaunch } from './cloud/save-sync';

/**
 * Admin-managed content (Supabase, or its offline cache) is applied before any UI module is imported,
 * so data derived at import time reflects it too. A newer cloud save is pulled before the app reads
 * its save. Both steps are time-limited and fall back to the offline app.
 *
 * The two entry points are loaded by separate import() statements on purpose: written as one
 * `cond ? import(a) : import(b)` expression, the production bundle preloaded only the game's CSS,
 * so the admin dashboard rendered without its stylesheet.
 */
const isAdmin = /^\/admin\/?$/.test(window.location.pathname);

async function startAdmin() {
  await prepareContent();
  await import('./admin/admin-main');
}

async function startGame() {
  await Promise.allSettled([prepareContent(), syncSaveOnLaunch()]);
  await import('./bootstrap');
}

if (isAdmin) void startAdmin();
else void startGame();
