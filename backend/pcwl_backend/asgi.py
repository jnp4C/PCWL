"""
ASGI config for pcwl_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pcwl_backend.settings")

django_asgi_app = get_asgi_application()

# Import routing after Django setup to avoid app registry errors.
import game.routing  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AuthMiddlewareStack(URLRouter(game.routing.websocket_urlpatterns)),
    }
)
