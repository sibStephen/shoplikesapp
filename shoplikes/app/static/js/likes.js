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
						listInnerHTML += "<div class=\"product_cnt\">8 Products</div>";
						
						htmlNode.innerHTML = listInnerHTML;						
						likes_list.childNodes[1].appendChild(htmlNode);
					} else {
						
						var htmlNode = document.createElement("div");
						htmlNode.className = "likes_listcell";
						htmlNode.id = key;
						
						var innerHTML = "<div>" + key + "</div>";
						innerHTML += "<div class=\"likes_grid\">";
						innerHTML += "<div class=\"like_cell\">";
						innerHTML += "<div class=\"like_pic\"><img src=\"https://graph.facebook.com/" + like.id + "/picture?width=110&height=110\"/></div>";
						innerHTML += "<div class=\"like_name\"><a href=\"/"+ like.id +"/detail\">" + like.name + "</a></div>";
						innerHTML += "<div class=\"product_cnt\">8 Products</div>";
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
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}


function saveLike(like) {
	var xhr = new XMLHttpRequest();
	var url = "http://localhost:8080/api/v1/page";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
    	if (xhr.readyState == 4 && xhr.status == 200) {
        	var json = JSON.parse(xhr.responseText);
        	console.log(json);
    	}
	}
	var data = JSON.stringify({"page_id":like.id,"page_name":like.name,"category_name":like.category});
	xhr.send(data);
}

