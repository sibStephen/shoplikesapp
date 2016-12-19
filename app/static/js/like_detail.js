
// Slider Methods

var segments = [];

function slider(seg) {
	segments = seg;
	var slider = document.getElementsByClassName("slider")[0];
	for (i in segments) {
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
			var gridview = document.getElementsByClassName("friends_gridview")[0];
			gridview.style.display = "none";
			gridview.innerHTML = "";

			var explore_reco_grid = document.getElementsByClassName("explore-grid-timeline")[0];
			explore_reco_grid.style.display = "none";
			explore_reco_grid.innerHTML = "";

			var reco_grid = document.getElementsByClassName("grid-timeline")[0];
			reco_grid.style.display = "block";

			recommendationsForLike();
		}
			break;
		case 1:
		{
			var explore_reco_grid = document.getElementsByClassName("grid-timeline")[0];
			explore_reco_grid.style.display = "none";
			explore_reco_grid.innerHTML = "";

			var reco_grid = document.getElementsByClassName("explore-grid-timeline")[0];
			reco_grid.style.display = "none";
			reco_grid.innerHTML = "";

			var gridview = document.getElementsByClassName("friends_gridview")[0];
			gridview.style.display = "block";

			getPeopleForPage();
		}
			break;
		case 2: 
		{
			var gridview = document.getElementsByClassName("friends_gridview")[0];
			gridview.style.display = "none";
			gridview.innerHTML = "";

			var explore_reco_grid = document.getElementsByClassName("grid-timeline")[0];
			explore_reco_grid.style.display = "none";
			explore_reco_grid.innerHTML = "";

			var reco_grid = document.getElementsByClassName("explore-grid-timeline")[0];
			reco_grid.style.display = "block";

			fetchProducts(page_name);
		}
			break;
	}

}


// Explore Grid Methods

var columns = 4;
var showModal = false;
var selected_product = null;
var page_id = null;
var base_url = null;
var page_name = null;
var currency_symbols = {
    'USD': '$', // US Dollar
    'EUR': '€', // Euro
    'CRC': '₡', // Costa Rican Colón
    'GBP': '£', // British Pound Sterling
    'ILS': '₪', // Israeli New Sheqel
    'INR': '₹', // Indian Rupee
    'JPY': '¥', // Japanese Yen
    'KRW': '₩', // South Korean Won
    'NGN': '₦', // Nigerian Naira
    'PHP': '₱', // Philippine Peso
    'PLN': 'zł', // Polish Zloty
    'PYG': '₲', // Paraguayan Guarani
    'THB': '฿', // Thai Baht
    'UAH': '₴', // Ukrainian Hryvnia
    'VND': '₫', // Vietnamese Dong
};


function setPageName(pg_name) {
	page_name = pg_name;
}

function arrangePins() {
	console.log('arranging pins!')
	var grid = document.getElementsByClassName('explore-grid-timeline')[0];
	grid.style.backgroundColor = 'transparent';
    if (grid) {
		var children = grid.children;
		var gridHeight = 0;
		if (children.length) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child.className == "explore-grid-recommendation") {			
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


function pin_clicked() {
	var modal = document.getElementById('myModal');
	modal.style.display = "block";
	var body = document.getElementsByTagName("body")[0];
	body.style.overflow = 'hidden';
	product_detail(event.currentTarget.id);
	showModal = true;
}


function recommendBtnClicked() {
	var recommend_link = document.getElementsByClassName("recommend-link")[0];
	var button = recommend_link.children[0];
	if (button.innerHTML == "RECOMMEND") {
		var modal_detail = document.getElementsByClassName("modal-detail")[0];
		modal_detail.style.height = '0px';

		var friends_table = document.getElementsByClassName("friends-table")[0];
		friends_table.style.height = "calc(100% - 60px)";

		button.innerHTML = 'CANCEL';
	} else if (button.innerHTML == "CANCEL") {
		var modal_detail = document.getElementsByClassName("modal-detail")[0];
		modal_detail.style.height = "calc(100% - 60px)";

		var friends_table = document.getElementsByClassName("friends-table")[0];
		friends_table.style.height = "0px";

		button.innerHTML = 'RECOMMEND';
	}
}

function friendClicked(friend_id) {
	var xhr = new XMLHttpRequest();
	var url = base_url + "/api/v1/recommendation";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.withCredentials = true;
	xhr.onreadystatechange = function () { 
    	if (xhr.readyState == 4 && xhr.status == 200) {
        	var json = JSON.parse(xhr.responseText);

        	var modal = document.getElementById('myModal');
	        modal.style.display = "none";
			var body = document.getElementsByTagName("body")[0];
			body.style.overflow = 'scroll';

			$.getScript("/static/js/sweetalert.min.js", function(){
				swal({   title: "Good job!", 
						 text: "You recommended a product to your friend."
						 }, function() {
						 	window.location = base_url + "/timeline";
						 });			
			});
        	console.log(json);
    	}
	}
	var data = JSON.stringify({"to_user_id":friend_id,"product":selected_product,"page_id":page_id});
	xhr.send(data);
}

function storePageId(pg_id) {
	page_id = pg_id;
}

function storeBaseURL(baseurl){
	base_url = baseurl;
}

function myfunction(response) {
	if (showModal == true) {
		var selProduct = {};
		selProduct["product_id"] = response["Item"]["ItemID"];
		var category_name = document.getElementsByClassName("modal-category")[0];
		category_name.innerHTML = response["Item"]["PrimaryCategoryName"];
		selProduct["category"] = response["Item"]["PrimaryCategoryName"];

		var product_name = document.getElementsByClassName("modal-name")[0];
		product_name.innerHTML = "<font size=5>"+response["Item"]["Title"]+"</font>";
		selProduct["product_name"] = response["Item"]["Title"];
		
		var product_price = document.getElementsByClassName("modal-price")[0];
		var currId = response["Item"]["CurrentPrice"]["CurrencyID"];
		product_price.innerHTML = currency_symbols[currId] + response["Item"]["CurrentPrice"]["Value"];
		selProduct["price"] = currency_symbols[currId] + response["Item"]["CurrentPrice"]["Value"];


		var urls = response["Item"]["PictureURL"];
		var product_image_carousel = document.getElementsByClassName("modal-image-carousel")[0];
		product_image_carousel.innerHTML = "";
		for (i in urls) {
			if (i >= 4) {
				break;
			}
			var url = urls[i];
			var node = document.createElement("div");
			node.className = "modal-image-cell";
			node.innerHTML = "<img src=" + url + "></img>";
			product_image_carousel.appendChild(node);
		} 

		var product_image = document.getElementsByClassName("modal-image")[0];
		var gallery_url = urls[0];
		product_image.style.backgroundImage = "url("+ gallery_url +")";
		// product_image.innerHTML = "<img src=" + gallery_url + "></img>";
		selProduct["image_url"] = gallery_url;

		var link = document.getElementsByClassName("buy-on-ebay-link")[0].firstChild;
		link.href = response["Item"]["ViewItemURLForNaturalSearch"];
		selProduct["product_url"] = response["Item"]["ViewItemURLForNaturalSearch"];
		
		var product_details = document.getElementsByClassName("modal-detail")[0];
		product_details.innerHTML = "<p>" + response["Item"]["Description"] + "</p>";
		selProduct["description"] = response["Item"]["Description"];
		selected_product = selProduct;
	} else {
		var pin = document.getElementById(response["Item"]["ItemID"]);
		var image_node = null;
		for (i in pin.children) {
			var child = pin.children[i];
			if (child.id == "pin_image") {
				image_node = child;
				break;
			}
		}
		var urls = response["Item"]["PictureURL"];
		image_node.src = urls[0];
		image_node.onload = function() {
			arrangePins();
		}
	}	
}


function product_detail(product_id) {
	var product = final_products.filter(function (el) {
    	return (el.product_id === product_id);
	})[0];

	var category_name = document.getElementsByClassName("modal-category")[0];
	category_name.innerHTML = product["product_category"];

	var product_name = document.getElementsByClassName("modal-name")[0];
	product_name.innerHTML = "<font size=5>"+product["product_name"]+"</font>";

	var product_price = document.getElementsByClassName("modal-price")[0];
	product_price.innerHTML = currency_symbols[product["currency"]] + product["product_price"];

	var product_image = document.getElementsByClassName("modal-image")[0];
	product_image.style.backgroundImage = "url("+ product["image_url"] +")";

	var link = document.getElementsByClassName("buy-on-ebay-link")[0].firstChild;
	link.href = product["product_url"];

	var detail_url = "/api/v1/product/detail/" + product["store"] + "/" + product_id;
	httpGetAsync(detail_url, function(response){
		var product_details = document.getElementsByClassName("modal-detail")[0];
		product_details.innerHTML = "<p>" + response["description"] + "</p>";
		product["description"] = response["description"]

		product["image_url"] = response["image_url"]
		var product_image = document.getElementsByClassName("modal-image")[0];
		product_image.style.backgroundImage = "url("+ product["image_url"] +")";

		selected_product = product;
	});
}


function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        	var respJson = JSON.parse(xmlHttp.responseText);
			callback(respJson);
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}



function getProducts(url,headers,callback) {
	 $.ajax({
            url: url,
            type: "GET",
            crossDomain: true,
            dataType: "jsonp",
            success: function (response) {
            	callback(response);
            },
            error: function (xhr, status) {
            	console.log()
            }
        });
}


window.onclick = function(event) {
	var modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
		var body = document.getElementsByTagName("body")[0];
		body.style.overflow = 'scroll';
    }
}

function getPeopleForPage() {
	var url = base_url + "/api/v1/people_page/" + page_id;
	var loading = document.getElementsByClassName("loading")[0];
	loading.style.display = "block";
	loading.innerHTML = "Loading...";

	httpGetAsync(url, function(json){
		var gridview = document.getElementsByClassName("friends_gridview")[0];
		var people = json["result"];
		gridview.innerHTML = "";
		if (people.length == 0) {
			loading.style.display = "block";
		} else {
			loading.style.display = "none";
			for (i in people) {
				var user = people[i];
				var node = document.createElement("div");
				node.className = "friend_cell";
				node.innerHTML = "<div class=\"friend_pic\"><img src=https://graph.facebook.com/"+user["user_id"]+"/picture></img></div><div class=\"friend_name\"><a href=\"/"+user["user_id"]+"/profile\">"+user["name"]+"</a></div>";
	        	gridview.appendChild(node);
			}
		}
	});
}


function getFriends(friends_url, add_header) {
	getProducts(friends_url, null, function(json) {
		var friends = json.data;
		var friends_table = document.getElementsByClassName('friends-table')[0];
		var tableNode;

		var innerHTML = "";
		if (add_header == true) {
			tableNode = document.createElement("table");
			innerHTML += "<th>Friends</th>";
		} else {
			tableNode = friends_table.children[0];
		}

		for (i in friends) {
			var friend = friends[i];
			innerHTML += "<tr onclick=\"friendClicked('"+friend.id+"')\"><td><img src=\"https://graph.facebook.com/"+friend.id+"/picture\" style=\"width:40px;border-radius:20px;height:40px\"></img> "+friend.name+"</td></tr>"
		}

		tableNode.innerHTML = innerHTML;
		friends_table.appendChild(tableNode);
	    if (json.paging.next) {
			getFriends(json['paging']['next'],false);
		}
	});
}

var final_products = null;

function fetchProducts(keyword) {
	var url = base_url + "/api/v1/products/" + keyword;

	var loading = document.getElementsByClassName("loading")[0];
	loading.style.display = "block";
	loading.innerHTML = "loading...";


	httpGetAsync(url, function(json){
		console.log(json);
		var products = json['result'];
		final_products = products;
		var grid = document.getElementsByClassName('explore-grid-timeline')[0];
		grid.innerHTML = '';
		if (products) {
			loading.style.display = "none";
			for (var i = 0; i < products.length; i++) {
				var product = products[i];
				var node = document.createElement("div");
				node.className = "explore-grid-recommendation";
				var category = product['product_category'];
				var name = product['product_name'];
				var image_url = product['image_url'];
				var price = product['product_price'];
				var product_id = product['product_id'];
				var currency = product['currency'];
				
				node.innerHTML = "<div class=\"explore-pin\" onclick=\"pin_clicked()\" id=" + product_id +"><div id=\"product_info\"><div class=\"explore-category-name\">" + category + "</div><div class=\"explore-product-name\">" + name + "</div></div><img src=\"" + image_url + "\" id=\"img_"+ product_id +"\"/><div class=\"explore-price\"><font color=\"white\">" + currency_symbols[currency] + price + "</font></div></div>";
				grid.appendChild(node);
				arrangePins();

				var pin_image = document.getElementById("img_" + product_id);
				pin_image.onload = function() {
					arrangePins();
				};
			}
		} else {
			loading.style.display = "block";
			loading.innerHTML = "There are no products that we could find taking "+ page_name +" as reference.";
		}
	});
}

// Recommendations Tab


function getRecommendations(url,headers,callback) {
	 $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (response) {
            	callback(response);
            },
            error: function (xhr, status) {
            	console.log()
            }
        });
}


function arrangeTimelinePins() {
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

function recommendationsForLike() {
	var url = base_url + "/api/v1/recommendations_for_page/" + page_id;
	var loading = document.getElementsByClassName("loading")[0];
	loading.style.display = "block";
	loading.innerHTML = "Loading...";

	getRecommendations(url,null, function(json) {
    	var respJson = json;
    	var recommendations = respJson["result"];
    	if (recommendations.length > 0) {
    		loading.style.display = "none";
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

				node.innerHTML = "<div class=\"pin\"><div id=\"from_user_info\"><img id=\"from_user_pic\" src=\""+from_user_pic+"\"/><div id=\"from_user_name\">"+ from_user["user_name"] +"</div></div> <div id=\"reco_info\"><div id=\"reco_text\">Recommends "+ to_user["user_name"] +"</div><div id=\"reco_timestamp\">30 secs ago</div></div><div id=\"product_info\"><div id=\"product_category\">"+ category + "</div><div id=\"product_name\">"+ name +"</div></div><img id=\""+product_id+"\" src=\""+image_url+"\" /><div id=\"product_price\"><font color=\"white\">"+price+"</font></div></div>";
				grid.appendChild(node);

				var image_node = document.getElementById(product_id);
				image_node.onload = function() {
					arrangeTimelinePins();
				};

				arrangeTimelinePins();
			}
		} else {
			loading.style.display = "block";
			loading.innerHTML = "There are no products recommended taking "+ page_name +" as reference. Click on Explore to find more interesting products to recommend.";
		}
	});
}

