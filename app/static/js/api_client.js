

var api_client = function() {

	function httpGetAsync(theUrl, callback) {
	    var xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
	    		var respJson = JSON.parse(xmlHttp.responseText);
				callback(respJson);
	    	}
		};
	    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	    xmlHttp.send(null);
	}

	function httpPostAsync(theUrl, data, callback) {
		var xhr = new XMLHttpRequest();
		var url = theUrl;
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.withCredentials = true;
		xhr.onreadystatechange = function () { 
	    	if (xhr.readyState == 4 && xhr.status == 200) {
	    		var respJson = JSON.parse(xmlHttp.responseText);
				callback(respJson);
	    	}
		}
		var data = JSON.stringify(data);
		xhr.send(data);
	}

	return {
		get: httpGetAsync,
		post: httpPostAsync
	}
	
}


