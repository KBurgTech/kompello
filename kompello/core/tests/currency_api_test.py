"""
Tests for Currency API endpoints.
"""

from http import HTTPMethod

from django.urls import reverse

from kompello.core.models import Currency
from kompello.core.tests.helper import BaseTestCase


class CurrencyApiViewsetTest(BaseTestCase):
    """
    Test the Currency API Viewset.
    """

    def setUp(self):
        """Set up test data."""
        self.admin_users = self.create_admin_user(1)
        self.users = self.create_user(3)
        self.companies = self.create_company(2)
        
        # Add users to companies
        self.companies[0].members.add(self.users[0], self.users[1])
        self.companies[1].members.add(self.users[2])

    def _create_currency_data(self, company):
        """Helper to create currency data payload."""
        return {
            "company": str(company.uuid),
            "symbol": "€",
            "short_name": "EUR",
            "long_name": "Euro",
        }

    def _create_currency(self, company, **kwargs):
        """Helper to create a currency instance."""
        return Currency.objects.create(
            company=company,
            symbol=kwargs.get("symbol", "€"),
            short_name=kwargs.get("short_name", "EUR"),
            long_name=kwargs.get("long_name", "Euro"),
        )

    def test_list_currencies(self):
        """Test listing currencies - users see only currencies from their companies."""
        # Create currencies for both companies
        currency1 = self._create_currency(self.companies[0])
        currency2 = self._create_currency(self.companies[0], symbol="$", short_name="USD", long_name="US Dollar")
        currency3 = self._create_currency(self.companies[1], symbol="£", short_name="GBP", long_name="British Pound")
        
        # User 0 is member of company 0, should see currency1 and currency2
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:currencies-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        uuids = [item["uuid"] for item in response.data]
        self.assertIn(str(currency1.uuid), uuids)
        self.assertIn(str(currency2.uuid), uuids)
        self.assertNotIn(str(currency3.uuid), uuids)
        
        # User 2 is member of company 1, should see only currency3
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[2],
            {"path": reverse("core:currencies-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(currency3.uuid))

    def test_list_currencies_filter_by_company(self):
        """Test filtering currencies by company UUID."""
        currency1 = self._create_currency(self.companies[0])
        currency2 = self._create_currency(self.companies[1])
        
        # Filter by company 0
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": f"{reverse('core:currencies-list')}?company={self.companies[0].uuid}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(currency1.uuid))

    def test_list_currencies_admin_sees_all(self):
        """Test that admin users see all currencies."""
        currency1 = self._create_currency(self.companies[0])
        currency2 = self._create_currency(self.companies[1])
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:currencies-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_currency(self):
        """Test retrieving a specific currency."""
        currency = self._create_currency(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:currencies-detail", kwargs={"uuid": currency.uuid})},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["uuid"], str(currency.uuid))
        self.assertEqual(response.data["symbol"], "€")
        self.assertEqual(response.data["short_name"], "EUR")
        self.assertEqual(response.data["long_name"], "Euro")

    def test_retrieve_currency_wrong_company(self):
        """Test that users cannot retrieve currencies from companies they're not members of."""
        currency = self._create_currency(self.companies[1])
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:currencies-detail", kwargs={"uuid": currency.uuid})},
        )
        self.assertEqual(response.status_code, 403)

    def test_create_currency(self):
        """Test creating a new currency."""
        data = self._create_currency_data(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:currencies-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["symbol"], "€")
        self.assertEqual(response.data["short_name"], "EUR")
        self.assertEqual(response.data["long_name"], "Euro")
        
        # Verify currency was created in database
        currency = Currency.objects.get(uuid=response.data["uuid"])
        self.assertEqual(currency.symbol, "€")
        self.assertEqual(currency.company.uuid, self.companies[0].uuid)

    def test_create_currency_wrong_company(self):
        """Test that users cannot create currencies for companies they're not members of."""
        data = self._create_currency_data(self.companies[1])  # Company 1
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:currencies-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 403)

    def test_create_currency_duplicate_short_name(self):
        """Test that duplicate short names within the same company are prevented."""
        self._create_currency(self.companies[0], symbol="€", short_name="EUR", long_name="Euro")
        
        data = self._create_currency_data(self.companies[0])
        data["long_name"] = "different name"
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:currencies-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)

    def test_update_currency(self):
        """Test updating a currency (full update)."""
        currency = self._create_currency(self.companies[0])
        
        data = self._create_currency_data(self.companies[0])
        data["symbol"] = "€€"
        data["long_name"] = "Euro (updated)"
        
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:currencies-detail", kwargs={"uuid": currency.uuid}),
                "data": data,
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["symbol"], "€€")
        self.assertEqual(response.data["long_name"], "Euro (updated)")

    def test_partial_update_currency(self):
        """Test partially updating a currency."""
        currency = self._create_currency(self.companies[0])
        original_long_name = currency.long_name
        
        data = {"symbol": "€€€"}
        
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:currencies-detail", kwargs={"uuid": currency.uuid}),
                "data": data,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["symbol"], "€€€")
        self.assertEqual(response.data["long_name"], original_long_name)

    def test_update_currency_company_readonly(self):
        """Test that company field is read-only on updates."""
        currency = self._create_currency(self.companies[0])
        
        data = self._create_currency_data(self.companies[1])  # Try to change company
        
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:currencies-detail", kwargs={"uuid": currency.uuid}),
                "data": data,
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify company didn't change
        currency.refresh_from_db()
        self.assertEqual(currency.company.uuid, self.companies[0].uuid)

    def test_destroy_currency_disabled(self):
        """Test that deleting currencies is disabled."""
        currency = self._create_currency(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.DELETE,
            self.users[0],
            {"path": reverse("core:currencies-detail", kwargs={"uuid": currency.uuid})},
        )
        self.assertEqual(response.status_code, 403)
        
        # Verify currency still exists
        self.assertTrue(Currency.objects.filter(uuid=currency.uuid).exists())

    def test_admin_can_access_all_currencies(self):
        """Test that admin users can access currencies from any company."""
        currency = self._create_currency(self.companies[0])
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:currencies-detail", kwargs={"uuid": currency.uuid})},
        )
        self.assertEqual(response.status_code, 200)
