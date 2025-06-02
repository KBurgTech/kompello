from http import HTTPMethod

from django.urls import reverse
from kompello.core.serializers.company_serializers import CompanySerializer
from kompello.core.tests.helper import BaseTestCase
from unittest.mock import patch


class CompanyApiViewsetTest(BaseTestCase):
    """
    Test the Company API Viewset.
    """

    def setUp(self):
        self.admin_users = self.create_admin_user(1)
        self.users = self.create_user(5)

    def test_list_companies(self):
        companies = self.create_company(3)
        companies_expected = CompanySerializer(companies, many=True).data
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:companies-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, companies_expected)

    def test_retrieve_company(self):
        # Test retrieving a company:
        company = self.create_company(1)[0]
        company_expected = CompanySerializer(company).data
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:companies-detail", kwargs={"uuid": company.uuid})},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, company_expected)

        # Test retrieving a company with a wrong UUID:
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:companies-detail", kwargs={"uuid": "wrong-uuid"})},
        )
        self.assertEqual(response.status_code, 404)

    def test_create_company(self):
        # Test creating a company:
        data = {"name": "Test Company", "description": "This is a test company."}
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.admin_users[0],
            {"path": reverse("core:companies-list"), "data": data},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], data["name"])
        self.assertEqual(response.data["description"], data["description"])
        self.assertIn("uuid", response.data)

    def test_update_company(self):
        # Test updating a company:
        company = self.create_company(1)[0]
        data = {
            "name": "Updated Company",
            "description": "This is an updated test company.",
        }
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.admin_users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": data,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], data["name"])
        self.assertEqual(response.data["description"], data["description"])

    def test_partial_update_company(self):
        # Test partially updating a company:
        company = self.create_company(1)[0]
        data = {"description": "This is a partially updated test company."}
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": data,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["description"], data["description"])

    def test_destroy_company(self):
        # Patch the permission_classes to allow any access during this test
        with patch(
            "kompello.core.views.api.company.CompanyViewSet.destroy.permission_classes",
            new=[],
        ):
            # Test destroying a company:
            company = self.create_company(1)[0]
            response = self.authenticated_request(
                HTTPMethod.DELETE,
                self.admin_users[0],
                {
                    "path": reverse(
                        "core:companies-detail", kwargs={"uuid": company.uuid}
                    )
                },
            )
            self.assertEqual(response.status_code, 204)

            # Test trying to retrieve the deleted company:
            response = self.authenticated_request(
                HTTPMethod.GET,
                self.admin_users[0],
                {
                    "path": reverse(
                        "core:companies-detail", kwargs={"uuid": company.uuid}
                    )
                },
            )
            self.assertEqual(response.status_code, 404)
    
    def test_members_add(self):
        # Test adding members to a company
        company = self.create_company(1)[0]
        user = self.users[0]
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:companies-members-add", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn(user, company.members.all())
        self.assertEqual(1, company.members.all().count())

        # Test adding multiple ids of the same user results in no duplicates
        company = self.create_company(1)[0]
        user = self.users[0]
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:companies-members-add", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid), str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn(user, company.members.all())
        self.assertEqual(1, company.members.all().count())

    def test_members_delete(self):
        # Test deleting members from a company
        company = self.create_company(1)[0]
        user = self.users[0]
        company.members.add(user)
        self.assertIn(user, company.members.all())
        self.assertEqual(1, company.members.all().count())

        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:companies-members-delete", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 204)
        self.assertNotIn(user, company.members.all())
        self.assertEqual(0, company.members.all().count())

        # Test removing multiple ids of the same user results in no errors
        company = self.create_company(1)[0]
        user = self.users[0]
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:companies-members-delete", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid), str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 204)
        self.assertNotIn(user, company.members.all())
        self.assertEqual(0, company.members.all().count())

class CompanyApiPermissions(BaseTestCase):
    def setUp(self):
        self.admin_users = self.create_admin_user(1)
        self.users = self.create_user(5)
        self.companies = self.create_company(3)


    def test_list_companies_permissions(self):
        # Admin user should be able to list companies
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:companies-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), len(self.companies))

        # Regular user should not be able to list companies and receive empty response as they are not a member
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:companies-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

        self.companies[0].members.add(self.users[0])  # Add user to the first company

        # Regular user should be able to list companies they are a member of
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:companies-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['uuid'], str(self.companies[0].uuid))

        # Non logged in user should not be able to list companies
        response = self.authenticated_request(
            HTTPMethod.GET,
            None,
            {"path": reverse("core:companies-list")},
        )
        self.assertEqual(response.status_code, 401)

    def test_create_company_permissions(self):
        # Admin user should be able to create a company
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.admin_users[0],
            {"path": reverse("core:companies-list"), "data": {"name": "New Company"}},
        )
        self.assertEqual(response.status_code, 201)

        # Regular user should not be able to create a company
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:companies-list"), "data": {"name": "New Company"}},
        )
        self.assertEqual(response.status_code, 403)

        # Non logged in user should not be able to create a company
        response = self.authenticated_request(
            HTTPMethod.POST,
            None,
            {"path": reverse("core:companies-list"), "data": {"name": "New Company"}},
        )
        self.assertEqual(response.status_code, 401)

    def test_update_company_permissions(self):
        # Admin user should be able to update a company
        company = self.companies[0]
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.admin_users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": {"name": "Updated Company"},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Updated Company")

        # Regular user should not be able to update a company
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": {"name": "Updated Company"},
            },
        )
        self.assertEqual(response.status_code, 403)

        # Regular user should be able to update if they are a member of the company
        company.members.add(self.users[0])  # Add user to the first company
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": {"name": "Updated Company"},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Updated Company")

        # Non logged in user should not be able to update a company
        response = self.authenticated_request(
            HTTPMethod.PUT,
            None,
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": {"name": "Updated Company"},
            },
        )
        self.assertEqual(response.status_code, 401)
    
    def test_partial_update_company_permissions(self):
        # Admin user should be able to partially update a company
        company = self.companies[0]
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": {"description": "Partially updated description"},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["description"], "Partially updated description")

        # Regular user should not be able to partially update a company
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": {"description": "Partially updated description"},
            },
        )
        self.assertEqual(response.status_code, 403)

        # Regular user should be able to update if they are a member of the company
        company.members.add(self.users[0])  # Add user to the first company
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": {"name": "Updated Company"},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Updated Company")

        # Non logged in user should not be able to partially update a company
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            None,
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid}),
                "data": {"description": "Partially updated description"},
            },
        )
        self.assertEqual(response.status_code, 401)

    def test_destroy_company_permissions(self):
        # No one should be able to delete a company as admin
        company = self.companies[0]
        response = self.authenticated_request(
            HTTPMethod.DELETE,
            self.admin_users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid})
            },
        )
        self.assertEqual(response.status_code, 403)

        # No one should be able to delete a company as user
        response = self.authenticated_request(
            HTTPMethod.DELETE,
            self.users[0],
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid})
            },
        )
        self.assertEqual(response.status_code, 403)
    
        # No one should be able to delete a company as unauthenticated user	
        response = self.authenticated_request(
            HTTPMethod.DELETE,
            None,
            {
                "path": reverse("core:companies-detail", kwargs={"uuid": company.uuid})
            },
        )
        self.assertEqual(response.status_code, 401)

    def test_members_add_permissions(self):
        # Admin user should be able to add members to a company
        company = self.companies[0]
        user = self.users[0]
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:companies-members-add", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn(user, company.members.all())

        # Regular non member user should not be able to add members to a company
        company = self.companies[1]
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:companies-members-add", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 403)

        # Member of the company should be able to add members to a company
        company = self.companies[2]
        company.members.add(self.users[0])
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:companies-members-add", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(self.users[1].uuid)]},
            },
        )
        self.assertEqual(response.status_code, 201)

        # Non logged in user should not be able to add members to a company
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            None,
            {
                "path": reverse("core:companies-members-add", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 401)
    
    def test_members_delete_permissions(self):
        # Admin user should be able to delete members from a company
        company = self.companies[0]
        user = self.users[0]
        company.members.add(user)
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:companies-members-delete", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 204)
        self.assertNotIn(user, company.members.all())

        # Regular non member user should not be able to delete members from a company
        company = self.companies[1]
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:companies-members-delete", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 403)

        # Member of the company should be able to delete members from a company
        company = self.companies[2]
        company.members.add(self.users[0])
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:companies-members-delete", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(self.users[1].uuid)]},
            },
        )
        self.assertEqual(response.status_code, 204)

        # Non logged in user should not be able to delete members from a company
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            None,
            {
                "path": reverse("core:companies-members-delete", kwargs={"uuid": company.uuid}),
                "data": {"uuids": [str(user.uuid)]},
            },
        )
        self.assertEqual(response.status_code, 401)