"""
Tests for Item API endpoints.
"""

from decimal import Decimal
from http import HTTPMethod

from django.urls import reverse

from kompello.core.models import Item, Unit, Currency
from kompello.core.tests.helper import BaseTestCase


class ItemApiViewsetTest(BaseTestCase):
    """
    Test the Item API Viewset.
    """

    def setUp(self):
        """Set up test data."""
        self.admin_users = self.create_admin_user(1)
        self.users = self.create_user(3)
        self.companies = self.create_company(2)
        
        # Add users to companies
        self.companies[0].members.add(self.users[0], self.users[1])
        self.companies[1].members.add(self.users[2])
        
        # Create units and currencies for testing
        self.unit1 = Unit.objects.create(
            company=self.companies[0],
            short_name="h",
            long_name="hours"
        )
        self.unit2 = Unit.objects.create(
            company=self.companies[1],
            short_name="kg",
            long_name="kilograms"
        )
        
        self.currency1 = Currency.objects.create(
            company=self.companies[0],
            symbol="€",
            short_name="EUR",
            long_name="Euro"
        )
        self.currency2 = Currency.objects.create(
            company=self.companies[1],
            symbol="$",
            short_name="USD",
            long_name="US Dollar"
        )

    def _create_item_data(self, company, currency, unit, with_price_max=False):
        """Helper to create item data payload."""
        data = {
            "company": str(company.uuid),
            "name": "Consulting Service",
            "description": "Professional consulting services",
            "currency": str(currency.uuid),
            "unit": str(unit.uuid),
            "price_per_unit": "100.00",
        }
        
        if with_price_max:
            data["price_max"] = "150.00"
        
        return data

    def _create_item(self, company, currency, unit, **kwargs):
        """Helper to create an item instance."""
        return Item.objects.create(
            company=company,
            name=kwargs.get("name", "Consulting Service"),
            description=kwargs.get("description", "Professional consulting services"),
            currency=currency,
            unit=unit,
            price_per_unit=kwargs.get("price_per_unit", Decimal("100.00")),
            price_max=kwargs.get("price_max"),
        )

    def test_list_items(self):
        """Test listing items - users see only items from their companies."""
        # Create items for both companies
        item1 = self._create_item(self.companies[0], self.currency1, self.unit1)
        item2 = self._create_item(
            self.companies[0], 
            self.currency1, 
            self.unit1, 
            name="Development",
            price_per_unit=Decimal("120.00")
        )
        item3 = self._create_item(self.companies[1], self.currency2, self.unit2, name="Product")
        
        # User 0 is member of company 0, should see item1 and item2
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:items-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        uuids = [item["uuid"] for item in response.data]
        self.assertIn(str(item1.uuid), uuids)
        self.assertIn(str(item2.uuid), uuids)
        self.assertNotIn(str(item3.uuid), uuids)
        
        # User 2 is member of company 1, should see only item3
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[2],
            {"path": reverse("core:items-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(item3.uuid))

    def test_list_items_uses_lightweight_serializer(self):
        """Test that list view uses ItemListSerializer with simplified data."""
        item = self._create_item(self.companies[0], self.currency1, self.unit1)
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:items-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        
        # Check that lightweight fields are present
        item_data = response.data[0]
        self.assertIn("currency_symbol", item_data)
        self.assertIn("unit_short_name", item_data)
        self.assertEqual(item_data["currency_symbol"], "€")
        self.assertEqual(item_data["unit_short_name"], "h")
        
        # Full details should not be present
        self.assertNotIn("currency_details", item_data)
        self.assertNotIn("unit_details", item_data)

    def test_list_items_filter_by_company(self):
        """Test filtering items by company UUID."""
        item1 = self._create_item(self.companies[0], self.currency1, self.unit1)
        item2 = self._create_item(self.companies[1], self.currency2, self.unit2)
        
        # Filter by company 0
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": f"{reverse('core:items-list')}?company={self.companies[0].uuid}"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["uuid"], str(item1.uuid))

    def test_list_items_admin_sees_all(self):
        """Test that admin users see all items."""
        item1 = self._create_item(self.companies[0], self.currency1, self.unit1)
        item2 = self._create_item(self.companies[1], self.currency2, self.unit2)
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:items-list")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

    def test_retrieve_item(self):
        """Test retrieving a specific item."""
        item = self._create_item(
            self.companies[0], 
            self.currency1, 
            self.unit1,
            price_max=Decimal("150.00")
        )
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:items-detail", kwargs={"uuid": item.uuid})},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["uuid"], str(item.uuid))
        self.assertEqual(response.data["name"], "Consulting Service")
        self.assertEqual(Decimal(response.data["price_per_unit"]), Decimal("100.00"))
        self.assertEqual(Decimal(response.data["price_max"]), Decimal("150.00"))
        
        # Check nested details are present
        self.assertIn("currency_details", response.data)
        self.assertIn("unit_details", response.data)
        self.assertEqual(response.data["currency_details"]["symbol"], "€")
        self.assertEqual(response.data["unit_details"]["short_name"], "h")

    def test_retrieve_item_wrong_company(self):
        """Test that users cannot retrieve items from companies they're not members of."""
        item = self._create_item(self.companies[1], self.currency2, self.unit2)
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:items-detail", kwargs={"uuid": item.uuid})},
        )
        self.assertEqual(response.status_code, 403)

    def test_create_item_with_single_price(self):
        """Test creating an item with only price_per_unit (no price range)."""
        data = self._create_item_data(self.companies[0], self.currency1, self.unit1)
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "Consulting Service")
        self.assertEqual(Decimal(response.data["price_per_unit"]), Decimal("100.00"))
        self.assertIsNone(response.data["price_max"])
        
        # Verify item was created in database
        item = Item.objects.get(uuid=response.data["uuid"])
        self.assertEqual(item.price_per_unit, Decimal("100.00"))
        self.assertIsNone(item.price_max)

    def test_create_item_with_price_range(self):
        """Test creating an item with price range (price_per_unit and price_max)."""
        data = self._create_item_data(
            self.companies[0], 
            self.currency1, 
            self.unit1, 
            with_price_max=True
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Decimal(response.data["price_per_unit"]), Decimal("100.00"))
        self.assertEqual(Decimal(response.data["price_max"]), Decimal("150.00"))
        
        # Verify item was created in database
        item = Item.objects.get(uuid=response.data["uuid"])
        self.assertEqual(item.price_per_unit, Decimal("100.00"))
        self.assertEqual(item.price_max, Decimal("150.00"))

    def test_create_item_wrong_company(self):
        """Test that users cannot create items for companies they're not members of."""
        data = self._create_item_data(self.companies[1], self.currency2, self.unit2)
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 403)

    def test_create_item_currency_wrong_company(self):
        """Test that currency must belong to the same company as the item."""
        data = self._create_item_data(self.companies[0], self.currency2, self.unit1)  # currency2 belongs to company 1
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("currency", response.data)

    def test_create_item_unit_wrong_company(self):
        """Test that unit must belong to the same company as the item."""
        data = self._create_item_data(self.companies[0], self.currency1, self.unit2)  # unit2 belongs to company 1
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("unit", response.data)

    def test_create_item_negative_price(self):
        """Test that negative prices are prevented."""
        data = self._create_item_data(self.companies[0], self.currency1, self.unit1)
        data["price_per_unit"] = "-50.00"
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)

    def test_update_item(self):
        """Test updating an item (full update)."""
        item = self._create_item(self.companies[0], self.currency1, self.unit1)
        
        data = self._create_item_data(
            self.companies[0], 
            self.currency1, 
            self.unit1, 
            with_price_max=True
        )
        data["name"] = "Updated Service"
        data["price_per_unit"] = "200.00"
        data["price_max"] = "250.00"
        
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:items-detail", kwargs={"uuid": item.uuid}),
                "data": data,
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Updated Service")
        self.assertEqual(Decimal(response.data["price_per_unit"]), Decimal("200.00"))
        self.assertEqual(Decimal(response.data["price_max"]), Decimal("250.00"))

    def test_partial_update_item(self):
        """Test partially updating an item."""
        item = self._create_item(self.companies[0], self.currency1, self.unit1)
        original_name = item.name
        
        data = {"price_per_unit": "125.00"}
        
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:items-detail", kwargs={"uuid": item.uuid}),
                "data": data,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.data["price_per_unit"]), Decimal("125.00"))
        self.assertEqual(response.data["name"], original_name)

    def test_partial_update_item_add_price_max(self):
        """Test adding price_max to an item that only had price_per_unit."""
        item = self._create_item(self.companies[0], self.currency1, self.unit1)
        self.assertIsNone(item.price_max)
        
        data = {"price_max": "180.00"}
        
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:items-detail", kwargs={"uuid": item.uuid}),
                "data": data,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Decimal(response.data["price_max"]), Decimal("180.00"))
        
        # Verify in database
        item.refresh_from_db()
        self.assertEqual(item.price_max, Decimal("180.00"))

    def test_update_item_company_readonly(self):
        """Test that company field is read-only on updates."""
        item = self._create_item(self.companies[0], self.currency1, self.unit1)
        
        data = self._create_item_data(self.companies[1], self.currency1, self.unit1)
        
        response = self.authenticated_request(
            HTTPMethod.PUT,
            self.users[0],
            {
                "path": reverse("core:items-detail", kwargs={"uuid": item.uuid}),
                "data": data,
                "format": "json",
            },
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify company didn't change
        item.refresh_from_db()
        self.assertEqual(item.company.uuid, self.companies[0].uuid)

    def test_update_item_wrong_company(self):
        """Test that users cannot update items from companies they're not members of."""
        item = self._create_item(self.companies[1], self.currency2, self.unit2)
        
        # User 0 is only member of company 0
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {
                "path": reverse("core:items-detail", kwargs={"uuid": item.uuid}),
                "data": {"name": "Hacked"},
            },
        )
        self.assertEqual(response.status_code, 403)

    def test_destroy_item_disabled(self):
        """Test that deleting items is disabled."""
        item = self._create_item(self.companies[0], self.currency1, self.unit1)
        
        response = self.authenticated_request(
            HTTPMethod.DELETE,
            self.users[0],
            {"path": reverse("core:items-detail", kwargs={"uuid": item.uuid})},
        )
        self.assertEqual(response.status_code, 403)
        
        # Verify item still exists
        self.assertTrue(Item.objects.filter(uuid=item.uuid).exists())

    def test_admin_can_access_all_items(self):
        """Test that admin users can access items from any company."""
        item = self._create_item(self.companies[0], self.currency1, self.unit1)
        
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.admin_users[0],
            {"path": reverse("core:items-detail", kwargs={"uuid": item.uuid})},
        )
        self.assertEqual(response.status_code, 200)
        
        # Admin can also update
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.admin_users[0],
            {
                "path": reverse("core:items-detail", kwargs={"uuid": item.uuid}),
                "data": {"name": "Updated by admin"},
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Updated by admin")
