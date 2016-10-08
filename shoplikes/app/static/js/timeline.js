function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        	var respJson = JSON.parse(xmlHttp.responseText);
        	debugger;


			callback(respJson);
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


function getRecommendationsForUserId(user_id) {
	debugger;
	var url = "http://localhost:8080/api/v1/recommendations/" + user_id;
	httpGetAsync(url, function(json) {

	});
}


