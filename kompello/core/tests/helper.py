from http import HTTPMethod
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.test import APITestCase
from kompello.core.models import Company
from kompello.core.models.auth_models import KompelloUser


USER_PASSWORD = "123456789!ABC"


class BaseTestCase(APITestCase):

    def __init__(self, methodName: str = "runTest") -> None:
        super().__init__(methodName)

    @staticmethod
    def create_company(count) -> list[Company]:
        companies = []
        for i in range(1, count + 1):
            companies.append(Company.objects.create(name=f"Company {i}"))

        return companies

    @staticmethod
    def create_admin_user(count) -> list[KompelloUser]:
        admin_users = []
        for i in range(1, count + 1):
            admin_users.append(
                KompelloUser.objects.create_superuser(f"admin{i}@email.com", f"admin{i}@email.com", USER_PASSWORD))
        return admin_users

    @staticmethod
    def create_user(count) -> list[KompelloUser]:
        users = []
        for i in range(1, count + 1):
            users.append(
                KompelloUser.objects.create_user(f"user{i}@email.com", f"user{i}@email.com", USER_PASSWORD, first_name=f"Test{i}",
                                              last_name=f"User{i}"))
        return users

    def login(self, email, password) -> bool:
        response = self.client.post(reverse("allauth:browser:account:login"), {"username": email, "password": password}, format='json')
        return response.status_code == 200

    def logout(self):
        self.client = self.client_class()

    def authenticated_request(self, mode: HTTPMethod, user: KompelloUser, request) -> Response:
        request_method = getattr(self.client, mode.lower())
        self.assertIsNotNone(request_method)
        if user is not None:
            self.assertTrue(self.login(email=user.email, password=USER_PASSWORD))
        response = request_method(**request)
        self.logout()
        return response

    def request_auth_not_auth(self, mode: HTTPMethod, user: KompelloUser, request) -> tuple[Response, Response]:
        response_non_auth = self.authenticated_request(mode, None, request)
        response_auth = self.authenticated_request(mode, user, request)

        return response_non_auth, response_auth

