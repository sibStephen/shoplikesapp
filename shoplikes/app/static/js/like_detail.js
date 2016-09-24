var columns = 4;

function arrangePins() {
	var grid = document.getElementsByClassName('grid-timeline')[0];
    if (grid) {
    	grid.style.top = '20px';
		var children = grid.childNodes;
		var gridHeight = 0;
		if (children.length) {
			console.log(children);
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child.className == "grid-recommendation") {
					console.log('child.clientHeight =' + child.clientHeight);
					console.log('i = ' + i);
					var quotient = Math.floor(i / (2 * columns));
					var mod = Math.floor(i % (2 * columns));
					console.log('mod = ' + mod);
					console.log('quotient = ' + quotient);
			
					//calculating top
					if (quotient == 0) {
						child.style.top = '0px';				
					} else {
						var top = 0;
						for (j = 0; j < quotient; j ++) {
							var childIndex = i - (2 * columns * (j + 1));
							console.log('i - (j * columns) = ' + childIndex);
							var aboveChild = children[childIndex]; 
							top += aboveChild.clientHeight;
						}					
						child.style.top = top + 'px';				
					}
			
					//calculating left
					console.log('child.clientWidth = ' + child.clientWidth);
					child.style.left = child.clientWidth * ((mod - 1)/2) + 'px';
					if (gridHeight < child.clientHeight + child.offsetTop) {
						gridHeight = child.clientHeight + child.offsetTop;
					}
				}
			}
		}
		grid.style.height = gridHeight + 'px';
    }
}


function loadLikeDetailView(page_id) {
	var links = document.getElementsByClassName("links")[0];
	
	if (document.getElementById("friends_link") == undefined) {
		var friends_link = document.createElement("a");
		friends_link.id = "friends_link";
		friends_link.innerHTML = "People";
		friends_link.setAttribute('href', "/friends");
		links.appendChild(friends_link);
	}	
	
	if (document.getElementById("reco_link") == undefined) {
		var reco_link = document.createElement("a");
		reco_link.id = "reco_link";
		reco_link.innerHTML= "Recommendations";
		reco_link.setAttribute('href', "/recommendations");
		links.appendChild(reco_link);
	}
	
	if (document.getElementById("explore_link") == undefined) {
		var explore_link = document.createElement("a");
		explore_link.id = "explore_link";
		explore_link.innerHTML= "Explore";
		explore_link.setAttribute('href', "/"+page_id+"/explore");
		links.appendChild(explore_link);
	}
	
	arrangePins();
}
