from http import HTTPMethod
from django.urls import reverse
from django.contrib.contenttypes.models import ContentType

from kompello.core.tests.helper import BaseTestCase
from kompello.core.models.custom_field_models import CustomFieldDefinition, CustomFieldInstance


class CustomFieldApiTest(BaseTestCase):
    def setUp(self):
        self.admin_users = self.create_admin_user(1)
        self.users = self.create_user(2)
        self.company = self.create_company(1)[0]

    def test_create_by_member(self):
        # add user as member
        self.company.members.add(self.users[0])
        ct = ContentType.objects.get_for_model(self.company.__class__)
        data = {
            "key": "test_key",
            "name": "Test Field",
            "data_type": CustomFieldDefinition.FieldDataType.TEXT,
            "model_type": ct.id,
            "company": str(self.company.uuid),
            "track_history": True,
        }
        resp = self.authenticated_request(HTTPMethod.POST, self.users[0], {"path": reverse("core:custom_fields-list"), "data": data})
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["key"], "test_key")

    def test_create_by_non_member_forbidden(self):
        ct = ContentType.objects.get_for_model(self.company.__class__)
        data = {
            "key": "test_key2",
            "name": "Test Field",
            "data_type": CustomFieldDefinition.FieldDataType.TEXT,
            "model_type": ct.id,
            "company": str(self.company.uuid),
            "track_history": True,
        }
        resp = self.authenticated_request(HTTPMethod.POST, self.users[0], {"path": reverse("core:custom_fields-list"), "data": data})
        self.assertEqual(resp.status_code, 403)

    def test_change_data_type_blocked_when_instances_exist(self):
        # create custom field as admin
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k1",
            name="Field 1",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
        )
        # create an instance referencing this company object
        CustomFieldInstance.objects.create(custom_field=cf, content_type=ct, object_id=self.company.id, value="value")

        # try to change data_type
        data = {"data_type": CustomFieldDefinition.FieldDataType.NUMBER}
        resp = self.authenticated_request(HTTPMethod.PATCH, self.admin_users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid}), "data": data})
        self.assertEqual(resp.status_code, 400)
        self.assertIn("data_type", resp.data)

    def test_change_name_allowed_when_instances_exist(self):
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k2",
            name="Field 2",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
        )
        CustomFieldInstance.objects.create(custom_field=cf, content_type=ct, object_id=self.company.id, value="value")

        data = {"name": "New Name"}
        resp = self.authenticated_request(HTTPMethod.PATCH, self.admin_users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid}), "data": data})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["name"], "New Name")

    def test_non_member_cannot_delete(self):
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k3",
            name="Field 3",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
        )
        resp = self.authenticated_request(HTTPMethod.DELETE, self.users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid})})
        self.assertEqual(resp.status_code, 403)

    def test_create_instance_for_archived_field_blocked(self):
        """Test that creating instances for archived custom field definitions is blocked"""
        from django.core.exceptions import ValidationError
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k4",
            name="Field 4",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
            is_archived=True,
        )
        
        # Attempting to create an instance should raise ValidationError
        with self.assertRaises(ValidationError):
            CustomFieldInstance.objects.create(
                custom_field=cf,
                content_type=ct,
                object_id=self.company.id,
                value="test"
            )

    def test_archive_field_with_existing_instances(self):
        """Test that fields can be archived even when instances exist"""
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k5",
            name="Field 5",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
        )
        # Create an instance
        CustomFieldInstance.objects.create(custom_field=cf, content_type=ct, object_id=self.company.id, value="value")

        # Archive the field definition
        data = {"is_archived": True}
        resp = self.authenticated_request(HTTPMethod.PATCH, self.admin_users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid}), "data": data})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["is_archived"])

    def test_show_in_ui_flag(self):
        """Test that show_in_ui flag can be toggled"""
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k6",
            name="Field 6",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
            show_in_ui=True,
        )

        # Toggle show_in_ui to False
        data = {"show_in_ui": False}
        resp = self.authenticated_request(HTTPMethod.PATCH, self.admin_users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid}), "data": data})
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["show_in_ui"])

    def test_delete_with_instances_blocked(self):
        """Test that deleting custom field definition with instances is prevented"""
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k7",
            name="Field 7",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
        )
        # Create an instance
        CustomFieldInstance.objects.create(
            custom_field=cf,
            content_type=ct,
            object_id=self.company.id,
            value="data"
        )

        # Attempt to delete should be blocked
        resp = self.authenticated_request(HTTPMethod.DELETE, self.admin_users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid})})
        self.assertEqual(resp.status_code, 400)
        self.assertIn("data loss", resp.data["detail"].lower())

    def test_delete_without_instances_allowed(self):
        """Test that deleting custom field definition without instances is allowed"""
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k8",
            name="Field 8",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
        )

        # Delete should succeed
        resp = self.authenticated_request(HTTPMethod.DELETE, self.admin_users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid})})
        self.assertEqual(resp.status_code, 204)

    def test_archived_field_cannot_create_instances(self):
        """Test that archived custom field definitions cannot have new instances created."""
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k4",
            name="Archived Field",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
            is_archived=True,
        )
        # Try to create an instance for archived field
        from django.core.exceptions import ValidationError
        with self.assertRaises(ValidationError):
            CustomFieldInstance.objects.create(
                custom_field=cf,
                content_type=ct,
                object_id=self.company.id,
                value="test"
            )

    def test_archive_field_with_existing_instances(self):
        """Test that archiving a field with existing instances is allowed."""
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k5",
            name="Field 5",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
        )
        # Create an instance
        CustomFieldInstance.objects.create(
            custom_field=cf,
            content_type=ct,
            object_id=self.company.id,
            value="existing"
        )
        # Archive the field
        data = {"is_archived": True}
        resp = self.authenticated_request(HTTPMethod.PATCH, self.admin_users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid}), "data": data})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["is_archived"])

    def test_show_in_ui_flag(self):
        """Test that show_in_ui flag can be set and updated."""
        ct = ContentType.objects.get_for_model(self.company.__class__)
        cf = CustomFieldDefinition.objects.create(
            key="k6",
            name="Field 6",
            data_type=CustomFieldDefinition.FieldDataType.TEXT,
            model_type=ct,
            company=self.company,
            show_in_ui=False,
        )
        self.assertFalse(cf.show_in_ui)
        # Update show_in_ui
        data = {"show_in_ui": True}
        resp = self.authenticated_request(HTTPMethod.PATCH, self.admin_users[0], {"path": reverse("core:custom_fields-detail", kwargs={"uuid": cf.uuid}), "data": data})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["show_in_ui"])
