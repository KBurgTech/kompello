"""
Customer and Address models for the Kompello application.
"""

from django.db import models
from django.core.validators import EmailValidator

from kompello.core.models.base_models import BaseModel, HistoryModel
from kompello.core.models.company_models import Company


class Address(BaseModel, HistoryModel):
    """
    Address model to store physical addresses.
    Can be used for customers, companies, or other entities.
    """
    
    street = models.CharField(max_length=255, help_text="Street address")
    street_2 = models.CharField(
        max_length=255, 
        blank=True, 
        default="",
        help_text="Additional street information (apartment, suite, etc.)"
    )
    city = models.CharField(max_length=100, help_text="City name")
    state = models.CharField(
        max_length=100, 
        blank=True, 
        default="",
        help_text="State or province"
    )
    postal_code = models.CharField(max_length=20, help_text="Postal or ZIP code")
    country = models.CharField(max_length=100, help_text="Country name")
    
    class Meta:
        db_table = "core_address"
        ordering = ["-created_on"]
        verbose_name_plural = "Addresses"
    
    def __str__(self):
        parts = [self.street]
        if self.street_2:
            parts.append(self.street_2)
        parts.extend([self.city, self.postal_code, self.country])
        return ", ".join(parts)


class Customer(BaseModel, HistoryModel):
    """
    Customer model for managing billing customers.
    Each customer belongs to a single company.
    """
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="customers",
        help_text="Company that owns this customer"
    )
        
    # Personal information
    title = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Title (Mr., Ms., Dr., etc.)"
    )
    firstname = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Customer's first name"
    )
    lastname = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Customer's last name"
    )
    birthdate = models.DateField(
        null=True,
        blank=True,
        help_text="Customer's date of birth"
    )
    
    # Contact information
    email = models.EmailField(
        validators=[EmailValidator()],
        blank=True,
        default="",
        help_text="Customer email address"
    )
    mobile_phone = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Customer mobile phone number"
    )
    landline_phone = models.CharField(
        max_length=50,
        blank=True,
        default="",
        help_text="Customer landline phone number"
    )
    
    # Address relationship
    address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customers",
        help_text="Customer's address"
    )
    
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Additional notes about the customer"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the customer is active"
    )
    
    class Meta:
        db_table = "core_customer"
        ordering = ["-created_on"]
        indexes = [
            models.Index(fields=["company", "uuid"]),
            models.Index(fields=["email"]),
        ]
    
    def get_full_name(self) -> str:
        """Return the full name of the customer."""
        return f"{self.firstname} {self.lastname}".strip()

    def __str__(self):
        return f"{self.uuid} - {self.get_full_name()}"
