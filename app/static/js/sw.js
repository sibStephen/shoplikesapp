//sw.js

self.addEventListener('push', function(event) {
  console.log('push received');

  //Set some no cache headers for retrieving the notification details
  var httpHeaders = new Headers();
  httpHeaders.append('pragma', 'no-cache');
  httpHeaders.append('cache-control', 'no-cache');

  var fetchInit = {
    method: 'GET',
    headers: httpHeaders,
  };

  //We wait for data fetch and notification promises
  event.waitUntil(
    fetch("https://mobiforge.com/push/latest.json", fetchInit).then(function(res) {
      return res.json().then(function(notificationData) {
        // Show notification
        console.log(notificationData);
        console.log('setting up notification');
        self.addEventListener('notificationclick', function(e) {
          //Close the notificaiton
          e.notification.close();

          //Focus or open webpage
          e.waitUntil(
              clients.matchAll({  
                type: "window"  
              })
              .then(function(clientList) {  
                for (var i = 0; i < clientList.length; i++) {  
                  var client = clientList[i];  
                  if (client.url == notificationData.data.url && 'focus' in client)  
                    return client.focus();  
                }  
                if (clients.openWindow) {
                  return clients.openWindow(notificationData.data.url);  
                }
              })
            );
        });

        if(Notification.permission=='granted') {
          return self.registration.showNotification(notificationData.data.title, {
            body: notificationData.data.body,
            icon: 'mf_logo.png'
          });

        }
        else {
          Notification.requestPermission(function(permission) {
            if(permission=='granted') {
              return self.registration.showNotification(notificationData.data.title, {
                body: notificationData.data.body,
                icon: 'mf_logo.png'
              });
            }
          });
        }

      })
    })

  );
});


