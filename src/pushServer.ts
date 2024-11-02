// src/pushServer.ts

import webpush from 'web-push';
import keys from './Keys.json';

// Define la interfaz para pushSubscription
interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

webpush.setVapidDetails(
  'mailto:luis.gomez.21s@utzmg.edu.mx',
  keys.publicKey,
  keys.privateKey
);

function sendPush(pushSubscription: PushSubscription) {
  return webpush.sendNotification(pushSubscription, 'Confirmado, Luis es gay');
}

export { sendPush };
