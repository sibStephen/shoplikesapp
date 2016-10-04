var columns = 4;
var showModal = false;
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

function myfunction(response) {
	if (showModal == true) {
		var category_name = document.getElementsByClassName("modal-category")[0];
		category_name.innerHTML = response["Item"]["PrimaryCategoryName"];

		var product_name = document.getElementsByClassName("modal-name")[0];
		product_name.innerHTML = "<font size=5>"+response["Item"]["Title"]+"</font>";
		
		var product_price = document.getElementsByClassName("modal-price")[0];
		var currId = response["Item"]["CurrentPrice"]["CurrencyID"];
		product_price.innerHTML = currency_symbols[currId] + response["Item"]["CurrentPrice"]["Value"];

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
		
		var link = document.getElementsByClassName("buy-on-ebay-link")[0].firstChild;
		link.href = response["Item"]["ViewItemURLForNaturalSearch"];
		
		var product_details = document.getElementsByClassName("modal-detail")[0];
		product_details.innerHTML = "<p>" + response["Item"]["Description"] + "</p>";
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
