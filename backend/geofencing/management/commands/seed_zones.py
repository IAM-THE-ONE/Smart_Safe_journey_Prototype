from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from geofencing.models import Zone

User = get_user_model()

ZONES = [
    {"name": "Gateway of India", "zone_type": "safe", "latitude": 18.9219, "longitude": 72.8346, "radius": 300, "description": "Popular tourist area with high police presence"},
    {"name": "MG Road, Bangalore", "zone_type": "safe", "latitude": 12.9716, "longitude": 77.5946, "radius": 500, "description": "Commercial hub with good security"},
    {"name": "Connaught Place, Delhi", "zone_type": "safe", "latitude": 28.6315, "longitude": 77.2167, "radius": 400, "description": "Central business district with CCTV coverage"},
    {"name": "Marine Drive, Mumbai", "zone_type": "restricted", "latitude": 18.9432, "longitude": 72.8231, "radius": 200, "description": "Restricted access after 11 PM"},
    {"name": "Red Fort Area, Delhi", "zone_type": "restricted", "latitude": 28.6562, "longitude": 77.2410, "radius": 300, "description": "Historical monument with restricted entry timing"},
    {"name": "Sunderbans Delta", "zone_type": "high_risk", "latitude": 21.9497, "longitude": 88.9401, "radius": 1000, "description": "High risk area - tiger reserve, travel with guide only"},
    {"name": "Border Areas, Rajasthan", "zone_type": "high_risk", "latitude": 26.9000, "longitude": 70.9000, "radius": 1500, "description": "International border area - special permits required"},
    {"name": "Nauradehi Wildlife Sanctuary", "zone_type": "high_risk", "latitude": 23.5000, "longitude": 79.5000, "radius": 800, "description": "Wildlife sanctuary - no travel after sunset"},
]

class Command(BaseCommand):
    help = "Seed geofencing zones"

    def handle(self, *args, **options):
        admin = User.objects.filter(role="admin").first()
        if not admin:
            self.stdout.write(self.style.WARNING("No admin user found. Creating zones without creator."))
            admin = None

        created = 0
        for z in ZONES:
            _, was_created = Zone.objects.get_or_create(
                name=z["name"],
                defaults={**z, "created_by": admin} if admin else {**z},
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"  Created zone: {z['name']}"))
            else:
                self.stdout.write(f"  Zone already exists: {z['name']}")

        self.stdout.write(self.style.SUCCESS(f"\nDone! {created} zones created."))
