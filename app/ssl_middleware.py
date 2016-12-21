from django.conf import settings
from django.http import HttpResponseRedirect

class SSLMiddleware(object):
    def process_request(self, request):
    	# only handle hreoku requests
    	protocol_header = request.META.get("HTTP_X_FORWARDED_PROTO", False)
        if protocol_header and protocol_header == 'http':
            url = request.build_absolute_uri(request.get_full_path())
            secure_url = url.replace("http://", "https://")
            return HttpResponseRedirect(secure_url)