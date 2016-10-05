from flask import Flask,request,jsonify,render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from flask_restful import reqparse
from flask_login import LoginManager, UserMixin, login_user, logout_user,current_user, redirect, url_for
from oauth import OAuthSignIn

import os
import json
import datetime
import facebook
import requests
import ipdb

app = Flask(__name__)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'
app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHECMY_TRACK_MODIFICATIONS'] = True
app.config['OAUTH_CREDENTIALS'] = {'facebook': {'id': '1485658648363694','secret': 'ebf9436f2c97491f3f70a59a88d8f595'}}
db = SQLAlchemy(app)

from models import User, Page

@login_manager.user_loader
def load_user(user_id):
	return User.query.get(user_id)


@app.route('/')
def hello():
	if not current_user.is_authenticated:
		return render_template('login.html')
	else:
		return redirect(url_for('show_timeline'))
	
@app.route('/timeline')
def show_timeline():
	user_id = current_user.user_id
	user = User.query.filter_by(user_id=user_id).first()
	url = "https://graph.facebook.com/"+ user_id + "?fields=cover&access_token=" + user.access_token
	r = requests.get(url)
	user.cover_id = r.json()['cover']['id']
	db.session.commit()
	return render_template('timeline.html',obj_id=user_id)
							
@app.route('/likes')
def show_likes():
	user_id = current_user.user_id
# 	user = User.query.filter_by(user_id=user_id).first()
	url = "https://graph.facebook.com/"+ user_id + "/likes?access_token=" + current_user.access_token
# 	r = requests.get(url)
# 	print(r.json())
# 	resp_json = r.json()
# 	pages = resp_json["data"]
# 	if 'paging' in resp_json.keys():
# 		if 'next' in resp_json["paging"].keys():
# 			next_url = resp_json["paging"]["next"] 
# 			while 1:
# 				if next_url is not None:
# 					next_r = requests.get(next_url)
# 					pages_json = next_r.json()
# 					pages.extend(pages_json["data"])
# 					if 'paging' in pages_json.keys():
# 						if 'next' in pages_json["paging"].keys():
# 							next_url = pages_json["paging"]["next"]
# 						else:
# 							next_url = None
# 					else:
# 						next_url = None
# 				else:
# 					break
# 
# 	print(len(pages))	
# 	for pDict in pages:
# 		page = Page.query.filter_by(page_id=pDict["id"]).first()	
# 		if not page:
# 			page = Page()
# 			page.created_by = user_id
# 			page.created_on = datetime.datetime.now()
# 			db.session.add(page)
# 		
# 		page.page_id = pDict["id"]
# 		page.page_name = pDict["name"]
# 		page.category_name = pDict["category"]
# 	db.session.commit()
# 	
# 	res = db.session.query(Page.category_name,func.count(Page.page_id)).group_by(Page.category_name).filter_by(created_by=user_id).order_by(func.count(Page.page_id).desc())
# 	final_likes = []
# 	for (like_name, count) in res:
# 		pages = Page.query.filter_by(category_name=like_name)
# 		likes = []
# 		index = 0
# 		for page in pages.all() :
# 			like_dict = {}
# 			like_dict["page_id"] = page.page_id
# 			like_dict["page_name"] = page.page_name
# 			like_dict["created_by"] = page.created_by
# 			like_dict["created_on"] = page.created_on
# 			like_dict["category_name"] = page.category_name
# 			likes.append(like_dict)
# 			index += 1
# 		final_likes.append({"category_name":like_name + " (%s)" % count,"likes":likes})
	
	return render_template('likes.html',likes_url=url)

							
							
@app.route('/friends')
def show_friends():
	user_id = current_user.user_id
	user = User.query.filter_by(user_id=user_id).first()
	url = "https://graph.facebook.com/"+ user_id + "/friends?access_token=" + user.access_token 
# 	return render_template('friends.html',friends_url=url)
# 	r = requests.get(url)
# 	print(r.json())
# 	resp_json = r.json()
# 	friends = resp_json["data"]
# 	if 'paging' in resp_json.keys():
# 		if 'next' in resp_json["paging"].keys():
# 			next_url = resp_json["paging"]["next"] 
# 			while 1:
# 				if next_url is not None:
# 					next_r = requests.get(next_url)
# 					pages_json = next_r.json()
# 					friends.extend(pages_json["data"])
# 					if 'paging' in pages_json.keys():
# 						if 'next' in pages_json["paging"].keys():
# 							next_url = pages_json["paging"]["next"]
# 						else:
# 							next_url = None
# 					else:
# 						next_url = None
# 				else:
# 					break
# 
# 	print(len(friends))	
# 	for friend in friends:
# 		upsertFriend(friend)
	return render_template('friends.html',
							obj_id=user_id, 
							username=user.name,
							friends_url=url)


def upsertFriend(friendDict):
	uid = friendDict['id']
	user = User.query.filter_by(user_id=uid).first()
	if not user:
		user = User(uid)
		db.session.add(user)
	
	user.name = friendDict['name']
	db.session.commit()


			
			
@app.route('/recommendations')
def show_recommendations():
	user_id = current_user.user_id
	user = User.query.filter_by(user_id=user_id).first()
	return render_template('recommendations.html',
							obj_id=user_id,
							username=user.name)

				
@app.route('/<user_id>/profile')
def show_profile(user_id):
	user = User.query.filter_by(user_id=user_id).first()
	return render_template('recommendations.html',
							obj_id=user_id,
							username=user.name)



@app.route('/<page_id>/detail')
def show_like_profile(page_id):
	page = Page.query.filter_by(page_id=page_id).first()
	url = "https://graph.facebook.com/"+ page_id + "?access_token=" + current_user.access_token 
	return render_template('like_detail.html',
							obj_id=page_id,
							username=page.page_name,
							like_url=url)
							
							
@app.route('/<page_id>/explore')
def showProductsForLike(page_id):
	page = Page.query.filter_by(page_id=page_id).first()
# 	final_products = []
# 	
# 	flipkart_url = "https://affiliate-api.flipkart.net/affiliate/search/json?query=" + page.page_name + "&resultCount=4"
# 	flipkart_r = requests.get(flipkart_url, headers={"Fk-Affiliate-Id":"paragdula","Fk-Affiliate-Token":"3f8a5b4876084bc5836265cdd26f0966"})
# 	
# 	print("Flipkart Response Starts")
# 	print(flipkart_r.json())
# 	print("Flipkart Response Ends")
# 	
# 	flipkart_products = flipkart_r.json()['productInfoList']
# 	final_flipkart_products = []
# 	for product in flipkart_products:
# 		final_products.append({'name':product['productBaseInfo']['productAttributes']['title'],
# 				'category':product['productBaseInfo']['productIdentifier']['categoryPaths']['categoryPath'][0][0]['title'],
# 				'image_url':product['productBaseInfo']['productAttributes']['imageUrls']['unknown'],
# 				'price':product['productBaseInfo']['productAttributes']['sellingPrice']['amount']})
# 
# # 	final_products.extend(final_flipkart_products)
# 	
# 	ebay_url = "http://svcs.ebay.com/services/search/FindingService/v1" \
# 					"?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0" \
# 					"&SECURITY-APPNAME=SapnaSol-b016-439b-ba9f-0a88df89de2e" \
# 					"&RESPONSE-DATA-FORMAT=JSON" \
# 					"&GLOBAL-ID=EBAY-US" \
# 					"&keywords=" + page.page_name + "" \
# 					"&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&paginationInput.entriesPerPage=4" \
# 					"&sortOrder=StartTimeNewest&outputSelector(0)=GalleryInfo&outputSelector(1)=PictureURLLarge" 
# 	ebay_r = requests.get(ebay_url)
# 	
# 	print("Ebay Response Starts")
# 	print(ebay_r.json())	
# 	print("Ebay Response Ends")
# 	
# 	ebay_json = ebay_r.json()
# 	ebay_response = ebay_json['findItemsByKeywordsResponse'][0]
# 	ebay_products = ebay_response['searchResult'][0]
# 
# 	final_ebay_products = []
# 	for product in ebay_products['item']:
# 		final_products.append({'name':product['title'][0],
# 					'category':product['primaryCategory'][0]['categoryName'][0],
# 					'image_url':product['galleryURL'][0],
# 					'price':product['sellingStatus'][0]['currentPrice'][0]['__value__']})
	
# 	final_products.extend(final_ebay_products)
	friends_url = "https://graph.facebook.com/"+ current_user.user_id + "/friends?access_token=" + current_user.access_token 
	return render_template('explore.html',
							obj_id=page_id,
							friends_url=friends_url,
							username=page.page_name)


	


@app.route('/api/v1/recommendations/<user_id>', methods=['GET'])
def get_recommendations_user(user_id):
	return "Recommendations for %s is in Progress" % user_id
	

@app.route('/api/v1/recommendations/<product_id>', methods=['GET'])
def get_recommendations_product(product_id):
	return "Recommendations for %s is in Progress" % product_id
	

@app.route('/api/v1/recommendation', methods=['POST'])
def create_recommendation():
	print(request.data);
	data = json.loads(request.data)
	print(data['password'])
	return jsonify({"result":"Create Recommendations is in Progress"})
	

@app.route('/api/v1/product', methods=['POST'])
def create_product():
	data = json.loads(request.data)
	return jsonify({"result":"Create Products is in Progress"})


@app.route('/api/v1/liked', methods=['POST'])
def create_liked():
	data = json.loads(request.data)
	return jsonify({"result":"Liked Pages is in Progress"})
	

@app.route('/api/v1/user', methods=['POST'])
def create_user():
	data = json.loads(request.data)
	print(data['email'])	
	user = User(data['user_id'],data['first_name'],data['last_name'],data['name'],data['email'])
	db.session.add(user)
	db.session.commit()
	return jsonify({"result":"In Progress"})


@app.route('/authorize/<provider>')
def oauth_authorize(provider):
 	if not current_user.is_anonymous:
 		return redirect(url_for('hello'))
	oauth = OAuthSignIn.get_provider(provider)
	return oauth.authorize()
	
@app.route('/callback/<provider>')
def oauth_callback(provider):
	if not current_user.is_anonymous:
		return redirect(url_for('hello'))
	oauth = OAuthSignIn.get_provider(provider)
	(uid, first_name, last_name, name, email, access_token,created_on,device_type,device_token)=oauth.callback()
	if uid is None:
		flash('Authentication Failed')
		return redirect(url_for('hello'))
	user = User.query.filter_by(user_id=uid).first()
	if not user:
		user = User(uid,first_name,last_name,name,email,access_token,created_on,device_type,device_token)
		db.session.add(user)
		db.session.commit()
	login_user(user, True)
	return redirect(url_for('show_timeline', user_id=uid))
	
	
