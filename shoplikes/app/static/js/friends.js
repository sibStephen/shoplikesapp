function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        	var respJson = JSON.parse(xmlHttp.responseText);
        	var friends = respJson.data;
        	//manipulate HTML DOM here
        	
			var gridview = document.getElementsByClassName("friends_gridview")[0];
        	for (i in friends) {
        		var friend = friends[i];
        		var node = document.createElement("div");
        		node.className = "friend_cell";
        		node.innerHTML = "<div class=\"friend_pic\"><img src=https://graph.facebook.com/"+friend.id+"/picture></img></div><div class=\"friend_name\"><a href=\""+friend.id+"/friends\">"+friend.name+"</a></div><div class=\"reco_cnt\">8 Products</div>";
        		gridview.appendChild(node);
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


// 		<div class="friend_cell">
// 			<div class="friend_pic"><img></img></div>
// 			<div class="friend_name">Parag</div>
// 			<div class="reco_cnt">8 Products</div>
// 		</div>



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
	
	var links = document.getElementsByClassName("links")[0];
	
	var friends_link = document.createElement("a");
	friends_link.id = "friends_link";
	friends_link.innerHTML = "Friends";
	friends_link.setAttribute('href', "/friends");
	links.appendChild(friends_link);
	
	var reco_link = document.createElement("a");
	reco_link.id = "reco_link";
	reco_link.innerHTML= "Recommendations";
	reco_link.setAttribute('href', "/recommendations");
	links.appendChild(reco_link);
	
// 	var invite_link = document.createElement("a");
// 	invite_link.id = "invite_link";
// 	invite_link.innerHTML= "Invite";
// 	invite_link.setAttribute('href', "/invite");
// 	links.appendChild(invite_link);


}

var body = document.getElementsByTagName("body")[0];;
body.onload = loadFriendsGridView;
