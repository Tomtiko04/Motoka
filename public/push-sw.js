/**
 * Push SW handlers — imported by Workbox-generated service worker.
 * Shows OS notifications when the app is closed / backgrounded.
 */
/* eslint-disable no-restricted-globals */

self.addEventListener('push', (event) => {
  let payload = {
    title: 'Motoka',
    body: 'You have a new update',
    url: '/notifications',
    tag: 'motoka-notification',
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    try {
      payload.body = event.data?.text() || payload.body;
    } catch {
      /* ignore */
    }
  }

  const options = {
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: payload.tag || 'motoka-notification',
    renotify: true,
    data: {
      url: payload.url || '/notifications',
      ...(payload.data || {}),
    },
  };

  event.waitUntil(self.registration.showNotification(payload.title || 'Motoka', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || '/notifications';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            await client.navigate(targetUrl);
          }
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })(),
  );
});
