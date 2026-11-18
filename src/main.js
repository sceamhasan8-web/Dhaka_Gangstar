import { Game } from './core/Game.js';

// PWA Service Worker: Only in production to prevent caching Vite dev modules & breaking forwarded ports
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  if (import.meta.env.DEV) {
    // In development or local forwarded port, ensure no stale worker hijacks dynamic Vite modules
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
        console.log('[PWA] Unregistered development service worker for clean live reloading.');
      }
    }).catch(() => {});
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('[PWA] Production Service Worker active.'))
        .catch((err) => console.warn('[PWA] Service Worker registration failed:', err));
    });
  }
}

// Global error catcher to prevent silent black-screen failures on mobile devices
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('[Unhandled Rejection]', event.reason);
});

window.addEventListener('DOMContentLoaded', async () => {
  console.log('Starting DHAKA CITY GANGSTAR...');
  const loaderStatus = document.getElementById('loader-status');
  const loaderBar = document.getElementById('loader-progress-bar');
  const loader = document.getElementById('startup-loader');

  const updateProgress = (pct, text) => {
    if (loaderBar) loaderBar.style.width = pct + '%';
    if (loaderStatus) loaderStatus.innerText = text;
  };

  const dismissLoader = () => {
    if (loader && !window.dhakaLoaderDismissed) {
      window.dhakaLoaderDismissed = true;
      window.dhakaGameReady = true;
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(() => {
        if (loader.parentNode) loader.remove();
      }, 300);
    }
  };

  // Failsafe watchdog timer: Never let the loader hang more than 2 seconds
  const failsafeTimer = setTimeout(() => {
    console.log('[Startup] Failsafe: Dismissing loader to prevent delay.');
    dismissLoader();
  }, 2000);

  try {
    updateProgress(35, 'Loading 3D Engine & City Assets...');

    // Yield to the browser render loop so the loading bar renders immediately
    requestAnimationFrame(() => {
      try {
        const game = new Game();
        window.dhakaGame = game;

        updateProgress(100, 'Streets of Dhaka Ready!');
        clearTimeout(failsafeTimer);
        setTimeout(dismissLoader, 150);
      } catch (innerErr) {
        console.error('Error during Game instantiation:', innerErr);
        dismissLoader();
      }
    });

  } catch (err) {
    console.error('Fatal initialization error:', err);
    clearTimeout(failsafeTimer);
    if (loaderStatus) {
      loaderStatus.innerHTML = `
        <div style="color: #ef4444; font-weight: bold; margin-bottom: 8px;">Failed to start 3D renderer</div>
        <div style="font-size: 11px; color: #94a3b8; max-width: 320px; margin: 0 auto 12px; word-break: break-word;">${err.message || err}</div>
        <button onclick="location.reload()" style="background: #eab308; color: #000; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">RETRY</button>
      `;
    }
  }
});
