from django.urls import include, path, re_path
from rest_framework import routers

from kompello.core.views.api.company import CompanyViewSet
from kompello.core.views.api.customer import CustomerViewSet
from kompello.core.views.api.system import SystemApiViews
from kompello.core.views.api.test import create_dummy_user
from kompello.core.views.api.user import UserViewSet
from kompello.core.views.frontend.vite_view import ViteView

app_name = "core"

router = routers.SimpleRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"companies", CompanyViewSet, basename="companies")
router.register(r"customers", CustomerViewSet, basename="customers")
router.register(r"system", SystemApiViews, basename="system")

urlpatterns = [
    path("api/", include(router.urls)),
    path("_test/create_dummy_user/", create_dummy_user, name="create_dummy_user"),  # TODO remove this in production
    path("ui/", ViteView.as_view(), name='vite-view'),
    re_path(r'^ui/(?P<path>.*)$', ViteView.as_view(), name='vite-view-nested'),
]
