
var isSubscribed = false;
var swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


// if ('serviceWorker' in navigator && 'PushManager' in window) {
//   console.log('Service Worker and Push is supported');

//   navigator.serviceWorker.register('/static/js/sw.js')
//   .then(function(swReg) {
//     console.log('Service Worker is registered', swReg);

//     swRegistration = swReg;
//     initialiseUI();
//   })
//   .catch(function(error) {
//     console.error('Service Worker Error', error);
//   });
// } else {
//   console.warn('Push messaging is not supported');
// }

if ('serviceWorker' in navigator) { 
  navigator.serviceWorker.register('/static/js/sw.js').then(function(registration) {
  // Registration was successful 
  console.log('ServiceWorker registration successful with scope: ',    registration.scope);
  registration.pushManager.subscribe({userVisibleOnly: true}).then(function(subscription){
  isPushEnabled = true;  
  console.log("subscription.subscriptionId: ", subscription.subscriptionId);
  console.log("subscription.endpoint: ", subscription.endpoint);
  
  // TODO: Send the subscription subscription.endpoint
  // to your server and save it to send a push message
  // at a later date
  return updateSubscriptionOnServer(subscription);
  });
  }).catch(function(err) {
    // registration failed :(
    console.log('ServiceWorker registration failed: ', err);
  });
}

//"https://android.googleapis.com/gcm/send/c7DeW38qvJ8:APA91bFugIb_qdlQYk441AXC-CU-dly95h09chrknNZPbWdUNKV6vgHv-i-YGr6FpeQLkIDFf6ebZqSc7HcbmzdCFdspf_gPFEDO6nVfJvWPSZKfGD5d6-f43ZWWD4bGeuBJ1Mgnaaxg"

function updateBtn() {
}



function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application serviceWorker
  console.log(subscription);
  var xhr = new XMLHttpRequest();
  var url = "/api/v1/subscription";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.withCredentials = true;
  xhr.onreadystatechange = function () { 
      if (xhr.readyState == 4 && xhr.status == 200) {
          var json = JSON.parse(xhr.responseText);
          console.log(json);
      }
  }
  var data = JSON.stringify({"endpoint":subscription["endpoint"]});
  xhr.send(data);
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array('BGHsXLzX5TWt0WBdB7UlH2dJI7v0QMFU07LOMVgKjp9_D1O9OQw8cNzlYTKRRXno9X2MggDW0U2XSy2Wg6jtl9I');
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed:', subscription);

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function initialiseUI() {
  // Set the initial subscription value
  if (isSubscribed) {
    // TODO: Unsubscribe user
  } else {
    subscribeUser();
  }

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}