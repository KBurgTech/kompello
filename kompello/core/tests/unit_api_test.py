"""
Tests for Unit API endpoints.
"""

from http import HTTPMethod

from django.urls import reverse

from kompello.core.models import Unit
from kompello.core.tests.helper import BaseTestCase


class UnitApiViewsetTest(BaseTestCase):
    """
    Test the Unit API Viewset.
    """

    def setUp(self):
        """Set up test data."""
        self.admin_users = self.create_admin_user(1)
        self.users = self.create_user(3)
        self.companies = self.create_company(2)
        
        # Add users to companies
        self.companies[0].members.add(self.users[0], self.users[1])
        self.companies[1].members.add(self.users[2])

    def _create_unit_data(self, company):
        """Helper to create unit data payload."""
        return {
            "company": str(company.uuid),
            "short_name": "h",
            "long_name": "hours",
        }

    def _create_unit(self, company, **kwargs):
        """Helper to create a unit instance."""
        return Unit.objects.create(
            company=company,
            short_name=kwargs.get("short_name", "h"),
            long_name=kwargs.get("long_name", "hours"),
        )

    def test_list_units(self):
        """Test listing units - users see only units from their companies."""
        # Create units for both companies
        unit1 = self._create_unit(self.companies[0])
        unit2 = self._create_unit(self.companies[0], short_name="kg", long_name="kilograms")
        unit3 = self._create_unit(self.companies[1], short_name="pcs", long_name="pieces")
        
        # User 0 is member of company 0, should see unit1 and unit2
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:units-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        uuids = [item["uuid"] for item in response.data]
        self.assertIn(str(unit1.uuid), uuids)
        self.assertIn(str(unit2.uuid), uuids)
        self.assertNotIn(str(unit3.uuid), uuids)
        
        # User 2 is member of company 1, should see only unit3
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[2],
            {"path": reverse("core:units-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(unit3.uuid))

    def test_list_units_filter_by_company(self):
        """Test filtering units by company UUID."""
        unit1 = self._create_unit(self.companies[0])
        unit2 = self._create_unit(self.companies[1])
        
        # Filter by company 0
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": f"{reverse('core:units-list')}?company={self.companies[0].uuid}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(unit1.uuid))

    def test_list_units_admin_sees_all(self):
        """Test that admin users see all units."""
        unit1 = self._create_unit(self.companies[0])
        unit2 = self._create_unit(self.companies[1])
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:units-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_unit(self):
        """Test retrieving a specific unit."""
        unit = self._create_unit(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:units-detail", kwargs={"uuid": unit.uuid})},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["uuid"], str(unit.uuid))
        self.assertEqual(response.data["short_name"], "h")
        self.assertEqual(response.data["long_name"], "hours")

    def test_retrieve_unit_wrong_company(self):
        """Test that users cannot retrieve units from companies they're not members of."""
        unit = self._create_unit(self.companies[1])
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:units-detail", kwargs={"uuid": unit.uuid})},
        )
        self.assertEqual(response.status_code, 403)

    def test_create_unit(self):
        """Test creating a new unit."""
        data = self._create_unit_data(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:units-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["short_name"], "h")
        self.assertEqual(response.data["long_name"], "hours")
        
        # Verify unit was created in database
        unit = Unit.objects.get(uuid=response.data["uuid"])
        self.assertEqual(unit.short_name, "h")
        self.assertEqual(unit.company.uuid, self.companies[0].uuid)

    def test_create_unit_wrong_company(self):
        """Test that users cannot create units for companies they're not members of."""
        data = self._create_unit_data(self.companies[1])  # Company 1
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:units-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 403)

    def test_create_unit_duplicate_short_name(self):
        """Test that duplicate short names within the same company are prevented."""
        self._create_unit(self.companies[0], short_name="h", long_name="hours")
        
        data = self._create_unit_data(self.companies[0])
        data["long_name"] = "different name"
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:units-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)

    def test_update_unit(self):
        """Test updating a unit (full update)."""
        unit = self._create_unit(self.companies[0])
        
        data = self._create_unit_data(self.companies[0])
        data["short_name"] = "hrs"
        data["long_name"] = "Hours (updated)"
        
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:units-detail", kwargs={"uuid": unit.uuid}),
                "data": data,
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["short_name"], "hrs")
        self.assertEqual(response.data["long_name"], "Hours (updated)")
        
        # Verify in database
        unit.refresh_from_db()
        self.assertEqual(unit.short_name, "hrs")

    def test_partial_update_unit(self):
        """Test partially updating a unit."""
        unit = self._create_unit(self.companies[0])
        original_long_name = unit.long_name
        
        data = {"short_name": "hr"}
        
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:units-detail", kwargs={"uuid": unit.uuid}),
                "data": data,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["short_name"], "hr")
        self.assertEqual(response.data["long_name"], original_long_name)

    def test_update_unit_company_readonly(self):
        """Test that company field is read-only on updates."""
        unit = self._create_unit(self.companies[0])
        
        data = self._create_unit_data(self.companies[1])  # Try to change company
        
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:units-detail", kwargs={"uuid": unit.uuid}),
                "data": data,
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify company didn't change
        unit.refresh_from_db()
        self.assertEqual(unit.company.uuid, self.companies[0].uuid)

    def test_update_unit_wrong_company(self):
        """Test that users cannot update units from companies they're not members of."""
        unit = self._create_unit(self.companies[1])
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:units-detail", kwargs={"uuid": unit.uuid}),
                "data": {"short_name": "hacked"},
            },
        )
        self.assertEqual(response.status_code, 403)

    def test_destroy_unit_disabled(self):
        """Test that deleting units is disabled."""
        unit = self._create_unit(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.DELETE,
            self.users[0],
            {"path": reverse("core:units-detail", kwargs={"uuid": unit.uuid})},
        )
        self.assertEqual(response.status_code, 403)
        
        # Verify unit still exists
        self.assertTrue(Unit.objects.filter(uuid=unit.uuid).exists())

    def test_admin_can_access_all_units(self):
        """Test that admin users can access units from any company."""
        unit = self._create_unit(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:units-detail", kwargs={"uuid": unit.uuid})},
        )
        self.assertEqual(response.status_code, 200)
        
        # Admin can also update
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:units-detail", kwargs={"uuid": unit.uuid}),
                "data": {"short_name": "updated"},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["short_name"], "updated")
