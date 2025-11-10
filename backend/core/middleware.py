"""
Custom middleware for security and rate limiting.
"""
from typing import Optional, Tuple
from django.conf import settings
from django.core.cache import cache
from django.http import HttpRequest, HttpResponse
from rest_framework.exceptions import Throttled
import time

class RequestRateLimiter:
    """Rate limiting middleware."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Rate limits: requests per time window (in seconds)
        self.limits = {
            'POST': (30, 300),    # 30 POST requests per 5 minutes
            'GET': (300, 300),    # 300 GET requests per 5 minutes
            'PUT': (60, 300),     # 60 PUT requests per 5 minutes
            'PATCH': (60, 300),   # 60 PATCH requests per 5 minutes
            'DELETE': (30, 300),  # 30 DELETE requests per 5 minutes
        }

    def __call__(self, request: HttpRequest) -> HttpResponse:
        if not self._should_throttle(request):
            return self.get_response(request)
            
        client_ip = self._get_client_ip(request)
        method = request.method
        
        if method in self.limits:
            max_requests, window = self.limits[method]
            cache_key = f"ratelimit:{client_ip}:{method}"
            
            requests = cache.get(cache_key, [])
            now = time.time()
            
            # Remove old requests outside the window
            requests = [req for req in requests if now - req < window]
            
            if len(requests) >= max_requests:
                raise Throttled(
                    wait=self._get_wait_time(requests[0], window),
                    detail={
                        'message': f'Request limit exceeded. Try again in {self._get_wait_time(requests[0], window)} seconds.',
                        'limit': max_requests,
                        'window': window
                    }
                )
            
            requests.append(now)
            cache.set(cache_key, requests, window)
        
        return self.get_response(request)
    
    def _should_throttle(self, request: HttpRequest) -> bool:
        """Determine if request should be throttled."""
        # Skip rate limiting for admin/staff
        if getattr(request, 'user', None) and request.user.is_staff:
            return False
            
        # Skip rate limiting for certain paths
        excluded_paths = [
            '/admin/',
            '/api/docs/',
            '/api/schema/',
            '/static/',
            '/media/'
        ]
        return not any(request.path.startswith(path) for path in excluded_paths)
    
    def _get_client_ip(self, request: HttpRequest) -> str:
        """Get client IP, handling proxy headers."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '')
    
    def _get_wait_time(self, oldest_request: float, window: int) -> int:
        """Calculate wait time until next request allowed."""
        return int(oldest_request + window - time.time())


class RequestSizeMiddleware:
    """Middleware to limit request body size."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Size limits from settings
        self.limits = {
            'POST': settings.MAX_CONTENT_LENGTH,   # From settings
            'PUT': settings.MAX_CONTENT_LENGTH,    # From settings
            'PATCH': settings.MAX_CONTENT_LENGTH,  # From settings
        }

    def __call__(self, request: HttpRequest) -> HttpResponse:
        content_length = request.META.get('CONTENT_LENGTH')
        if content_length and request.method in self.limits:
            if int(content_length) > self.limits[request.method]:
                from django.http import HttpResponseRequestEntityTooLarge
                return HttpResponseRequestEntityTooLarge(
                    f'Request body too large. Limit is {self.limits[request.method] / (1024 * 1024)}MB'
                )
        return self.get_response(request)


class SecurityHeadersMiddleware:
    """Add security headers to responses."""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        response = self.get_response(request)
        
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(self), microphone=(self), camera=(self)'
        
        # Only add HSTS header for HTTPS requests
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            
        return response