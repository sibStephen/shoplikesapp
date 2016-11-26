/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

if ('serviceWorker' in navigator) { 
  navigator.serviceWorker.register('service-worker.js').then(function(registration) {
  // Registration was successful 
  console.log('ServiceWorker registration successful with scope: ',    registration.scope);
  registration.pushManager.subscribe({userVisibleOnly: true}).then(function(subscription){
  isPushEnabled = true;  
  console.log("subscription.subscriptionId: ", subscription.subscriptionId);
  console.log("subscription.endpoint: ", subscription.endpoint);
  
  // TODO: Send the subscription subscription.endpoint
  // to your server and save it to send a push message
  // at a later date
  return sendSubscriptionToServer(subscription);
  });
  }).catch(function(err) {
    // registration failed :(
    console.log('ServiceWorker registration failed: ', err);
  });
}

// 'use strict';

// self.addEventListener('push', function(event) {
//   console.log('[Service Worker] Push Received.');
//   console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

//   const title = 'Push Codelab';
//   const options = {
//     body: 'Yay it works.',
//     icon: 'images/icon.png',
//     badge: 'images/badge.png'
//   };

//   event.waitUntil(self.registration.showNotification(title, options));
// });


// self.addEventListener('notificationclick', function(event) {
//   console.log('[Service Worker] Notification click Received.');

//   event.notification.close();

//   event.waitUntil(
//     clients.openWindow('https://developers.google.com/web/')
//   );
// });