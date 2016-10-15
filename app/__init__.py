from flask import Flask,request,jsonify,render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, desc
from flask_restful import reqparse
from flask_login import LoginManager, UserMixin, login_user, logout_user,current_user, redirect, url_for
from oauth import OAuthSignIn

import os
import json
import datetime
import facebook
import requests
import ipdb
import uuid


app = Flask(__name__)
db = SQLAlchemy(app)

from models import User, Page, Product, Recommendation

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'
app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHECMY_TRACK_MODIFICATIONS'] = True
app.config['OAUTH_CREDENTIALS'] = {'facebook': {'id': '1485658648363694','secret': 'ebf9436f2c97491f3f70a59a88d8f595'}}
curr_user = None


@login_manager.user_loader
def load_user(user_id):
	return User.query.get(user_id)


@app.route('/')
def hello():
	return render_template('login.html')
	if not current_user.is_authenticated:
		return render_template('login.html')
	else:
		return redirect(url_for('show_timeline'))

	
@app.route('/timeline')
def show_timeline():
	return render_template('timeline.html',obj_id=curr_user.user_id)

							
@app.route('/likes')
def show_likes():
	user_id = curr_user.user_id
	url = "https://graph.facebook.com/"+ user_id + "/likes?access_token=" + curr_user.access_token	
	return render_template('likes.html',likes_url=url)

							
							
@app.route('/friends')
def show_friends():
	user_id = curr_user.user_id
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

				
@app.route('/profile')
def show_profile():
	user = User.query.filter_by(user_id=curr_user.user_id).first()
	url = "https://graph.facebook.com/"+ user.user_id + "/friends?access_token=" + user.access_token 
	return render_template('profile.html',
							obj_id=curr_user.user_id,
							username=user.name,
							friends_url=url)


@app.route('/<user_id>/profile')
def show_user_profile(user_id):
	user = User.query.filter_by(user_id=user_id).first()
	url = "https://graph.facebook.com/"+ user.user_id + "/friends?access_token=" + curr_user.access_token 
	return render_template('profile.html',
							obj_id=user_id,
							username=user.name,
							friends_url=url)



@app.route('/<page_id>/detail')
def show_like_profile(page_id):
	user = curr_user
	page = Page.query.filter_by(page_id=page_id).first()
	url = "https://graph.facebook.com/"+ page_id + "?access_token=" + curr_user.access_token 
	friends_url = "https://graph.facebook.com/"+ user.user_id + "/friends?access_token=" + user.access_token 
	return render_template('like_detail.html',
							obj_id=page_id,
							username=page.page_name,
							like_url=url,
							friends_url = friends_url)
							
							
@app.route('/<page_id>/explore')
def showProductsForLike(page_id):
	page = Page.query.filter_by(page_id=page_id).first()
	friends_url = "https://graph.facebook.com/"+ curr_user.user_id + "/friends?access_token=" + curr_user.access_token 
	return render_template('explore.html',
							obj_id=page_id,
							friends_url=friends_url,
							username=page.page_name)


@app.route('/api/v1/recommendations_from_user/<user_id>', methods=['GET'])
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
	recommendation.from_user_id = curr_user.user_id
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
def upsert_page():
	data = json.loads(request.data)
	page = Page.query.filter_by(page_id=data["page_id"]).first()

	if not page:
		page = Page()
		page.page_id = data["page_id"]
		page.created_on = datetime.datetime.now()
		page.created_by = curr_user.user_id

	page.page_name = data["page_name"]
	page.category_name = data["category_name"]

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
	

@app.route('/api/v1/user', methods=['POST'])
def upsert_user():
	global curr_user
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
	if is_loggedin_user == True:
		print("@" * 80)
		curr_user = user
	db.session.add(user)
	db.session.commit()
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
		db.session.commit()
	login_user(user, True)
	return redirect(url_for('show_timeline', user_id=uid))
	
	