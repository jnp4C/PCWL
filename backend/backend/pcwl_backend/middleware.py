"""Project specific middleware."""

from django.conf import settings


class ContentSecurityPolicyMiddleware:
    """Attach the configured CSP header to each response.

    Browsers only enforce directives such as frame-ancestors when the policy
    arrives via HTTP headers, so we keep the configuration in settings and
    inject it centrally here.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        # Allow operators to override/disable the policy at runtime via settings.
        self.policy = getattr(settings, "CONTENT_SECURITY_POLICY", "").strip()

    def __call__(self, request):
        response = self.get_response(request)
        if self.policy and "Content-Security-Policy" not in response:
            response["Content-Security-Policy"] = self.policy
        return response
