function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        	var respJson = JSON.parse(xmlHttp.responseText);
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
						
						var listInnerHTML = "<div class=\"like_pic\"><img src=\"https://graph.facebook.com/" + like.id + "/picture?width=110&height=110\"/></div>";
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
						innerHTML += "<div class=\"like_pic\"><img src=\"https://graph.facebook.com/" + like.id + "/picture?width=110&height=110\"/></div>";
						innerHTML += "<div class=\"like_name\"><a href=\"/"+ like.id +"/detail\">" + like.name + "</a></div>";
						innerHTML += "<div class=\"product_cnt\" id=\""+like.id+"\"></div>";
						innerHTML += "</div>";
						innerHTML += "</div>";
						
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

			callback(xmlHttp.responseText);
        	if ("paging" in respJson) {
        		if ("next" in respJson["paging"]) {
        			httpGetAsync(respJson['paging']['next'],callback);
        		} else {
        		//reorder here
				var container = document.getElementsByClassName('likes_list')[0];
        		console.log(container.childNodes);
        		}
        	}
        }
    }
//    theUrl.replace(/&amp;/g, '&')

    xmlHttp.open("GET", theUrl.replace(/&amp;/g, '&') , true); // true for asynchronous 
    xmlHttp.send(null);
}


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


var base_url;

function storeBaseURL(url) {
	base_url = url;
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

