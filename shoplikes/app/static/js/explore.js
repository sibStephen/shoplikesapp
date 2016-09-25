var columns = 5;


function arrangePins() {
	var grid = document.getElementsByClassName('explore-grid-timeline')[0];
	grid.style.marginTop = '20px';
    if (grid) {
		var children = grid.children;
		var gridHeight = 0;
		if (children.length) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (child.className == "explore-grid-recommendation") {
					console.log('child.clientHeight =' + child.clientHeight);
					console.log('child.clientWidth =' + child.clientWidth);
					console.log('i = ' + i);
			
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


// function getFlipkartProducts(keyword, callback) {
// 	var xmlHttp = new XMLHttpRequest();
//     xmlHttp.onreadystatechange = function() { 
//         if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
//         	var respJson = JSON.parse(xmlHttp.responseText);
//         	var flipkart_products = respJson['productInfoList'];
//         	
//         	var grid = document.getElementsByClassName('grid-timeline')[0];
//         	for (product in flipkart_products) {
//         		var node = document.createElement("div");
//         		node.className = "grid-recommendation";
//         		var category = product['productBaseInfo']['productIdentifier']['categoryPaths']['categoryPath'][0][0]['title'];
//         		var name = product['productBaseInfo']['productAttributes']['title'];
//         		var image_url = product['productBaseInfo']['productAttributes']['imageUrls']['unknown'];
//         		var price = product['productBaseInfo']['productAttributes']['sellingPrice']['amount'];
//         		node.innerHTML = "<div class=\"pin\"><div id=\"product_info\"><div id=\"product_category\">" + category + "</div><div id=\"product_name\">" + name + "</div></div><img src=\"" + image_url + "\" /><div id=\"product_price\"><font color=\"white\">" + price + "</font></div></div>";
//         		grid.appenChild(node);				 
//         	}
//         	arrangePins();
//         	//manipulate HTML DOM here
//         	
// 			callback(xmlHttp.responseText);
//         }
//     }
//     var theUrl = "https://affiliate-api.flipkart.net/affiliate/search/json?query=" + keyword + "&resultCount=4";
//     xmlHttp.open("GET", theUrl, true); // true for asynchronous 
//     xmlHttp.setRequestHeader("Fk-Affiliate-Id", "paragdula");
//     xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*");
//     xmlHttp.setRequestHeader("Fk-Affiliate-Token", "3f8a5b4876084bc5836265cdd26f0966");
//     //{"Fk-Affiliate-Id":"paragdula","Fk-Affiliate-Token":"3f8a5b4876084bc5836265cdd26f0966"}
//     xmlHttp.send(null);
// }
// 
// 
// function getEbayProducts(keyword, callback) {
// 	var xmlHttp = new XMLHttpRequest();
//     xmlHttp.onreadystatechange = function() { 
//         if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
//         	var respJson = JSON.parse(xmlHttp.responseText);
//         	var ebay_products = respJson['findItemsByKeywordsResponse'][0]["searchResult"][0];
//         	
//         	var grid = document.getElementsByClassName('grid-timeline')[0];
//         	for (product in ebay_products) {
//         		var node = document.createElement("div");
//         		node.className = "grid-recommendation";
//         		var category = product['primaryCategory'][0]['categoryName'][0];
//         		var name = product['title'][0];
//         		var image_url = product['galleryURL'][0];
//         		var price = product['sellingStatus'][0]['currentPrice'][0]['__value__'];
//         		node.innerHTML = "<div class=\"pin\"><div id=\"product_info\"><div id=\"product_category\">" + category + "</div><div id=\"product_name\">" + name + "</div></div><img src=\"" + image_url + "\" /><div id=\"product_price\"><font color=\"white\">" + price + "</font></div></div>";
//         	arrangePins();
//         	//manipulate HTML DOM here
// 			callback(xmlHttp.responseText);
//         }
//     }
//     var theUrl = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=SapnaSol-b016-439b-ba9f-0a88df89de2e&RESPONSE-DATA-FORMAT=JSON&GLOBAL-ID=EBAY-US&keywords=" + keyword + "&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&paginationInput.entriesPerPage=4&sortOrder=StartTimeNewest&outputSelector(0)=GalleryInfo&outputSelector(1)=PictureURLLarge";
//     xmlHttp.open("GET", theUrl, true); // true for asynchronous 
//     xmlHttp.send(null);
// }



function pin_clicked() {
	console.log(event.currentTarget.id);	
	$("#pinModal").modal('show');
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
                alert("error");
            }
        });
}


function fetchProducts(keyword) {
	var ebay_url = "http://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=SapnaSol-b016-439b-ba9f-0a88df89de2e&RESPONSE-DATA-FORMAT=JSON&GLOBAL-ID=EBAY-US&keywords=" + keyword + "&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&paginationInput.entriesPerPage=10&sortOrder=StartTimeNewest&outputSelector(0)=GalleryInfo&outputSelector(1)=PictureURLLarge";
	getProducts(ebay_url, null ,function(json) {
		var ebay_products = json['findItemsByKeywordsResponse'][0]["searchResult"][0];
		var grid = document.getElementsByClassName('explore-grid-timeline')[0];
		var products = ebay_products["item"];
		for (var i = 0; i < products.length; i++) {
			var product = products[i];
			var node = document.createElement("div");
			node.className = "explore-grid-recommendation";
			var category = product['primaryCategory'][0]['categoryName'][0];
			var name = product['title'][0];
			var image_url = product['galleryURL'][0];
			var price = product['sellingStatus'][0]['currentPrice'][0]['__value__'];
			var product_id = product['itemId'][0];
			node.innerHTML = "<div class=\"explore-pin\" onclick=\"pin_clicked()\" id=" + product_id +"><div id=\"product_info\"><div id=\"product_category\">" + category + "</div><div id=\"product_name\">" + name + "</div></div><img src=\"" + image_url + "\" /><div id=\"product_price\"><font color=\"white\">" + price + "</font></div></div>";
			grid.appendChild(node);
		}
		arrangePins();
	});
// 	var flipkart_url = "https://affiliate-api.flipkart.net/affiliate/search/json?query=" + keyword + "&resultCount=4";
// 	getProducts(flipkart_url, {"Fk-Affiliate-Id":"paragdula","Fk-Affiliate-Token":"3f8a5b4876084bc5836265cdd26f0966"} ,function(json) {
// 		
// 	});
}
