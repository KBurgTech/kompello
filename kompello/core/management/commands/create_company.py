from django.core.management.base import BaseCommand
from kompello.core.models.company_models import Company


class Command(BaseCommand):
    help = "Create a new company"

    def add_arguments(self, parser):
        parser.add_argument(
            "name",
            type=str,
            help="The name of the company",
        )
        parser.add_argument(
            "--description",
            type=str,
            help="The description of the company",
            default="",
        )

    def handle(self, *args, **options):
        name = options["name"]
        description = options.get("description", "")

        company, created = Company.objects.get_or_create(
            name=name,
            defaults={"description": description},
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created company "{company.name}" with ID {company.uuid}'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Company "{company.name}" already exists')
            )
