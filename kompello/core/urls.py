from django.urls import include, path, re_path
from rest_framework import routers

from kompello.core.views.api.company import CompanyViewSet
from kompello.core.views.api.system import SystemApiViews
from kompello.core.views.api.user import UserViewSet
from kompello.core.views.frontend.vite_view import ViteView

app_name = "core"

router = routers.SimpleRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"companies", CompanyViewSet, basename="companies")
router.register(r"system", SystemApiViews, basename="system")

urlpatterns = [
    path("api/", include(router.urls)),
    re_path(r'^(?P<path>([^/]+/)*)$',  ViteView.as_view(), name='vite-view'),
]
