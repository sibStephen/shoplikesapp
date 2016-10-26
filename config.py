import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
	DEBUG = False
	TESTING = False
	CSRF_ENABLED = True
	SECRET_KEY = 'this-really-needs-to-be-changed'
	SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
	
class ProductionConfig(Config):
	DEBUG = False
	
class StagingConfig(Config):
	DEVELOPMENT = True
	APP_ID = "2117381198487388"
	APP_SECRET = "f9cac49b700d7fbac2fbbe48356d589a"
	DEBUG = True
	BASE_URL = "https://shoplikes-staging.herokuapp.com"
	
class DevelopmentConfig(Config):
	DEVELOPMENT = True
	APP_ID = "1485658648363694"
	APP_SECRET = "ebf9436f2c97491f3f70a59a88d8f595"
	DEBUG = True
	BASE_URL = "http://localhost:8080"
	
class TestingConfig(Config):
	TESTING = True