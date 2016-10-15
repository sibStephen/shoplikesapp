var friends_url;

//Friends Methods

function setFriendsURL(url) {
	friends_url = url
}

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
        		node.innerHTML = "<div class=\"friend_pic\"><img src=https://graph.facebook.com/"+friend.id+"/picture></img></div><div class=\"friend_name\"><a href=\""+friend.id+"/profile\">"+friend.name+"</a></div><div class=\"reco_cnt\">8 Products</div>";
        		gridview.appendChild(node);
        	}
        	loadFriendsGridView();
			callback(xmlHttp.responseText);
        	if (respJson.paging.next) {
        		httpGetAsync(respJson['paging']['next'],callback);
        	}
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


function segment_clicked(index) {
	debugger;
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
		}
			break;
		case 2: 
		{
			FBInvite();
		}
			break;
	}

}