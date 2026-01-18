"""
Billing-related models for the Kompello application.
"""

from decimal import Decimal

from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.contenttypes.fields import GenericRelation

from kompello.core.models.base_models import BaseModel, HistoryModel
from kompello.core.models.company_models import Company
from kompello.core.models.custom_field_models import CustomFieldInstance


class Unit(BaseModel, HistoryModel):
    """
    Unit model for measuring quantities (e.g., hours, kg, pieces).
    Each unit belongs to a single company.
    """
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="units",
        help_text="Company that owns this unit"
    )
    
    short_name = models.CharField(
        max_length=20,
        help_text="Short name for the unit (e.g., h, kg, pcs)"
    )
    
    long_name = models.CharField(
        max_length=100,
        help_text="Long name for the unit (e.g., hours, kilograms, pieces)"
    )
    
    class Meta:
        db_table = "core_unit"
        ordering = ["long_name"]
        unique_together = [["company", "short_name"], ["company", "long_name"]]
        verbose_name = "Unit"
        verbose_name_plural = "Units"
    
    def __str__(self):
        return f"{self.long_name} ({self.short_name})"


class Currency(BaseModel, HistoryModel):
    """
    Currency model for monetary transactions.
    Each currency belongs to a single company.
    """
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="currencies",
        help_text="Company that owns this currency"
    )
    
    symbol = models.CharField(
        max_length=10,
        help_text="Currency symbol (e.g., €, $, £)"
    )
    
    short_name = models.CharField(
        max_length=10,
        help_text="Currency code (e.g., EUR, USD, GBP)"
    )
    
    long_name = models.CharField(
        max_length=100,
        help_text="Full currency name (e.g., Euro, US Dollar, British Pound)"
    )
    
    class Meta:
        db_table = "core_currency"
        ordering = ["short_name"]
        unique_together = [["company", "short_name"], ["company", "long_name"]]
        verbose_name = "Currency"
        verbose_name_plural = "Currencies"
    
    def __str__(self):
        return f"{self.long_name} ({self.short_name})"


class Item(BaseModel, HistoryModel):
    """
    Item model for defining billable items.
    Items are templates that can be used to create bill line items.
    Each item belongs to a single company and supports custom fields.
    
    Price Range Support:
    - price_per_unit: Base/minimum price (required)
    - price_max: Maximum price (optional)
    - If only price_per_unit is set, it represents a fixed price
    - If both are set, defines a flexible range for customer-specific pricing or discounts
    """
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="items",
        help_text="Company that owns this item"
    )
    
    name = models.CharField(
        max_length=255,
        help_text="Item name"
    )
    
    description = models.TextField(
        blank=True,
        default="",
        help_text="Optional item description"
    )
    
    currency = models.ForeignKey(
        Currency,
        on_delete=models.PROTECT,
        related_name="items",
        help_text="Currency for this item"
    )
    
    unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name="items",
        help_text="Unit of measurement for this item"
    )
    
    price_per_unit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Base/minimum price per unit"
    )
    
    price_max = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        validators=[MinValueValidator(Decimal("0"))],
        help_text="Maximum price per unit (optional). If not set, price_per_unit is the fixed price. Enables flexible pricing for discounts or customer-specific rates."
    )
    
    # Support for custom fields
    custom_fields = GenericRelation(
        CustomFieldInstance,
        content_type_field="content_type",
        object_id_field="object_id",
        related_query_name="item"
    )
    
    class Meta:
        db_table = "core_item"
        ordering = ["name"]
        verbose_name = "Item"
        verbose_name_plural = "Items"
        constraints = [
            models.CheckConstraint(
                check=models.Q(price_max__isnull=True) | models.Q(price_max__gte=models.F("price_per_unit")),
                name="item_price_max_gte_price_per_unit",
            )
        ]
    
    def __str__(self):
        if self.price_max and self.price_max != self.price_per_unit:
            return f"{self.name} ({self.price_per_unit}-{self.price_max} {self.currency.symbol}/{self.unit.short_name})"
        return f"{self.name} ({self.price_per_unit} {self.currency.symbol}/{self.unit.short_name})"
