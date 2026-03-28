import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
 import './i18n';

const isProduction = import.meta.env.PROD;
const runtimeRecoveryKey = '__eduflow_runtime_recovered__';
const reactNullHookErrorPattern = /Cannot read properties of null \(reading 'use(State|Ref|Effect)'\)/;

const clearClientCaches = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
  }
};

const recoverFromReactRuntimeMismatch = async () => {
  if (isProduction) return;
  if (sessionStorage.getItem(runtimeRecoveryKey) === '1') return;

  sessionStorage.setItem(runtimeRecoveryKey, '1');
  await clearClientCaches();
  window.location.reload();
};

window.addEventListener('error', (event) => {
  const message = String(event.error?.message || event.message || '');
  if (reactNullHookErrorPattern.test(message)) {
    void recoverFromReactRuntimeMismatch();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = typeof reason === 'object' && reason
    ? String((reason as { message?: string }).message || '')
    : String(reason || '');

  if (reactNullHookErrorPattern.test(message)) {
    void recoverFromReactRuntimeMismatch();
  }
});

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (isProduction) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
      return;
    }

    // In development, clear stale service workers/caches to prevent mixed module runtime errors.
    await clearClientCaches();
  });
}

// Handle PWA install prompt
let deferredPrompt: any;

if (isProduction) {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button (you can implement this in your UI)
    const installButton = document.createElement('button');
    installButton.textContent = 'Install App';
    installButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; background: #0d6efd; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;';
    
    installButton.addEventListener('click', () => {
      // Hide the install button
      installButton.style.display = 'none';
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
    
    document.body.appendChild(installButton);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
