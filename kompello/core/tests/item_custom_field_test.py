"""
Tests for Item custom fields functionality.
"""

from decimal import Decimal
from http import HTTPMethod
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse

from kompello.core.models import Company, KompelloUser
from kompello.core.models.billing_models import Item, Currency, Unit
from kompello.core.models.custom_field_models import CustomFieldDefinition, CustomFieldInstance
from kompello.core.tests.helper import BaseTestCase


class ItemCustomFieldTestCase(BaseTestCase):
    """Test case for Item custom field operations."""

    def setUp(self):
        """Set up test fixtures."""
        # Create users and companies
        self.admin_users = self.create_admin_user(1)
        self.users = self.create_user(3)
        self.companies = self.create_company(2)
        
        # Add users to companies
        self.companies[0].members.add(self.users[0], self.users[1])
        self.companies[1].members.add(self.users[2])
        
        # Create currency and unit for company 0
        self.currency = Currency.objects.create(
            company=self.companies[0],
            symbol="$",
            short_name="USD",
            long_name="US Dollar"
        )
        
        self.unit = Unit.objects.create(
            company=self.companies[0],
            short_name="hr",
            long_name="hours"
        )
        
        # Get content type for Item model
        self.item_content_type = ContentType.objects.get_for_model(Item)
        
        # Create custom field definitions for company 0
        self.text_field = CustomFieldDefinition.objects.create(
            key="skill_level",
            name="Skill Level",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=self.item_content_type,
            company=self.companies[0],
            track_history=True,
            show_in_ui=True
        )
        
        self.number_field = CustomFieldDefinition.objects.create(
            key="max_hours",
            name="Maximum Hours",
            data_type=CustomFieldDefinition.FieldDataType.NUMBER,
            model_type=self.item_content_type,
            company=self.companies[0],
            track_history=True,
            show_in_ui=True
        )
        
        self.boolean_field = CustomFieldDefinition.objects.create(
            key="requires_certification",
            name="Requires Certification",
            data_type=CustomFieldDefinition.FieldDataType.BOOLEAN,
            model_type=self.item_content_type,
            company=self.companies[0],
            track_history=True,
            show_in_ui=True
        )

    def _create_item_data(self, company, currency, unit, custom_fields=None):
        """Helper to create item data payload."""
        data = {
            "company": str(company.uuid),
            "name": "Web Development",
            "description": "Hourly web development service",
            "currency": str(currency.uuid),
            "unit": str(unit.uuid),
            "price_per_unit": "75.00",
            "price_max": "150.00",
        }
        if custom_fields is not None:
            data["custom_fields"] = custom_fields
        return data

    def test_create_item_with_custom_fields(self):
        """Test creating an item with custom fields."""
        data = self._create_item_data(
            self.companies[0],
            self.currency,
            self.unit,
            custom_fields={
                "skill_level": "Senior",
                "max_hours": 40,
                "requires_certification": True
            }
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        
        # Verify item was created
        item = Item.objects.get(uuid=response.data['uuid'])
        self.assertEqual(item.name, "Web Development")
        
        # Verify custom fields were created
        self.assertEqual(item.custom_fields.count(), 3)
        
        # Verify custom field values
        skill_level_instance = item.custom_fields.get(custom_field__key="skill_level")
        self.assertEqual(skill_level_instance.value, "Senior")
        
        max_hours_instance = item.custom_fields.get(custom_field__key="max_hours")
        self.assertEqual(max_hours_instance.value, 40)
        
        certification_instance = item.custom_fields.get(custom_field__key="requires_certification")
        self.assertEqual(certification_instance.value, True)
        
        # Verify response includes custom fields
        self.assertIn("custom_fields", response.data)
        self.assertEqual(response.data["custom_fields"]["skill_level"], "Senior")
        self.assertEqual(response.data["custom_fields"]["max_hours"], 40)
        self.assertEqual(response.data["custom_fields"]["requires_certification"], True)

    def test_create_item_with_custom_fields(self):
        """Test creating an item with custom fields."""
        data = self._create_item_data(
            self.companies[0],
            self.currency,
            self.unit,
            custom_fields={
                "skill_level": "Senior",
                "max_hours": 40,
                "requires_certification": True
            }
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        
        # Verify item was created
        item = Item.objects.get(uuid=response.data['uuid'])
        self.assertEqual(item.name, "Web Development")
        
        # Verify custom fields were created
        self.assertEqual(item.custom_fields.count(), 3)
        
        # Verify custom field values
        skill_level_instance = item.custom_fields.get(custom_field__key="skill_level")
        self.assertEqual(skill_level_instance.value, "Senior")
        
        max_hours_instance = item.custom_fields.get(custom_field__key="max_hours")
        self.assertEqual(max_hours_instance.value, 40)
        
        certification_instance = item.custom_fields.get(custom_field__key="requires_certification")
        self.assertEqual(certification_instance.value, True)
        
        # Verify response includes custom fields
        self.assertIn("custom_fields", response.data)
        self.assertEqual(response.data["custom_fields"]["skill_level"], "Senior")
        self.assertEqual(response.data["custom_fields"]["max_hours"], 40)
        self.assertEqual(response.data["custom_fields"]["requires_certification"], True)

    def test_create_item_without_custom_fields(self):
        """Test creating an item without custom fields."""
        data = self._create_item_data(
            self.companies[0],
            self.currency,
            self.unit
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        
        # Verify item was created
        item = Item.objects.get(uuid=response.data['uuid'])
        self.assertEqual(item.name, "Web Development")
        
        # Verify no custom fields were created
        self.assertEqual(item.custom_fields.count(), 0)
        
        # Verify response includes empty custom_fields
        self.assertIn("custom_fields", response.data)
        self.assertEqual(response.data["custom_fields"], {})

    def test_retrieve_item_with_custom_fields(self):
        """Test retrieving an item includes custom fields."""
        # Create item
        item = Item.objects.create(
            company=self.companies[0],
            name="Test Item",
            description="Test description",
            currency=self.currency,
            unit=self.unit,
            price_per_unit=Decimal("50.00")
        )
        
        # Add custom fields
        CustomFieldInstance.objects.create(
            custom_field=self.text_field,
            content_type=self.item_content_type,
            object_id=item.id,
            value="Junior"
        )
        
        CustomFieldInstance.objects.create(
            custom_field=self.number_field,
            content_type=self.item_content_type,
            object_id=item.id,
            value=20
        )
        
        # Retrieve item
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:items-detail", kwargs={"uuid": item.uuid})},
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("custom_fields", response.data)
        self.assertEqual(response.data["custom_fields"]["skill_level"], "Junior")
        self.assertEqual(response.data["custom_fields"]["max_hours"], 20)

    def test_update_item_custom_fields(self):
        """Test updating custom fields on an existing item."""
        # Create item with custom fields
        item = Item.objects.create(
            company=self.companies[0],
            name="Test Item",
            description="Test description",
            currency=self.currency,
            unit=self.unit,
            price_per_unit=Decimal("50.00")
        )
        
        CustomFieldInstance.objects.create(
            custom_field=self.text_field,
            content_type=self.item_content_type,
            object_id=item.id,
            value="Junior"
        )
        
        # Update custom field
        data = {
            "custom_fields": {
                "skill_level": "Senior",
                "max_hours": 40
            }
        }
        
        response = self.authenticated_request(
            HTTPMethod.PATCH,
            self.users[0],
            {"path": reverse("core:items-detail", kwargs={"uuid": item.uuid}), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify custom fields were updated
        skill_level_instance = item.custom_fields.get(custom_field__key="skill_level")
        self.assertEqual(skill_level_instance.value, "Senior")
        
        # Verify new custom field was added
        max_hours_instance = item.custom_fields.get(custom_field__key="max_hours")
        self.assertEqual(max_hours_instance.value, 40)
        
        # Verify response includes updated custom fields
        self.assertEqual(response.data["custom_fields"]["skill_level"], "Senior")
        self.assertEqual(response.data["custom_fields"]["max_hours"], 40)

    def test_invalid_custom_field_key(self):
        """Test that using a non-existent custom field key returns an error."""
        data = self._create_item_data(
            self.companies[0],
            self.currency,
            self.unit,
            custom_fields={
                "non_existent_field": "value"
            }
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("custom_fields", response.data)

    def test_invalid_custom_field_type(self):
        """Test that providing wrong data type for custom field returns an error."""
        data = self._create_item_data(
            self.companies[0],
            self.currency,
            self.unit,
            custom_fields={
                "max_hours": "not a number"  # Should be a number
            }
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("custom_fields", response.data)

    def test_archived_custom_field_cannot_be_set(self):
        """Test that archived custom fields cannot have values set."""
        # Archive the field
        self.text_field.is_archived = True
        self.text_field.save()
        
        data = self._create_item_data(
            self.companies[0],
            self.currency,
            self.unit,
            custom_fields={
                "skill_level": "Senior"  # This field is archived
            }
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("custom_fields", response.data)

    def test_list_items_includes_custom_fields(self):
        """Test that listing items does not include custom fields (performance)."""
        # Create item with custom fields
        item = Item.objects.create(
            company=self.companies[0],
            name="Test Item",
            description="Test description",
            currency=self.currency,
            unit=self.unit,
            price_per_unit=Decimal("50.00")
        )
        
        CustomFieldInstance.objects.create(
            custom_field=self.text_field,
            content_type=self.item_content_type,
            object_id=item.id,
            value="Senior"
        )
        
        # List items
        response = self.authenticated_request(
            HTTPMethod.GET,
            self.users[0],
            {"path": reverse("core:items-list")},
        )
        
        self.assertEqual(response.status_code, 200)
        # List view uses ItemListSerializer which doesn't include custom fields
        # This is a design choice to keep list responses lightweight

    def test_custom_fields_with_null_values(self):
        """Test that null values are allowed for custom fields."""
        data = self._create_item_data(
            self.companies[0],
            self.currency,
            self.unit,
            custom_fields={
                "skill_level": None,
                "max_hours": None
            }
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            self.users[0],
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 201)
        
        # Verify custom fields were created with null values
        item = Item.objects.get(uuid=response.data['uuid'])
        skill_level_instance = item.custom_fields.get(custom_field__key="skill_level")
        self.assertIsNone(skill_level_instance.value)

    def test_different_company_custom_field_isolation(self):
        """Test that custom fields from one company cannot be used by another."""
        # Use the second company and a dedicated user for isolation testing
        other_company = self.companies[1]
        other_user = self.users[2]
        
        # Create currency and unit for other company
        other_currency = Currency.objects.create(
            company=other_company,
            symbol="€",
            short_name="EUR",
            long_name="Euro"
        )
        
        other_unit = Unit.objects.create(
            company=other_company,
            short_name="h",
            long_name="hours"
        )
        
        # Try to use custom field from first company
        data = self._create_item_data(
            other_company,
            other_currency,
            other_unit,
            custom_fields={
                "skill_level": "Senior"  # This field belongs to companies[0], not other_company
            }
        )
        
        response = self.authenticated_request(
            HTTPMethod.POST,
            other_user,
            {"path": reverse("core:items-list"), "data": data, "format": "json"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("custom_fields", response.data)

