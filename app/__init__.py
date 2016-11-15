from flask import Flask,request,jsonify,render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, desc, or_
from flask_restful import reqparse
from flask_login import LoginManager, UserMixin, login_user, logout_user,current_user, redirect, url_for, login_required
from oauth import OAuthSignIn
from flask_cors import CORS, cross_origin
from celery import Celery

import os
import json
import datetime
import facebook
import requests
import ipdb
import uuid
import urllib


app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app, resources={r"/api/*": {"origins":"shoplikes-staging.herokuapp.com"}})

db = SQLAlchemy(app)
app.config['CELERY_BROKER_URL'] = os.environ['REDISCLOUD_URL'] #'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = os.environ['REDISCLOUD_URL']# 'redis://localhost:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

from models import User, Page, Product, Recommendation
from config import DevelopmentConfig, StagingConfig

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'
app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHECMY_TRACK_MODIFICATIONS'] = True
app.config['OAUTH_CREDENTIALS'] = {'facebook': {'id': app.config['APP_ID'],'secret': app.config['APP_SECRET']}}


@login_manager.user_loader
def load_user(user_id):
	return User.query.get(user_id)


@app.route('/')
def hello():
	if not current_user.is_authenticated:
		return render_template('login.html')
	else:
		return redirect(url_for('show_timeline'))


@app.route('/logout')
def logout():
    return render_template('login.html')


@app.route('/push')
def push():
	return render_template('push.html')

	
@app.route('/timeline')
@login_required
def show_timeline():
	return render_template('timeline.html',nav_obj_id=current_user.user_id,
											nav_username=current_user.first_name,
											obj_id=current_user.user_id,
											username=current_user.first_name,
											 base_url=app.config['BASE_URL'])

							
@app.route('/likes')
@login_required
def show_likes():
	user_id = current_user.user_id
	url = "https://graph.facebook.com/"+ user_id + "/likes?access_token=" + current_user.access_token + "&fields=id,name,category,created_time"
	return render_template('likes.html',obj_id=current_user.user_id,
										likes_url=url,
										username=current_user.first_name,
										base_url=app.config['BASE_URL'],
										nav_obj_id=current_user.user_id,
										nav_username=current_user.first_name)



@app.route('/profile')
@login_required
def show_profile():
	user = User.query.filter_by(user_id=current_user.user_id).first()
	url = "https://graph.facebook.com/"+ user.user_id + "/friends?access_token=" + current_user.access_token 
	return render_template('profile.html',
							obj_id=user.user_id,
							is_current_user=True,
							username=user.name,
							friends_url=url,
							appId=app.config['APP_ID'],
							base_url=app.config['BASE_URL'],
							nav_obj_id=current_user.user_id,
							nav_username=current_user.first_name)


@app.route('/<user_id>/profile')
def show_user_profile(user_id):
	user = User.query.filter_by(user_id=user_id).first()
	url = "https://graph.facebook.com/"+ user.user_id + "/friends?access_token=" + current_user.access_token 
	likes_url = "https://graph.facebook.com/"+ user_id + "/likes?access_token=" + current_user.access_token + "&fields=id,name,category,created_time"
	return render_template('profile.html',
							obj_id=user_id,
							is_current_user=False,
							username=user.name,
							friends_url=url,
							likes_url=likes_url,
							base_url=app.config['BASE_URL'],
							nav_obj_id=current_user.user_id,
							nav_username=current_user.first_name)




@app.route('/<page_id>/detail')
def show_like_profile(page_id):
	user = current_user
	page = Page.query.filter_by(page_id=page_id).first()
	url = "https://graph.facebook.com/"+ page_id + "?access_token=" + current_user.access_token 
	friends_url = "https://graph.facebook.com/"+ user.user_id + "/friends?access_token=" + user.access_token 
	return render_template('like_detail.html',
							obj_id=page_id,
							username=page.page_name,
							base_url=app.config['BASE_URL'],
							like_url=url,
							friends_url=friends_url,
							nav_obj_id=current_user.user_id,
							nav_username=current_user.first_name)

							
							
@app.route('/friends')
def show_friends():
	user_id = current_user.user_id
	user = User.query.filter_by(user_id=user_id).first()
	url = "https://graph.facebook.com/"+ user_id + "/friends?access_token=" + user.access_token 
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
	user_id = curr_user.user_id
	user = User.query.filter_by(user_id=user_id).first()
	return render_template('recommendations.html',
							obj_id=user_id,
							username=user.name)



@app.route('/privacypolicy')
def privacypolicy():
	return render_template('privacypolicy.html')
									
							
@app.route('/<page_id>/explore')
def showProductsForLike(page_id):
	page = Page.query.filter_by(page_id=page_id).first()
	friends_url = "https://graph.facebook.com/"+ curr_user.user_id + "/friends?access_token=" + curr_user.access_token 
	return render_template('explore.html',
							obj_id=page_id,
							friends_url=friends_url,
							username=page.page_name)


@app.route('/api/v1/people_page/<page_id>', methods=['GET'])
@cross_origin()
def people_for_page(page_id):
	page = Page.query.filter_by(page_id=page_id).first()
	final_users = []
	for user in page.users:
		final_users.append({"user_id":user.user_id,"name":user.name})
	return jsonify({"result":final_users})



@app.route('/api/v1/recommendations/<recommendation_id>', methods=['GET'])
@cross_origin()
def get_recommendation(recommendation_id):
	recommendations = Recommendation.query.filter_by(recommendation_id=recommendation_id)
	final_recommendations = []
	for recommendation in recommendations:	
		recommendation_id = recommendation.recommendation_id
		product = Product.query.filter_by(product_id=recommendation.product_id).first()
		from_user = User.query.filter_by(user_id=recommendation.from_user_id).first()
		to_user = User.query.filter_by(user_id=recommendation.to_user_id).first()
		page = Page.query.filter_by(page_id=recommendation.page_id).first()
		final_recommendations.append({"recommendation_id":recommendation_id, "created_on":recommendation.created_on, "from_user":{"user_id":from_user.user_id,"user_name":from_user.name},"to_user":{"user_id":to_user.user_id,"user_name":to_user.name},"product":{"product_id":product.product_id,"product_name":product.product_name,"product_url":product.product_url,"image_url":product.image_url,"category":product.category,"description":product.description,"price":product.price},"page":{"page_id":page.page_id,"page_name":page.page_name,"created_by":page.created_by,"category_name":page.category_name}})
	return jsonify({"result":final_recommendations})


@app.route('/api/v1/recommendations_timeline/<user_id>', methods=['GET'])
@cross_origin()
def get_recommendations_timeline(user_id):
#	recommendations = db.session.query.filter(or_(Recommendation.from_user_id=user_id, Recommendation.to_user_id=user_id))
	recommendations = Recommendation.query.filter_by(from_user_id=user_id).order_by(desc("created_on"))
	final_recommendations = []
	for recommendation in recommendations:	
		recommendation_id = recommendation.recommendation_id
		product = Product.query.filter_by(product_id=recommendation.product_id).first()
		from_user = User.query.filter_by(user_id=recommendation.from_user_id).first()
		to_user = User.query.filter_by(user_id=recommendation.to_user_id).first()
		page = Page.query.filter_by(page_id=recommendation.page_id).first()
		is_senders_liked = False
		if page in from_user.pages:
			is_senders_liked = True
		final_recommendations.append({"is_senders_liked":is_senders_liked,"recommendation_id":recommendation_id, "created_on":recommendation.created_on, "from_user":{"user_id":from_user.user_id,"user_name":from_user.name},"to_user":{"user_id":to_user.user_id,"user_name":to_user.name},"product":{"product_id":product.product_id,"product_name":product.product_name,"product_url":product.product_url,"image_url":product.image_url,"category":product.category,"description":product.description,"price":product.price},"page":{"page_id":page.page_id,"page_name":page.page_name,"created_by":page.created_by,"category_name":page.category_name}})
	return jsonify({"result":final_recommendations})



@app.route('/api/v1/recommendations_from_user/<user_id>', methods=['GET'])
@cross_origin()
def get_recommendations_from_user(user_id):
	recommendations = Recommendation.query.filter_by(from_user_id=user_id).order_by(desc("created_on"))
	final_recommendations = []
	for recommendation in recommendations:	
		recommendation_id = recommendation.recommendation_id
		product = Product.query.filter_by(product_id=recommendation.product_id).first()
		from_user = User.query.filter_by(user_id=recommendation.from_user_id).first()
		to_user = User.query.filter_by(user_id=recommendation.to_user_id).first()
		page = Page.query.filter_by(page_id=recommendation.page_id).first()
		final_recommendations.append({"recommendation_id":recommendation_id, "created_on":recommendation.created_on, "from_user":{"user_id":from_user.user_id,"user_name":from_user.name},"to_user":{"user_id":to_user.user_id,"user_name":to_user.name},"product":{"product_id":product.product_id,"product_name":product.product_name,"product_url":product.product_url,"image_url":product.image_url,"category":product.category,"description":product.description,"price":product.price},"page":{"page_id":page.page_id,"page_name":page.page_name,"created_by":page.created_by,"category_name":page.category_name}})
	return jsonify({"result":final_recommendations})


@app.route('/api/v1/recommendations_to_user/<user_id>', methods=['GET'])
@cross_origin()
def get_recommendations_to_user(user_id):
	recommendations = Recommendation.query.filter_by(to_user_id=user_id)
	final_recommendations = []
	for recommendation in recommendations:	
		recommendation_id = recommendation.recommendation_id
		product = Product.query.filter_by(product_id=recommendation.product_id).first()
		from_user = User.query.filter_by(user_id=recommendation.from_user_id).first()
		to_user = User.query.filter_by(user_id=recommendation.to_user_id).first()
		page = Page.query.filter_by(page_id=recommendation.page_id).first()
		final_recommendations.append({"recommendation_id":recommendation_id,"from_user":{"user_id":from_user.user_id,"user_name":from_user.name},"to_user":{"user_id":to_user.user_id,"user_name":to_user.name},"product":{"product_id":product.product_id,"product_name":product.product_name,"product_url":product.product_url,"image_url":product.image_url,"category":product.category,"description":product.description,"price":product.price},"page":{"page_id":page.page_id,"page_name":page.page_name,"created_by":page.created_by,"category_name":page.category_name}})
	return jsonify({"result":final_recommendations})


@app.route('/api/v1/recommendations_for_page/<page_id>', methods=['GET'])
@cross_origin()
def get_recommendations_page(page_id):
	recommendations = Recommendation.query.filter_by(page_id=page_id)
	final_recommendations = []
	for recommendation in recommendations:	
		recommendation_id = recommendation.recommendation_id
		product = Product.query.filter_by(product_id=recommendation.product_id).first()
		from_user = User.query.filter_by(user_id=recommendation.from_user_id).first()
		to_user = User.query.filter_by(user_id=recommendation.to_user_id).first()
		page = Page.query.filter_by(page_id=recommendation.page_id).first()
		final_recommendations.append({"recommendation_id":recommendation_id,"from_user":{"user_id":from_user.user_id,"user_name":from_user.name},"to_user":{"user_id":to_user.user_id,"user_name":to_user.name},"product":{"product_id":product.product_id,"product_name":product.product_name,"product_url":product.product_url,"image_url":product.image_url,"category":product.category,"description":product.description,"price":product.price},"page":{"page_id":page.page_id,"page_name":page.page_name,"created_by":page.created_by,"category_name":page.category_name}})
	return jsonify({"result":final_recommendations})

	

@app.route('/api/v1/recommendations_for_product/<product_id>', methods=['GET'])
@cross_origin()
def get_recommendations_product(product_id):
	recommendations = Recommendation.query.filter_by(product_id=product_id)
	final_recommendations = []
	for recommendation in recommendations:	
		recommendation_id = recommendation.recommendation_id
		product = Product.query.filter_by(product_id=recommendation.product_id).first()
		from_user = User.query.filter_by(user_id=recommendation.from_user_id).first()
		to_user = User.query.filter_by(user_id=recommendation.to_user_id).first()
		page = Page.query.filter_by(page_id=recommendation.page_id).first()
		final_recommendations.append({"recommendation_id":recommendation_id,"from_user":{"user_id":from_user.user_id,"user_name":from_user.name},"to_user":{"user_id":to_user.user_id,"user_name":to_user.name},"product":{"product_id":product.product_id,"product_name":product.product_name,"product_url":product.product_url,"image_url":product.image_url,"category":product.category,"description":product.description,"price":product.price},"page":{"page_id":page.page_id,"page_name":page.page_name,"created_by":page.created_by,"category_name":page.category_name}})
	return jsonify({"result":final_recommendations})
	

@app.route('/api/v1/recommendation', methods=['POST'])
@cross_origin()
def create_recommendation():
	data = json.loads(request.data)

	product = Product.query.filter_by(product_id=data["product"]["product_id"]).first()
	if product == None:
		product = Product(data["product"]["product_id"])
	product.product_name = data["product"]["product_name"]
	product.price = data["product"]["price"]
	product.category = data["product"]["category"]
	product.description = data["product"]["description"]
	product.product_url = data["product"]["product_url"]
	product.image_url = data["product"]["image_url"]
	db.session.add(product)

	recommendation = Recommendation(uuid.uuid4())
	recommendation.from_user_id = current_user.user_id
	recommendation.to_user_id = data["to_user_id"]
	recommendation.product_id = data["product"]["product_id"]
	recommendation.page_id = data["page_id"]
	recommendation.created_on = datetime.datetime.now()

	db.session.add(recommendation)
	db.session.commit()
	return jsonify({"result":"Recommendation is saved"})
	

@app.route('/api/v1/product', methods=['POST'])
def create_product():
	data = json.loads(request.data)
	return jsonify({"result":"Create Products is in Progress"})


@app.route('/api/v1/page', methods=['POST'])
@cross_origin(origin=app.config['BASE_URL'],headers=['Content- Type','Authorization'])
def upsert_page():
	data = json.loads(request.data)
	page = Page.query.filter_by(page_id=data["page_id"]).first()

	if not page:
		page = Page()
		page.page_id = data["page_id"]
		page.created_on = datetime.datetime.now()
		page.created_by = current_user.user_id

	page.page_name = data["page_name"]
	page.category_name = data["category_name"]

	page_likers = page.users
	if not page_likers:
		page.users = [current_user]
	else:
		exists = False

		for user in page.users:
			if user.user_id == current_user.user_id:
				exists = True
				break

		if exists == False:
			page_likers.append(current_user)
			page.users = page_likers


	db.session.add(page)
	db.session.commit()

	#fetch products against that like
	recommendations = Recommendation.query.filter_by(page_id = page.page_id)
	products = []
	for recommendation in recommendations:
		product = Product.query.filter_by(product_id=recommendation.product_id).first()
		products.append({"product_id":product.product_id, "product_name":product.product_name})

	if not products:
		return jsonify({"page_id":page.page_id, "page_name": page.page_name})
	else:
		return jsonify({"page_id":page.page_id, "page_name": page.page_name, "products":products})


@app.route('/api/v1/liked', methods=['POST'])
def create_liked():
	data = json.loads(request.data)
	return jsonify({"result":"Liked Pages is in Progress"})


@app.route('/api/v1/products/<keyword>', methods=['GET'])
@cross_origin(origin=app.config['BASE_URL'],headers=['Content- Type','Authorization'])
def getProducts(keyword):
	return getProductsForKeywordFromEbay(keyword)


@app.route('/api/v1/product/detail/<product_id>', methods=['GET'])
@cross_origin(origin=app.config['BASE_URL'],headers=['Content- Type','Authorization'])
def getProductDetail(product_id):
	return getProductDetailForProductId(product_id)



@app.route('/api/v1/user', methods=['POST'])
@cross_origin(origin=app.config['BASE_URL'],headers=['Content- Type','Authorization'])
def upsert_user():
	data = json.loads(request.data)
	user = User.query.filter_by(user_id=data['user_id']).first()
	if not user:
		user = User()
		user.user_id = data['user_id']
	user.access_token = data['access_token']
	user.name = data['name']
	user.first_name = data['first_name']
	user.last_name = data['last_name']
	is_loggedin_user = data["is_loggedin_user"]

	db.session.add(user)

	if 'friends' in data:
		friends = data['friends']
		for friend in friends:
			stored_friend = User.query.filter_by(user_id=friend["id"]).first()
			if not stored_friend:
				stored_friend = User()
				stored_friend.user_id = friend["id"]
			stored_friend.name = friend['name']
			stored_friend.first_name = friend['first_name']
			stored_friend.last_name = friend['last_name']
			db.session.add(stored_friend)

	db.session.commit()
	if is_loggedin_user == True:
		login_user(user, True)

	return user.to_json()


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
	else:
		user.first_name = first_name
		user.last_name = last_name
		user.name = name
		user.access_token = access_token
	db.session.commit()
	login_user(user, True)
	saveUserInfo(uid, access_token)
	# saveUserLikes(uid, access_token)
	# saveUserFriends(uid, access_token)
	return redirect(url_for('show_timeline', user_id=uid))




def saveUser(result):
	user = User.query.filter_by(user_id=result['id'])
	user.first_name = result["first_name"]
	user.last_name = result["last_name"]
	db.session.commit()


def saveFriends(friends_result):
	friends = friends_result["data"]
	for friend in friends:
		stored_friend = User.query.filter_by(user_id=friend["id"]).first()
		if not stored_friend:
			stored_friend = User(friend["id"],None,None,friend['name'],None,None,None,None,None)
			db.session.add(stored_friend)
	db.session.commit()

	if "paging" in friends_result:
		if "next" in friends_result["paging"]:
			saveObject(friends_result["paging"]["next"], 2)



def savePages(pages_result):
	pages = pages_result["data"]
	for aPage in pages:
		page = Page.query.filter_by(page_id=aPage["id"]).first()

		if not page:
			page = Page()
			page.page_id = aPage["id"]
			page.created_on = datetime.datetime.now()
			page.created_by = current_user.user_id

		page.page_name = aPage["name"]
		page.category_name = aPage["category"]

		page_likers = page.users
		if not page_likers:
			page.users = [current_user]
		else:
			exists = False

			for user in page.users:
				if user.user_id == current_user.user_id:
					exists = True
					break

			if exists == False:
				page_likers.append(current_user)
				page.users = page_likers


		db.session.add(page)
		db.session.commit()

	if "paging" in pages_result:
		if "next" in pages_result["paging"]:
			saveObject(pages_result["paging"]["next"], 1)


@celery.task
def getJSONData(url, headers):
	if headers == None:
		r = requests.get(url)
	else:
		r = requests.get(url,headers=headers)
	return r.json()



def saveUserInfo(user_id, access_token):
	url = "https://graph.facebook.com/"+ user_id + "?access_token=" + access_token + "&fields=id,email,name,first_name,last_name";	
	saveObject(url, 0)


def saveUserLikes(user_id, access_token):
	url = "https://graph.facebook.com/"+ user_id + "/likes?access_token=" + access_token + "&fields=id,name,category,created_time"
	saveObject(url, 1)


def saveUserFriends(user_id, access_token):
	url = "https://graph.facebook.com/"+ user_id + "/friends?access_token=" + access_token
	saveObject(url, 2)


def saveObject(url ,option):
	task = getJSONData.delay(url, None)
	if option == 0:
		saveUser(task.get())
	elif option == 1:
		savePages(task.get())
	elif option == 2:
		saveFriends(task.get()) 



def getProductsForKeywordFromEbay(keyword):
	ebay_url = "https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=SapnaSol-b016-439b-ba9f-0a88df89de2e&RESPONSE-DATA-FORMAT=JSON&GLOBAL-ID=EBAY-US&keywords=" + keyword + "&itemFilter(0).name=ListingType&itemFilter(0).value=FixedPrice&paginationInput.entriesPerPage=8&sortOrder=StartTimeNewest&outputSelector(0)=GalleryInfo&outputSelector(1)=PictureURLLarge"
	task = getJSONData.delay(ebay_url, None)
	return jsonify(task.get())


def getProductsForKeywordFromFlipkart(keyword):
	flipkart_url = "https://affiliate-api.flipkart.net/affiliate/search/json?query=" + keyword + "&resultCount=4"
	headers = {"Fk-Affiliate-Id":"paragdula","Fk-Affiliate-Token":"3f8a5b4876084bc5836265cdd26f0966"}
	task = getJSONData.delay(flipkart_url, headers)
	return jsonify(task.get())

def getProductDetailForProductId(product_id):
	ebay_detail_url = "http://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=SapnaSol-b016-439b-ba9f-0a88df89de2e&siteid=0&version=967&ItemID=" + product_id + "&IncludeSelector=TextDescription,ItemSpecifics,Details"
	task = getJSONData.delay(ebay_detail_url, None)
	return jsonify(task.get())





