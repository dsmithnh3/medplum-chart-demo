// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export function registerServiceWorker(config?: ServiceWorkerConfig): void {
  // Only register in production and if browser supports service workers
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[App] Service Worker registered:', registration.scope);

          // Check for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  console.log('[App] New content available; please refresh.');
                  if (config?.onUpdate) {
                    config.onUpdate(registration);
                  }
                } else {
                  // Content cached for offline use
                  console.log('[App] Content cached for offline use.');
                  if (config?.onSuccess) {
                    config.onSuccess(registration);
                  }
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('[App] Service Worker registration failed:', error);
        });

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[App] Service Worker controller changed');
      });
    });

    // Network status listeners
    window.addEventListener('online', () => {
      console.log('[App] Network status: Online');
      if (config?.onOnline) {
        config.onOnline();
      }
    });

    window.addEventListener('offline', () => {
      console.log('[App] Network status: Offline');
      if (config?.onOffline) {
        config.onOffline();
      }
    });
  } else if (import.meta.env.DEV) {
    console.log('[App] Service Worker not registered in development mode');
  }
}

export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        return registration.unregister();
      })
      .then(() => {
        console.log('[App] Service Worker unregistered');
      })
      .catch((error) => {
        console.error('[App] Service Worker unregistration failed:', error);
      });
  }
}

export async function checkForUpdates(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const update = await registration.update();
      return !!update;
    } catch (error) {
      console.error('[App] Error checking for updates:', error);
      return false;
    }
  }
  return false;
}

export function clearServiceWorkerCache(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE',
    });
  }
}
