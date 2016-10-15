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
	DEBUG = True
	
class DevelopmentConfig(Config):
	DEVELOPMENT = True
	APP_ID = "1485658648363694"
	DEBUG = True
	
class TestingConfig(Config):
	TESTING = True