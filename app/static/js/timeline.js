var columns = 3;
var friends_url;


function setFriendsURL(url) {
	friends_url = url;
}

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
			var like_image_name = recommendation["is_senders_liked"] == true ? "ic_like_rcmnd_feed_on.png" : "ic_like_rcmnd_feed_off.png";
			node.innerHTML = "<div class=\"pin\"><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+from_user_pic+"\"/><div id=\"from_user_name\">"+ from_user["user_name"] +"</div></div> <div id=\"reco_info\"><div id=\"reco_text\">Recommends <a href=\"/"+to_user["user_id"]+"/profile\">"+ to_user["user_name"] +"</a></div><div id=\"reco_timestamp\"><img src=\"static/img/ic_clock.png\"/> " + timeSince(num_milliseconds) + " ago</div></div><div id=\"product_info\"><div id=\"product_category\">"+ category + "</div><div id=\"product_name\">"+ name +"</div></div><img style=\"cursor:pointer\" onclick=\"pinClicked('"+recommendation["recommendation_id"]+"');\" id=\""+product_id+"\" src=\""+image_url+"\" /><div id=\"product_price\">"+price+"</div><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+page_pic+"\"/><div id=\"from_user_name\"><a href=" + "/" + page["page_id"] + "/detail" + ">"+page["page_name"]+"</a></div><img style=\"float:right;width:20px;height:20px;margin-top:4px\" id=\"from_user_pic\" src=\"/static/img/"+like_image_name+"\"/></div></div>";
			grid.appendChild(node);

			var image_node = document.getElementById(product_id);
			image_node.onload = function() {
				arrangePins();
			};

			arrangePins();
		}
	}
}

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


function abc(respJson) {
    var grouped_likes = {};
	var likes = respJson["result"];
	likes.map( 
		function (like) {
			if (grouped_likes[like.category_name]) {
				var existing_likes = grouped_likes[like.category_name];
				existing_likes.push(like);
				grouped_likes[like.category_name] = existing_likes;
			} else {
				grouped_likes[like.category_name] = [like];
			}
		}
	);
	console.log(grouped_likes);
	var container = document.getElementsByClassName('likes_list')[0];
	for (key in grouped_likes) {
		var key_likes = grouped_likes[key];
		for (var i = 0; i < key_likes.length; i++) {
			var like = key_likes[i];
			//saveLike(like);
			var likes_list = document.getElementById(like.category_name);
			if (likes_list) {
				var htmlNode = document.createElement("div");
				htmlNode.className = "like_cell"
				
				var listInnerHTML = "<div class=\"like_pic\" style=\"background-image:url(https://graph.facebook.com/"+like.page_id+"/picture?width=180&height=180);\"></div>";
				listInnerHTML += "<div class=\"like_name\"><a href=\"/"+ like.page_id +"/detail\">" + like.page_name + "</a></div>";
				listInnerHTML += "<div class=\"product_cnt\" id=\""+like.page_id+"\"></div>";
				
				htmlNode.innerHTML = listInnerHTML;						
				likes_list.childNodes[1].appendChild(htmlNode);
			} else {
				
				var htmlNode = document.createElement("div");
				htmlNode.className = "likes_listcell";
				htmlNode.id = key;
				
				var innerHTML = "<div class=\"like_section_header\">" + key + "</div>";
				innerHTML += "<div class=\"likes_grid\">";
				innerHTML += "<div class=\"like_cell\">";
				innerHTML += "<div class=\"like_pic\" style=\"background-image:url(https://graph.facebook.com/"+like.page_id+"/picture?width=180&height=180);\">";
				innerHTML += "</div>";
				innerHTML += "<div class=\"like_name\"><a href=\"/"+ like.page_id +"/detail\">" + like.page_name + "</a></div>";
				innerHTML += "<div class=\"product_cnt\" id=\""+like.page_id+"\"></div>";
				innerHTML += "</div>";
				innerHTML += "</div>";
				// innerHTML += "<div class=\"next_btn\"><img src=\"/static/img/ic_arrow_right.png\"/>";
				// innerHTML += "</div>";
				
				htmlNode.innerHTML = innerHTML;
				container.appendChild(htmlNode);
			}
		}
	}

	toSort = Array.prototype.slice.call(container.children, 0);
	toSort.sort(function(child, otherChild) {
		var subchildren = child.children;
		var otherSubchildren = otherChild.children;
		var a = 0;
		var b = 0;
		for (i in subchildren) {
			var subchild = subchildren[i];
			if (subchild.className == "likes_grid") {
				a = subchild.children.length;
				break;
			}
		}

		for (i in otherSubchildren) {
			var subchild = otherSubchildren[i];
			if (subchild.className == "likes_grid") {
				b = subchild.children.length;
				break;
			}
		}
		return b - a;
	});

	for (i in toSort) {
		var sortedChild = toSort[i];
		container.removeChild(sortedChild);
		container.appendChild(sortedChild);
	}

}


function getLikesAndShowView(url) {
	httpGetAsync(url, function(respJson){
    	abc(respJson);
    	if ("paging" in respJson) {
    		if ("next" in respJson["paging"]) {
    			httpGetAsync(respJson['paging']['next'],callback);
    		} else {
    		//reorder here
			var container = document.getElementsByClassName('likes_list')[0];
    		console.log(container.childNodes);
    		}
    	}
	});
}

function getFriendsAndShowView(url) {
	httpGetAsync(url,function(respJson) {
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

function httpGetAsync(theUrl, callback)
{
	var loading = document.getElementsByClassName("loading")[0];
    loading.style.display = "block";
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
		if (json["result"].length == 0) {
			var loading = document.getElementsByClassName("loading")[0];
		    loading.style.display = "block";
		    loading.innerHTML = "You have no recommendations yet. Please visit the likes page to start recommending products to your friends."
		} else {
			var loading = document.getElementsByClassName("loading")[0];
		    loading.style.display = "none";
			showTimeline(json);	
		}
		
	});
}

function showModal(response) {
	var modal = document.getElementById('myModal');
	modal.style.display = "block";

	var body = document.getElementsByTagName("body")[0];
	body.style.overflow = 'hidden';

	var category_name = document.getElementsByClassName("modal-category")[0];
	category_name.innerHTML = response["product"]["category"];

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


function pinClicked(rec_id) {
	// var recommendation_id = event.currentTarget.id;
	var recommendation_id = rec_id;
	var url = base_url + "/api/v1/recommendations/" + recommendation_id;
	httpGetAsync(url, function(json) {
		showModal(json["result"][0]);
	});
}


