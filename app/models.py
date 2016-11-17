from app import db
from flask import jsonify
from sqlalchemy.dialects.postgresql import JSON
from flask_login import UserMixin


liked_page = db.Table('liked_page',db.Model.metadata,
    db.Column('user_id', db.String, db.ForeignKey('fbuser.user_id')),
    db.Column('page_id', db.String, db.ForeignKey('page.page_id'))
)

page_product = db.Table('page_product',db.Model.metadata,
	db.Column('page_id', db.String, db.ForeignKey('page.page_id')),
	db.Column('product_id', db.String, db.ForeignKey('product.product_id'))
)


class User(UserMixin, db.Model):
    __tablename__ = 'fbuser'

    user_id = db.Column(db.String(), primary_key=True)
    first_name = db.Column(db.String())
    last_name = db.Column(db.String())
    name = db.Column(db.String())
    device_type = db.Column(db.String())
    token = db.Column(db.String())
    email = db.Column(db.String())
    access_token = db.Column(db.String())
    cover_id = db.Column(db.String())
    created_on = db.Column(db.DateTime())
    pages = db.relationship('Page',secondary=liked_page)
    from_recommendations = db.relationship('Recommendation', backref='fbuser_from_recommendations',lazy='dynamic',foreign_keys='Recommendation.from_user_id')
    to_recommendations = db.relationship('Recommendation', backref='fbuser_to_recommendations',lazy='dynamic',foreign_keys='Recommendation.to_user_id')

    def __init__(self, _id, fName, lName, name, email, access_token, created_on,device_type, device_token):
		self.user_id = _id
		self.first_name = fName
		self.last_name = lName
		self.name = name
		self.email = email
		self.access_token = access_token
		self.created_on = created_on
		self.device_type = device_type
		self.device_token = device_token

    
    def to_json(self):
    	return jsonify({"user_id":self.user_id,"first_name":self.first_name,"last_name":self.last_name,"name":self.name,"email":self.email,"access_token":self.access_token,"created_on":self.created_on})
        	
    def get_id(self):
    	return self.user_id
    	    

class Product(db.Model):
	__tablename__ = 'product'
	
	product_id = db.Column(db.String(), primary_key=True)
	product_name = db.Column(db.String())
	product_url = db.Column(db.String())
	image_url = db.Column(db.String())
	category = db.Column(db.String())
	description = db.Column(db.String())
	price = db.Column(db.String())
	recommendations = db.relationship('Recommendation', backref='product',lazy='dynamic')
	pages = db.relationship('Page',secondary=page_product)

	def __init__(self, _id):
		self.product_id = _id

	def to_json(self):
		return jsonify({})
	

class Page(db.Model):
	__tablename__ = 'page'
	
	page_id = db.Column(db.String(), primary_key=True)
	page_name = db.Column(db.String())
	created_by = db.Column(db.String(), db.ForeignKey('fbuser.user_id'))
	created_on = db.Column(db.DateTime())
	category_name = db.Column(db.String())
	users = db.relationship('User',secondary=liked_page)
	products = db.relationship('Product',secondary=page_product)
	recommendations = db.relationship('Recommendation', backref='page',lazy='dynamic')

	def to_dict(self):
		return {"page_id":self.page_id,"page_name":self.page_name,"created_by":self.created_by,"category_name":self.category_name}


	def to_json(self):
		return jsonify({"page_id":self.page_id,"page_name":self.page_name,"created_by":self.created_by,"category_name":self.category_name})
	
	
class Recommendation(db.Model):
	__tablename__ = 'recommendation'
	
	recommendation_id = db.Column(db.String(), primary_key=True)
	from_user_id = db.Column(db.String(), db.ForeignKey('fbuser.user_id'))
	to_user_id = db.Column(db.String(), db.ForeignKey('fbuser.user_id'))
	product_id = db.Column(db.String(), db.ForeignKey('product.product_id'))
	page_id = db.Column(db.String(), db.ForeignKey('page.page_id'))
	created_on = db.Column(db.DateTime())

	def __init__(self, _id):
		self.recommendation_id = _id

	def to_json(self):
		return jsonify({"recommendation_id":self.recommendation_id})	


class Store(db.Model):
	__tablename__ = 'store'
	
	store_id = db.Column(db.String(), primary_key=True)
	store_name = db.Column(db.String())
	

