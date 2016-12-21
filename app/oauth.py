from flask import Flask, current_app, request
from rauth import OAuth2Service
from flask_login import redirect, url_for
import datetime

class OAuthSignIn(object):
	providers = None
	
	def __init__(self, provider_name):
		self.provider_name = provider_name
		credentials = current_app.config['OAUTH_CREDENTIALS'][provider_name]
		self.consumer_id = credentials['id']
		self.consumer_secret = credentials['secret']
		
	def authorize(self):
		pass
		
	def callback(self):
		pass
		
	def get_callback_url(self):
		return url_for('oauth_callback', provider=self.provider_name, _external=True, _scheme=current_app.config['PREFERRED_URL_SCHEME'])
		
	
	@classmethod
	def get_provider(self, provider_name):
		if self.providers is None:
			self.providers = {}
			for provider_class in self.__subclasses__():
				provider = provider_class()
				self.providers[provider.provider_name] = provider
		return self.providers[provider_name]
		
		
		
class FacebookSignIn(OAuthSignIn):
	def __init__(self):
		super(FacebookSignIn, self).__init__('facebook')
		self.service = OAuth2Service(
			name='facebook',
			client_id=self.consumer_id,
			client_secret = self.consumer_secret,
			authorize_url='https://graph.facebook.com/oauth/authorize',
			access_token_url='https://graph.facebook.com/oauth/access_token',
			base_url='https://graph.facebook.com'
		)
		
	def authorize(self):
		return redirect(self.service.get_authorize_url(
			scope='email,user_likes,user_friends,public_profile',
			response_type='code',
			redirect_uri=self.get_callback_url())
		)
		
	def callback(self):
		if 'code' not in request.args:
			return None, None, None
		oauth_session = self.service.get_auth_session(
			data = {'code': request.args['code'],
					'grant_type': 'authorization_code',
					'redirect_uri': self.get_callback_url()}
		)
		me = oauth_session.get('me').json()
		return (
			me['id'],
			me.get('first_name'),
			me.get('last_name'),
			me.get('name'),
			me.get('email'),
			oauth_session.access_token,
			datetime.datetime.now(),
			None,
			None)