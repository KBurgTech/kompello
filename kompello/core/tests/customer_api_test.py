"""
Tests for Customer API endpoints.
"""

from http import HTTPMethod

from django.urls import reverse

from kompello.core.models import Customer, Address, Company
from kompello.core.serializers.customer_serializers import (
    CustomerSerializer,
    CustomerListSerializer,
)
from kompello.core.tests.helper import BaseTestCase


class CustomerApiViewsetTest(BaseTestCase):
    """
    Test the Customer API Viewset.
    """

    def setUp(self):
        """Set up test data."""
        self.admin_users = self.create_admin_user(1)
        self.users = self.create_user(3)
        self.companies = self.create_company(2)
        
        # Add users to companies
        self.companies[0].members.add(self.users[0], self.users[1])
        self.companies[1].members.add(self.users[2])

    def _create_customer_data(self, company, with_address=True):
        """Helper to create customer data payload."""
        data = {
            "company": str(company.uuid),
            "title": "Mr.",
            "firstname": "John",
            "lastname": "Doe",
            "birthdate": "1980-01-15",
            "email": "john.doe@example.com",
            "mobile_phone": "+1234567890",
            "landline_phone": "+0987654321",
            "notes": "Test customer",
            "is_active": True,
        }
        
        if with_address:
            data["address"] = {
                "street": "123 Main St",
                "street_2": "Apt 4B",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001",
                "country": "USA",
            }
        
        return data

    def _create_customer(self, company, **kwargs):
        """Helper to create a customer instance."""
        address_data = kwargs.pop("address", None)
        address = None
        
        if address_data:
            address = Address.objects.create(**address_data)
        
        customer = Customer.objects.create(
            company=company,
            title=kwargs.get("title", "Mr."),
            firstname=kwargs.get("firstname", "John"),
            lastname=kwargs.get("lastname", "Doe"),
            birthdate=kwargs.get("birthdate", "1980-01-15"),
            email=kwargs.get("email", "test@example.com"),
            mobile_phone=kwargs.get("mobile_phone", "+1234567890"),
            address=address,
            **{k: v for k, v in kwargs.items() if k not in [
                "title", "firstname", "lastname", "birthdate", "email", "mobile_phone"
            ]},
        )
        return customer

    def test_list_customers(self):
        """Test listing customers - users see only customers from their companies."""
        # Create customers for both companies
        customer1 = self._create_customer(self.companies[0])
        customer2 = self._create_customer(self.companies[0], firstname="Jane", email="jane@example.com")
        customer3 = self._create_customer(self.companies[1], firstname="Bob", email="bob@example.com")
        
        # User 0 is member of company 0, should see customer1 and customer2
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:customers-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        uuids = [item["uuid"] for item in response.data]
        self.assertIn(str(customer1.uuid), uuids)
        self.assertIn(str(customer2.uuid), uuids)
        self.assertNotIn(str(customer3.uuid), uuids)
        
        # User 2 is member of company 1, should see only customer3
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[2],
            {"path": reverse("core:customers-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(customer3.uuid))

    def test_list_customers_filter_by_company(self):
        """Test filtering customers by company UUID."""
        customer1 = self._create_customer(self.companies[0])
        customer2 = self._create_customer(self.companies[1])
        
        # Filter by company 0
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": f"{reverse('core:customers-list')}?company={self.companies[0].uuid}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(customer1.uuid))

    def test_list_customers_filter_by_active(self):
        """Test filtering customers by is_active status."""
        active_customer = self._create_customer(self.companies[0], is_active=True)
        inactive_customer = self._create_customer(
            self.companies[0], 
            firstname="Inactive", 
            email="inactive@example.com",
            is_active=False
        )
        
        # Filter for active customers
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": f"{reverse('core:customers-list')}?is_active=true"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(active_customer.uuid))
        
        # Filter for inactive customers
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": f"{reverse('core:customers-list')}?is_active=false"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(inactive_customer.uuid))

    def test_list_customers_admin_sees_all(self):
        """Test that admin users see all customers."""
        customer1 = self._create_customer(self.companies[0])
        customer2 = self._create_customer(self.companies[1])
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:customers-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_customer(self):
        """Test retrieving a specific customer."""
        address_data = {
            "street": "123 Main St",
            "city": "New York",
            "postal_code": "10001",
            "country": "USA",
        }
        customer = self._create_customer(self.companies[0], address=address_data)
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid})},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["uuid"], str(customer.uuid))
        self.assertEqual(response.data["firstname"], "John")
        self.assertEqual(response.data["lastname"], "Doe")
        self.assertIsNotNone(response.data["address"])
        self.assertEqual(response.data["address"]["city"], "New York")

    def test_retrieve_customer_not_member(self):
        """Test that users cannot retrieve customers from companies they're not members of."""
        customer = self._create_customer(self.companies[1])  # Company 1
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid})},
        )
        self.assertEqual(response.status_code, 403)

    def test_retrieve_customer_not_found(self):
        """Test retrieving a non-existent customer."""
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:customers-detail", kwargs={"uuid": "00000000-0000-0000-0000-000000000000"})},
        )
        self.assertEqual(response.status_code, 404)

    def test_create_customer(self):
        """Test creating a new customer."""
        data = self._create_customer_data(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:customers-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["firstname"], data["firstname"])
        self.assertEqual(response.data["lastname"], data["lastname"])
        self.assertEqual(response.data["email"], data["email"])
        self.assertIsNotNone(response.data["address"])
        self.assertEqual(response.data["address"]["city"], data["address"]["city"])
        
        # Verify customer was created in database
        customer = Customer.objects.get(uuid=response.data["uuid"])
        self.assertEqual(customer.firstname, data["firstname"])
        self.assertIsNotNone(customer.address)
        self.assertEqual(customer.company.uuid, self.companies[0].uuid)

    def test_create_customer_without_address(self):
        """Test creating a customer without an address."""
        data = self._create_customer_data(self.companies[0], with_address=False)
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:customers-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.data["address"])

    def test_create_customer_wrong_company(self):
        """Test that users cannot create customers for companies they're not members of."""
        data = self._create_customer_data(self.companies[1])  # Company 1
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:customers-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 403)

    def test_create_customer_invalid_company(self):
        """Test creating a customer with an invalid company UUID."""
        data = self._create_customer_data(self.companies[0])
        data["company"] = "00000000-0000-0000-0000-000000000000"
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:customers-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 404)

    def test_update_customer(self):
        """Test updating a customer (full update)."""
        customer = self._create_customer(self.companies[0])
        
        data = self._create_customer_data(self.companies[0])
        data["firstname"] = "Jane"
        data["lastname"] = "Smith"
        data["email"] = "jane.smith@example.com"
        
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid}),
                "data": data,
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["firstname"], "Jane")
        self.assertEqual(response.data["lastname"], "Smith")
        
        # Verify in database
        customer.refresh_from_db()
        self.assertEqual(customer.firstname, "Jane")
        self.assertEqual(customer.lastname, "Smith")

    def test_partial_update_customer(self):
        """Test partially updating a customer."""
        customer = self._create_customer(self.companies[0])
        original_lastname = customer.lastname
        
        data = {"firstname": "UpdatedName"}
        
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid}),
                "data": data,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["firstname"], "UpdatedName")
        self.assertEqual(response.data["lastname"], original_lastname)
        
        # Verify in database
        customer.refresh_from_db()
        self.assertEqual(customer.firstname, "UpdatedName")
        self.assertEqual(customer.lastname, original_lastname)

    def test_update_customer_address(self):
        """Test updating a customer's address."""
        address_data = {
            "street": "123 Main St",
            "city": "New York",
            "postal_code": "10001",
            "country": "USA",
        }
        customer = self._create_customer(self.companies[0], address=address_data)
        
        new_address = {
            "street": "456 Elm St",
            "street_2": "",
            "city": "Los Angeles",
            "state": "CA",
            "postal_code": "90001",
            "country": "USA",
        }
        
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid}),
                "data": {"address": new_address},
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["address"]["city"], "Los Angeles")
        
        # Verify in database
        customer.refresh_from_db()
        self.assertEqual(customer.address.city, "Los Angeles")

    def test_update_customer_cannot_change_company(self):
        """Test that updating a customer's company is not allowed."""
        customer = self._create_customer(self.companies[0])
        
        data = self._create_customer_data(self.companies[1])
        data["firstname"] = "Updated"
        
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid}),
                "data": data,
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("company", response.data)

    def test_update_customer_not_member(self):
        """Test that users cannot update customers from companies they're not members of."""
        customer = self._create_customer(self.companies[1])
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid}),
                "data": {"firstname": "Hacker"},
            },
        )
        self.assertEqual(response.status_code, 403)

    def test_destroy_customer_disabled(self):
        """Test that deleting customers is disabled."""
        customer = self._create_customer(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.DELETE,
            self.users[0],
            {"path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid})},
        )
        self.assertEqual(response.status_code, 403)
        
        # Verify customer still exists
        self.assertTrue(Customer.objects.filter(uuid=customer.uuid).exists())

    def test_deactivate_customer(self):
        """Test deactivating a customer using is_active flag."""
        customer = self._create_customer(self.companies[0], is_active=True)
        
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid}),
                "data": {"is_active": False},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_active"])
        
        # Verify in database
        customer.refresh_from_db()
        self.assertFalse(customer.is_active)

    def test_admin_can_access_all_customers(self):
        """Test that admin users can access customers from any company."""
        customer = self._create_customer(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid})},
        )
        self.assertEqual(response.status_code, 200)
        
        # Admin can also update
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:customers-detail", kwargs={"uuid": customer.uuid}),
                "data": {"notes": "Updated by admin"},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["notes"], "Updated by admin")
