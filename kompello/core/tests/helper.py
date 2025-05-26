from django.urls import reverse
from rest_framework.test import APITestCase
from kompello.core.models import Company
from kompello.core.models.auth_models import KompelloUser


USER_PASSWORD = "123456789!ABC"


class BaseTestCase(APITestCase):

    def __init__(self, methodName: str = "runTest") -> None:
        super().__init__(methodName)

    @staticmethod
    def _create_company(count):
        companies = []
        for i in range(1, count + 1):
            companies.append(Company.objects.create(name=f"Company {i}"))

        return companies

    @staticmethod
    def _create_admin_user(count):
        admin_users = []
        for i in range(1, count + 1):
            admin_users.append(
                KompelloUser.objects.create_superuser(f"admin{i}@email.com", f"admin{i}@email.com", USER_PASSWORD))
        return admin_users

    @staticmethod
    def _create_user(count):
        users = []
        for i in range(1, count + 1):
            users.append(
                KompelloUser.objects.create_user(f"user{i}@email.com", f"user{i}@email.com", USER_PASSWORD, first_name=f"Test{i}",
                                              last_name=f"User{i}"))
        return users

    def _login(self, email, password) -> bool:
        response = self.client.post(reverse("allauth:browser:account:login"), {"username": email, "password": password}, format='json')
        return response.status_code == 200

    def _logout(self):
        self.client = self.client_class()

    def _request(self, user, request, mode):
        func = getattr(self.client, mode)
        self.assertIsNotNone(func)
        if user is not None:
            self.assertTrue(self._login(email=user.email, password=USER_PASSWORD))
        auth_resp = func(**request)
        self._logout()
        return auth_resp

    def _test_auth_not_auth(self, user, request, mode):
        func = getattr(self.client, mode)
        self.assertIsNotNone(func)

        non_auth_resp = func(**request)
        self.assertTrue(self._login(email=user.email, password=USER_PASSWORD))
        auth_resp = func(**request)
        self._logout()

        return non_auth_resp, auth_resp
