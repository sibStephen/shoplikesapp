var columns = 4;
var showModal = false;
var selected_product = null;
var page_id = null;
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
	var url = "http://localhost:8080/api/v1/recommendation";
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () { 
    	if (xhr.readyState == 4 && xhr.status == 200) {
    		debugger;
        	var json = JSON.parse(xhr.responseText);
        	console.log(json.email + ", " + json.password)
    	}
	}
	var data = JSON.stringify({"to_user_id":friend_id,"product":selected_product,"page_id":page_id});
	xhr.send(data);
}

function storePageId(pg_id) {
	page_id = pg_id;
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
		product_image.innerHTML = "<img src=" + gallery_url + "></img>";
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
	var ebay_url = "http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=SapnaSol-b016-439b-ba9f-0a88df89de2e&siteid=0&version=967&ItemID=" + product_id + "&callbackname=myfunction&IncludeSelector=TextDescription,ItemSpecifics,Details";
	getProducts(ebay_url, null ,function(json) {

	});
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

function getFriends(friends_url, add_header) {
	getProducts(friends_url, null, function(json) {
		var friends = json.data;
		debugger;
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
			innerHTML += "<tr onclick=\"friendClicked(" + friend.id + ")\"><td>"+friend.name+"</td></tr>"
		}

		tableNode.innerHTML = innerHTML;
		friends_table.appendChild(tableNode);
	    if (json.paging.next) {
			getFriends(json['paging']['next'],false);
		}
	});
}


function fetchProducts(keyword) {
	var ebay_url = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=SapnaSol-b016-439b-ba9f-0a88df89de2e&RESPONSE-DATA-FORMAT=JSON&GLOBAL-ID=EBAY-US&keywords=" + keyword + "&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&paginationInput.entriesPerPage=8&sortOrder=StartTimeNewest&outputSelector(0)=GalleryInfo&outputSelector(1)=PictureURLLarge";
	getProducts(ebay_url, null ,function(json) {
		var ebay_products = json['findItemsByKeywordsResponse'][0]["searchResult"][0];
		var grid = document.getElementsByClassName('explore-grid-timeline')[0];
		var products = ebay_products["item"];
		grid.innerHTML = '';
		if (products) {
			for (var i = 0; i < products.length; i++) {
				var product = products[i];
				var node = document.createElement("div");
				node.className = "explore-grid-recommendation";
				var category = product['primaryCategory'][0]['categoryName'][0];
				var name = product['title'][0];
				var image_url = product['galleryURL'][0];
				var price = product['sellingStatus'][0]['currentPrice'][0]['__value__'];
				var product_id = product['itemId'][0];
				
// 				<div class="pin">
// 					<div id="product_info">
// 						<div id="product_category">Loading Category Name..</div>
// 						<div id="product_name">Loading Product Name...</div>
// 						<img src="http://cdn1.marathistars.com/wp-content/uploads/2016/04/YZ-Marathi-Movie-First-Look-Poster.jpg"/>
// 						<div id="product_price"><font color=\"white\">Loading Price...</font></div>
// 					</div>
// 				</div>
// 				debugger;
				node.innerHTML = "<div class=\"explore-pin\" onclick=\"pin_clicked()\" id=" + product_id +"><div id=\"product_info\"><div class=\"explore-category-name\">" + category + "</div><div class=\"explore-product-name\">" + name + "</div></div><img src=\"" + image_url + "\" id=\"pin_image\"/><div class=\"explore-price\"><font color=\"white\">" + "$" + price + "</font></div></div>";
				grid.appendChild(node);
				arrangePins();
				
				product_detail(product_id);

// 				var image_node = document.getElementById("pin_image");
// 				image_node.onload = function() {
// 					//setInterval(arrangePins, 1000);
// 					arrangePins();
// 				}
			}
		} else {
			var node = document.createElement("div");
			node.className = "explore-grid-recommendation";
			node.innerHTML = "No Products found!!!";
			node.style.textAlign = "center";
			node.style.fontSize = "40px";
			node.style.width = "100%";
			grid.appendChild(node);
		}	
	});
// 	var flipkart_url = "https://affiliate-api.flipkart.net/affiliate/search/json?query=" + keyword + "&resultCount=4";
// 	getProducts(flipkart_url, {"Fk-Affiliate-Id":"paragdula","Fk-Affiliate-Token":"3f8a5b4876084bc5836265cdd26f0966"} ,function(json) {
// 		
// 	});
}
