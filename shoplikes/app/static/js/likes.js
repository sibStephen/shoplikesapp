function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        	var respJson = JSON.parse(xmlHttp.responseText);
        	var grouped_likes = {};
        	var likes = respJson.data;
        	console.log("likes\n");
        	console.log(likes);
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
			callback(xmlHttp.responseText);
        	if (respJson.paging.next) {
        		httpGetAsync(respJson['paging']['next'],callback);
        	}
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}