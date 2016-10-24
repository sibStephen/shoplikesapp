var friends_url;
var appid;
var base_url;
var user_id;

//Friends Methods

function setFriendsURL(url) {
	friends_url = url
}

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
			callback(xmlHttp.responseText);
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


var columns = 10;

function loadFriendsGridView() {
	var gridview = document.getElementsByClassName("friends_gridview")[0];
	if (gridview) {
		var cell_width = (1100 - ((columns + 1) * columns)) / 10;
		var cells = document.getElementsByClassName("friend_cell");
		console.log(cells);
		console.log(cell_width);
		var final_width = cell_width + 'px';
		for (var i = 0; i < cells.length; i++) {
			var cell = cells[i];
			cell.style.width = final_width;
			cell.style.height = final_width;
			if ((i + 1) % (columns) == 0) {
				cell.style.marginRight = '0px';
			}
			if (i == cells.length - 1) {
				var height = Math.ceil(((cells.length / columns) + 1) * cell_width) + 'px';
				gridview.style.height = height;
			}
 		}
	}
}


// Recommendations

function storeBaseURL(baseurl) {
	base_url = baseurl;
}

function storeUserId(uid) {
	user_id = uid;
}

var reco_columns = 4;

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
					var quotient = Math.floor(i / reco_columns);
					var remainder = i % reco_columns;
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
						var aboveChild = children[i - reco_columns];
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


// Slider Methods
var segments = [];

function slider(seg) {
	debugger;
	segments = seg;
	var slider = document.getElementsByClassName("slider")[0];
	for (i in segments) {
		debugger;
		var text = segments[i];
		var node = document.createElement("div");
		node.className = "segment";
		node.style.width = (slider.clientWidth / segments.length) + "px"; 
		node.style.left = i * node.style.width;
		node.innerHTML = "<div onclick=\"segment_clicked("+i+")\">"+text+"</div>";
		slider.appendChild(node);
	}

	var selected = document.createElement("div");
	selected.className = "selected-segment";
	selected.style.width = (slider.clientWidth / segments.length) + "px"; 
	slider.appendChild(selected);
	segment_clicked(0);
}

function storeAppId(app_Id) {
	debugger;
	appid = app_Id;
}

 function FBInvite(){
 	console.log("appid : " + appid);
  FB.ui({
   app_id: '' + appid,
   method: 'apprequests',
   message: 'Invite your Facebook Friends'
  },function(response) {
   if (response) {
    alert('Successfully Invited');
   } else {
    alert('Failed To Invite');
   }
  });
 }


function segment_clicked(index) {
	var slider = document.getElementsByClassName("slider")[0];
	var selected = document.getElementsByClassName("selected-segment")[0];
	selected.style.left = index * (slider.clientWidth / segments.length) + "px";

	switch(index) {
		case 0:
		{
			var gridview = document.getElementsByClassName("friends_gridview")[0];
			gridview.style.display = "block";

			var reco_grid = document.getElementsByClassName("grid-timeline")[0];
			reco_grid.style.display = "none";
			reco_grid.innerHTML = "";

			httpGetAsync(friends_url,function(json) {
				var respJson = JSON.parse(json);
        		var friends = respJson.data;
        	//manipulate HTML DOM here
        	
				var gridview = document.getElementsByClassName("friends_gridview")[0];
				gridview.innerHTML = "";
	        	for (i in friends) {
	        		var friend = friends[i];
	        		var node = document.createElement("div");
	        		node.className = "friend_cell";
	        		node.innerHTML = "<div class=\"friend_pic\"><img src=https://graph.facebook.com/"+friend.id+"/picture></img></div><div class=\"friend_name\"><a href=\""+friend.id+"/profile\">"+friend.name+"</a></div><div class=\"reco_cnt\">8 Products</div>";
	        		gridview.appendChild(node);
	        	}
	        	loadFriendsGridView();
	        	if ("paging" in respJson) {
	        		if ("next" in respJson["paging"]) {
        				httpGetAsync(respJson['paging']['next'],callback);
	        		}
        		}
			});
		}
			break;
		case 1:
		{
			var reco_grid = document.getElementsByClassName("grid-timeline")[0];
			reco_grid.style.display = "block";

			var gridview = document.getElementsByClassName("friends_gridview")[0];
			gridview.innerHTML = '';
			gridview.style.display = "none";

			var recommendations_url = base_url + "/api/v1/recommendations_timeline/" + user_id;
			debugger;
			httpGetAsync(recommendations_url,function(json) {
				var respJson = JSON.parse(json);
		    	var recommendations = respJson["result"];
		    	if (recommendations) {
	    			var grid = document.getElementsByClassName('grid-timeline')[0];
	    			grid.innerHTML = "";
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

						var created_on = recommendation["created_on"];
						var d = new Date(created_on);
						var num_milliseconds = Date.parse(d);
						node.innerHTML = "<div class=\"pin\"><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+from_user_pic+"\"/><div id=\"from_user_name\">"+ from_user["user_name"] +"</div></div> <div id=\"reco_info\"><div id=\"reco_text\">Recommends "+ to_user["user_name"] +"</div><div id=\"reco_timestamp\">" + timeSince(num_milliseconds) + " ago</div></div><div id=\"product_info\"><div id=\"product_category\">"+ category + "</div><div id=\"product_name\">"+ name +"</div></div><img id=\""+product_id+"\" src=\""+image_url+"\" /><div id=\"product_price\"><font color=\"white\">"+price+"</font></div><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+page_pic+"\"/><div id=\"from_user_name\">"+page["page_name"]+"</div></div></div>";
						grid.appendChild(node);

						var image_node = document.getElementById(product_id);
						image_node.onload = function() {
							arrangePins();
						};
						arrangePins();
					}
		    	}
			});

		}
			break;
		case 2: 
		{
			FBInvite();
		}
			break;
	}

}