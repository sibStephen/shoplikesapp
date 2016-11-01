var friends_url;
var likes_url;
var appid;
var base_url;
var user_id;
var is_current_user;

//Friends Methods
function setIsCurrentUser(aBool) {
	is_current_user = aBool;
	if (is_current_user == "True") {
		slider(["Recommendations","Friends","Invite"]);
	} else {
		slider(["Recommendations","Likes","Friends"]);
	}
}

function setFriendsURL(url) {
	friends_url = url;
}

function setLikesURL(url) {
	likes_url = url;
}


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        	debugger;
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
		node.innerHTML = "<div id=\"segment_"+i+"\" onclick=\"segment_clicked("+i+")\">"+text+"</div>";
		slider.appendChild(node);
	}

	var selected = document.createElement("div");
	selected.className = "selected-segment";
	selected.style.width = (slider.clientWidth / segments.length) + "px"; 
	slider.appendChild(selected);
	segment_clicked(0);
}

function storeAppId(app_Id) {
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
	for (i in slider.children) {
		var sliderChild = document.getElementById("segment_" + i);
		if (sliderChild) {
			sliderChild.style.color = "#a3a3a3";
		}
	}
	var selected = document.getElementsByClassName("selected-segment")[0];
	selected.style.left = index * (slider.clientWidth / segments.length) + "px";
	var selectedSegment = document.getElementById("segment_" + index);
	selectedSegment.style.color = "#3F51B5";

	switch(index) {
		case 0:
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
		case 1:
		{
			if (is_current_user == "True") {
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
			} else {
				// Load Likes

				var gridview = document.getElementsByClassName("friends_gridview")[0];
				gridview.style.display = "none";

				var reco_grid = document.getElementsByClassName("grid-timeline")[0];
				reco_grid.style.display = "none";

				var likes_list = document.getElementsByClassName("likes_list")[0];
				likes_list.style.display = "block";
				likes_list.innerHTML = "";

				httpGetAsync(likes_url, function(jsonText){
					var respJson = JSON.parse(jsonText);
        			abc(respJson);
		        	if ("paging" in respJson) {
		        		if ("next" in respJson["paging"]) {
		        			httpGetAsync(respJson['paging']['next'],likes_callback);
		        		} else {
		        		//reorder here
		        		}
		        	}
				});
			}
		}
			break;
		case 2: 
		{
			if (is_current_user == "True") {
				FBInvite();
			} else {

			}
		}
			break;
	}
}



// Likes 

var likes_callback = function(jsonText) {
	var respJson = JSON.parse(jsonText);
    abc(respJson);
}

function abc(respJson) {
    var grouped_likes = {};
	var likes = respJson.data;
	likes.map( 
		function (like) {
			if (grouped_likes[like.category]) {
				var existing_likes = grouped_likes[like.category];
				existing_likes.push(like);
				grouped_likes[like.category] = existing_likes;
			} else {
				grouped_likes[like.category] = [like];
			}
		}
	);
	console.log(grouped_likes);
	var container = document.getElementsByClassName('likes_list')[0];
	for (key in grouped_likes) {
		var key_likes = grouped_likes[key];
		for (var i = 0; i < key_likes.length; i++) {
			var like = key_likes[i];
			saveLike(like);
			var likes_list = document.getElementById(like.category);
			if (likes_list) {
				var htmlNode = document.createElement("div");
				htmlNode.className = "like_cell"
				
				var listInnerHTML = "<div class=\"like_pic\" style=\"background-image:url(https://graph.facebook.com/"+like.id+"/picture?width=180&height=180);\"></div>";
				listInnerHTML += "<div class=\"like_name\"><a href=\"/"+ like.id +"/detail\">" + like.name + "</a></div>";
				listInnerHTML += "<div class=\"product_cnt\" id=\""+like.id+"\"></div>";
				
				htmlNode.innerHTML = listInnerHTML;						
				likes_list.childNodes[1].appendChild(htmlNode);
			} else {
				
				var htmlNode = document.createElement("div");
				htmlNode.className = "likes_listcell";
				htmlNode.id = key;
				
				var innerHTML = "<div class=\"like_section_header\">" + key + "</div>";
				innerHTML += "<div class=\"likes_grid\">";
				innerHTML += "<div class=\"like_cell\">";
				innerHTML += "<div class=\"like_pic\" style=\"background-image:url(https://graph.facebook.com/"+like.id+"/picture?width=180&height=180);\">";
				innerHTML += "</div>";
				innerHTML += "<div class=\"like_name\"><a href=\"/"+ like.id +"/detail\">" + like.name + "</a></div>";
				innerHTML += "<div class=\"product_cnt\" id=\""+like.id+"\"></div>";
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

};

function arrangeGridCells() {
	var likes_list = document.getElementsByClassName("likes_listcell"); 
	debugger;
	for (i in likes_list) {
		var sortedChildChildren = likes_list[i];
		var grid = undefined;
		for (j in sortedChildChildren.children) {
			var child = sortedChildChildren.children[j];
			if (child.className == "likes_grid") {
				grid = child;
				break;
			}
		}

		if (grid) {
			var toSortCells = Array.prototype.slice.call(grid.children, 0);
			toSortCells.sort(function(firstChild,secondChild) {
				var firstChildren = firstChild.children;

				var a = 0;
				var b = 0;

				for (first_ind in firstChildren) {
					var ch = firstChildren[first_ind];
					if (ch.className == "product_cnt") {
						var innerHTML = ch.innerHTML;
						var stripped = innerHTML.replace(" Product(s)", '');					
						if (stripped.length != 0) {
							a = parseInt(stripped);
						}
						break;
					}
				}

				var secondChildren = secondChild.children;
				for (second_ind in secondChildren) {
					var ch = secondChildren[second_ind];
					if (ch.className == "product_cnt") {
						var innerHTML = ch.innerHTML;
						var stripped = innerHTML.replace(" Product(s)", '');
						if (stripped.length != 0) {
							b = parseInt(stripped);
						}
						break;
					}
				}
				console.log("B : " + b + ", A : " + a);
				return b - a;
			});

			for (k in toSortCells) {
				var grid_child = toSortCells[k];
				grid.removeChild(grid_child);
				grid.appendChild(grid_child);
			}
		};
	}
}


function saveLike(like) {
	var xhr = new XMLHttpRequest();
	var url =  base_url + "/api/v1/page";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
    	if (xhr.readyState == 4 && xhr.status == 200) {
        	var json = JSON.parse(xhr.responseText);
        	console.log(json);

        	var product_cnt = document.getElementById(json["page_id"]);
        	if ("products" in json) {
        		var products = json["products"];
        		if (products) {
	        		product_cnt.innerHTML = products.length + " Product(s)";
		        	arrangeGridCells();
	        	} 
        	} 
    	}
		
	}
	var data = JSON.stringify({"page_id":like.id,"page_name":like.name,"category_name":like.category});
	xhr.send(data);
}


