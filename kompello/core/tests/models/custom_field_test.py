
from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError
from django.test import TestCase

from kompello.core.models.auth_models import KompelloUser
from kompello.core.models.company_models import Company
from kompello.core.models.custom_field_models import CustomFieldDefinition, CustomFieldInstance


class CustomFieldDefinitionTest(TestCase):
    """Test cases for CustomFieldDefinition model."""

    def test_create_custom_field_definition(self):
        company = Company.objects.create(name="Test Company")

        custom_field_definition = CustomFieldDefinition.objects.create(
            key="test_field",
            name="Test Field",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ContentType.objects.get_for_model(Company),
            company=company,
            track_history=True,
        )

    def test_create_custom_field_definition_requires_company(self):
        with self.assertRaises(IntegrityError):
            CustomFieldDefinition.objects.create(
                key="test_field",
                name="Test Field",
                data_type=CustomFieldDefinition.FieldDataType.TEXT,
                model_type=ContentType.objects.get_for_model(Company),
                track_history=True,
            )

    def test_create_custom_field_definition_requires_model_type(self):
        company = Company.objects.create(name="Test Company")

        with self.assertRaises(IntegrityError):
            CustomFieldDefinition.objects.create(
                key="test_field",
                name="Test Field",
                data_type=CustomFieldDefinition.FieldDataType.TEXT,
                company=company,
                track_history=True,
            )

    def test_create_custom_field_definition_key_model_company_unique(self):
        company1 = Company.objects.create(name="Test Company")
        company2 = Company.objects.create(name="Test Company")

        CustomFieldDefinition.objects.create(
            key="test_field",
            name="Test Field",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ContentType.objects.get_for_model(Company),
            company=company1,
            track_history=True,
        )

        # Test different key
        CustomFieldDefinition.objects.create(
                key="test_field_new",
                name="Test Field",
                data_type=CustomFieldDefinition.FieldDataType.TEXT,
                model_type=ContentType.objects.get_for_model(Company),
                company=company1,
                track_history=True,
            )

        # Test different model type
        CustomFieldDefinition.objects.create(
                key="test_field",
                name="Test Field",
                data_type=CustomFieldDefinition.FieldDataType.TEXT,
                model_type=ContentType.objects.get_for_model(KompelloUser),
                company=company1,
                track_history=True,
            )

        # Test different company
        CustomFieldDefinition.objects.create(
                key="test_field",
                name="Test Field",
                data_type=CustomFieldDefinition.FieldDataType.TEXT,
                model_type=ContentType.objects.get_for_model(KompelloUser),
                company=company2,
                track_history=True,
            )
        
        # Test key model company duplicate
        with self.assertRaises(IntegrityError):
            CustomFieldDefinition.objects.create(
                key="test_field",
                name="Test Field",
                data_type=CustomFieldDefinition.FieldDataType.TEXT,
                model_type=ContentType.objects.get_for_model(Company),
                company=company1,
                track_history=True,
            )

class CustomFieldInstanceTest(TestCase):
    """Test cases for CustomFieldInstance model."""

    def setUp(self):
        # Set up any necessary data for the tests
        self.company = Company.objects.create(name="Test Company")
        self.custom_field_definition = CustomFieldDefinition.objects.create(
            key="test_field",
            name="Test Field",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ContentType.objects.get_for_model(Company),
            company=self.company,
            track_history=True,
        )

    def test_create_custom_field_instance(self):
        CustomFieldInstance.objects.create(
            custom_field=self.custom_field_definition,
            content_object=self.company,
            value="Lool"
        )

    def test_create_custom_field_instance_requires_custom_field(self):
        with self.assertRaises(IntegrityError):
            CustomFieldInstance.objects.create(
                content_object=self.company,
                value="Lool"
            )
    def test_create_custom_field_instance_requires_content_object(self):
        with self.assertRaises(IntegrityError):
            CustomFieldInstance.objects.create(
                custom_field=self.custom_field_definition,
                value="Lool"
            )
    def test_create_custom_field_instance_not_requires_value(self):
        CustomFieldInstance.objects.create(
            custom_field=self.custom_field_definition,
            content_object=self.company
        )