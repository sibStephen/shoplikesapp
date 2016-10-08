  function login() {
  	FB.login(function(response) {
   // handle the response
    	statusChangeCallback(response);
 	}, {scope: 'public_profile,email'});
  }


  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  function postUser(user) {
	var xhr = new XMLHttpRequest();
	var url = "http://localhost:8080/api/v1/user";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
    	if (xhr.readyState == 4 && xhr.status == 200) {
    		window.location = "http://localhost:8080/timeline";
    	}
	}
	var data = JSON.stringify(user);
	xhr.send(data);
}

  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      // Make a post request to your app here.
      var user = {"user_id":response["authResponse"]["userID"], 
      			  "access_token":response["authResponse"]["accessToken"],
      			  "is_loggedin_user":true};
      postUser(user);
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  }

  window.onload = function() {
	window.fbAsyncInit = function() {
	    FB.init({
	      appId      : '1485658648363694',
	      xfbml      : true,
	      version    : 'v2.8'
	    });
	    FB.AppEvents.logPageView();
	  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
  }