var columns = 4;

function arrangePins() {
	console.log('arranging pins!')
	var grid = document.getElementsByClassName('grid-timeline')[0];
	grid.style.backgroundColor = 'transparent';
    if (grid) {
		var children = grid.children;
		var gridHeight = 0;
		if (children.length) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child.className == "grid-recommendation") {			
					var quotient = Math.floor(i / columns);
					var remainder = i % columns;
					var pinWidth = child.clientWidth;

					var left,top;
				
					//calculate left here
					if (remainder == 0) {
						left = '0px';	
					} else {
						left = (remainder * pinWidth) + 'px';
					}
					child.style.left = left;

					//calculate top here
					if (quotient == 0) {
						top = '0px';	
					} else {
						var aboveChild = children[i - columns];
						top = (aboveChild.offsetTop + aboveChild.clientHeight) + 'px';
					}
					child.style.top = top;
					
					if (gridHeight < child.clientHeight + child.offsetTop) {
						gridHeight = child.clientHeight + child.offsetTop;
					}
				}
			}
		}
		grid.style.height = gridHeight + 'px';
    }
}


function timeSince(date) {
	var now = Date();
    var seconds = Math.floor((Date.parse(now) - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}


function showTimeline(respJson) {
	var recommendations = respJson["result"];
	if (recommendations) {
		var grid = document.getElementsByClassName('grid-timeline')[0];
		for (var i = 0; i < recommendations.length; i++) {
			var recommendation = recommendations[i];
			var node = document.createElement("div");
			node.id = recommendation["recommendation_id"];
			node.className = "grid-recommendation";
			node.onclick = pinClicked;
			var product = recommendation["product"];
			var from_user = recommendation["from_user"];
			var to_user = recommendation["to_user"];
			var page = recommendation["page"];

			var from_user_pic = "https://graph.facebook.com/"+from_user["user_id"]+"/picture"
			var to_user_pic = "https://graph.facebook.com/"+to_user["user_id"]+"/picture"
			var page_pic = "https://graph.facebook.com/"+page["page_id"]+"/picture"

			var category = product['category']
			var name = product['product_name'];
			var image_url = product['image_url'];
			var price = product['price'];
			var product_id = product['product_id'];

			var created_on = recommendation["created_on"];
			var d = new Date(created_on);
			var num_milliseconds = Date.parse(d);
			node.innerHTML = "<div class=\"pin\" onclick=\"pinClicked("+ recommendation["recommendation_id"] +")\"><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+from_user_pic+"\"/><div id=\"from_user_name\">"+ from_user["user_name"] +"</div></div> <div id=\"reco_info\"><div id=\"reco_text\">Recommends <a href=\"/"+to_user["user_id"]+"/profile\">"+ to_user["user_name"] +"</a></div><div id=\"reco_timestamp\">" + timeSince(num_milliseconds) + " ago</div></div><div id=\"product_info\"><div id=\"product_category\">"+ category + "</div><div id=\"product_name\">"+ name +"</div></div><img id=\""+product_id+"\" src=\""+image_url+"\" /><div id=\"product_price\"><font color=\"white\">"+price+"</font></div><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+page_pic+"\"/><div id=\"from_user_name\">"+page["page_name"]+"</div></div></div>";
			grid.appendChild(node);

			var image_node = document.getElementById(product_id);
			image_node.onload = function() {
				arrangePins();
			};

			arrangePins();
		}
	}
}


function httpGetAsync(theUrl, callback)
{
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


var base_url;
function storeBaseURL(url) {
	base_url = url;
}

function getRecommendationsForUserId(user_id) {
	var url = base_url + "/api/v1/recommendations_timeline/" + user_id;
	httpGetAsync(url, function(json) {
		showTimeline(json);
	});
}

function showModal(response) {
	var modal = document.getElementById('myModal');
	modal.style.display = "block";

	var body = document.getElementsByTagName("body")[0];
	body.style.overflow = 'hidden';

	var category_name = document.getElementsByClassName("modal-category")[0];
	category_name.innerHTML = response["product"]["category"];

	debugger;
	var product_name = document.getElementsByClassName("modal-name")[0];
	product_name.innerHTML = "<font size=5>"+response["product"]["product_name"]+"</font>";
	
	var product_price = document.getElementsByClassName("modal-price")[0];
	product_price.innerHTML = response["product"]["price"];


	// var urls = response["Item"]["PictureURL"];
	// var product_image_carousel = document.getElementsByClassName("modal-image-carousel")[0];
	// product_image_carousel.innerHTML = "";
	// for (i in urls) {
	// 	if (i >= 4) {
	// 		break;
	// 	}
	// 	var url = urls[i];
	// 	var node = document.createElement("div");
	// 	node.className = "modal-image-cell";
	// 	node.innerHTML = "<img src=" + url + "></img>";
	// 	product_image_carousel.appendChild(node);
	// } 

	var product_image = document.getElementsByClassName("modal-image")[0];
	var gallery_url = response["product"]["image_url"];
	product_image.innerHTML = "<img src=" + gallery_url + "></img>";

	var link = document.getElementsByClassName("buy-on-ebay-link")[0].firstChild;
	link.href = response["product"]["product_url"];
	
	var product_details = document.getElementsByClassName("modal-detail")[0];
	product_details.innerHTML = "<p>" + response["product"]["description"] + "</p>";
}

window.onclick = function(event) {
	var modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
		var body = document.getElementsByTagName("body")[0];
		body.style.overflow = 'scroll';
    }
}


function pinClicked() {
	var recommendation_id = event.currentTarget.id;
	var url = base_url + "/api/v1/recommendations/" + recommendation_id;
	httpGetAsync(url, function(json) {
		debugger;
		showModal(json["result"][0]);
	});
}


