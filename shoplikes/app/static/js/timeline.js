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


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
	    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
	    	var respJson = JSON.parse(xmlHttp.responseText);
	    	debugger;
	    	var recommendations = respJson["result"];
	    	if (recommendations) {
    			var grid = document.getElementsByClassName('grid-timeline')[0];
				for (var i = 0; i < recommendations.length; i++) {
					var recommendation = recommendations[i];
					var node = document.createElement("div");
					node.className = "grid-recommendation";
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


	// <div class="grid-recommendation">
		// <div class="pin">
		// 	<div id="from_user_info"><img id="from_user_pic" src="https://pbs.twimg.com/profile_images/2360146438/image_normal.jpg"/><div id="from_user_name">Parag Dulam</div></div>
		// 	<div id="reco_info"><div id="reco_text">Recommends Pritam Dulam and 2 more</div><div id="reco_timestamp">30 secs ago</div></div>
		// 	<div id="product_info"><div id="product_category">MOVIES</div><div id="product_name">Ratatouille</div></div>
		// 	<img src="http://cssdeck.com/uploads/media/items/6/6f3nXse.png" />
		// 	<div id="product_price"><font color="white">$50</font></div>
		// 	<div id="from_user_info"><img id="from_user_pic" src="https://33.media.tumblr.com/avatar_a8ac011f1b54_128.png"/><div id="from_user_name">Ratatouille - The Movie</div></div>
		// </div>
	// </div>


					node.innerHTML = "<div class=\"pin\"><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+from_user_pic+"\"/><div id=\"from_user_name\">"+ from_user["user_name"] +"</div></div> <div id=\"reco_info\"><div id=\"reco_text\">Recommends "+ to_user["user_name"] +"</div><div id=\"reco_timestamp\">30 secs ago</div></div><div id=\"product_info\"><div id=\"product_category\">"+ category + "</div><div id=\"product_name\">"+ name +"</div></div><img src=\""+image_url+"\" /><div id=\"product_price\"><font color=\"white\">"+price+"</font></div><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+page_pic+"\"/><div id=\"from_user_name\">"+page["page_name"]+"</div></div></div>";
					grid.appendChild(node);
					arrangePins();
				}
				callback(respJson);
	    	}
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


