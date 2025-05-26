from django.urls import include, path
from rest_framework import routers

from kompello.core.views.api.company import CompanyViewSet
from kompello.core.views.api.system import SystemApiViews
from kompello.core.views.api.user import UserViewSet

app_name = "core"

router = routers.SimpleRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"companies", CompanyViewSet, basename="companies")
router.register(r"system", SystemApiViews, basename="system")

urlpatterns = [
    path("api/", include(router.urls)),
]
