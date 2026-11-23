import random
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from cars.models import Car
from dealership.models import (
    Customer,
    Dealership,
    Employee,
    Rental,
    Sale,
    Service,
    TestDrive,
)


class Command(BaseCommand):
    help = "Populate the database with realistic car dealership sample data."

    def handle(self, *args, **options):
        created_counts = {
            "Dealerships": 0,
            "Employees": 0,
            "Customers": 0,
            "Cars": 0,
            "Sales": 0,
            "Rentals": 0,
            "Test drives": 0,
            "Services": 0,
        }
        rng = random.Random(2026)

        with transaction.atomic():
            dealerships = []
            dealership_data = [
                {
                    "email": "hello@northstarautos.example",
                    "name": "Northstar Auto Group",
                    "phone": "206-555-0142",
                    "address": "410 Pine Street, Seattle, WA 98101",
                },
                {
                    "email": "sales@lakesidemotors.example",
                    "name": "Lakeside Motors",
                    "phone": "312-555-0178",
                    "address": "825 West Lake Street, Chicago, IL 60607",
                },
            ]
            for data in dealership_data:
                dealership, created = Dealership.objects.get_or_create(
                    email=data["email"],
                    defaults={
                        "name": data["name"],
                        "phone": data["phone"],
                        "address": data["address"],
                    },
                )
                dealerships.append(dealership)
                created_counts["Dealerships"] += created

            employee_data = [
                ("Ava", "Mitchell", "salesperson", "206-555-0201", date(2021, 4, 12)),
                ("Noah", "Bennett", "salesperson", "206-555-0202", date(2022, 8, 3)),
                ("Mia", "Carter", "salesperson", "312-555-0203", date(2020, 2, 17)),
                ("Liam", "Brooks", "mechanic", "206-555-0204", date(2019, 6, 24)),
                ("Sofia", "Reed", "mechanic", "312-555-0205", date(2023, 1, 9)),
            ]
            employees = []
            for first_name, last_name, role, phone, hire_date in employee_data:
                employee, created = Employee.objects.get_or_create(
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    defaults={"phone": phone, "hire_date": hire_date},
                )
                employees.append(employee)
                created_counts["Employees"] += created

            customer_data = [
                ("Olivia", "Parker", "olivia.parker@example.com", "206-555-0301", "120 Cedar Avenue, Seattle, WA 98109"),
                ("Ethan", "Foster", "ethan.foster@example.com", "206-555-0302", "54 Lakeview Drive, Bellevue, WA 98004"),
                ("Isabella", "Hayes", "isabella.hayes@example.com", "312-555-0303", "900 North Clark Street, Chicago, IL 60610"),
                ("Mason", "Collins", "mason.collins@example.com", "312-555-0304", "28 Oak Street, Evanston, IL 60201"),
                ("Charlotte", "Ward", "charlotte.ward@example.com", "206-555-0305", "611 Spruce Lane, Seattle, WA 98103"),
                ("Lucas", "Gray", "lucas.gray@example.com", "312-555-0306", "73 Maple Avenue, Oak Park, IL 60302"),
                ("Amelia", "Price", "amelia.price@example.com", "206-555-0307", "245 Summit Road, Redmond, WA 98052"),
                ("James", "Rivera", "james.rivera@example.com", "312-555-0308", "16 Birch Court, Naperville, IL 60540"),
            ]
            customers = []
            for first_name, last_name, email, phone, address in customer_data:
                customer, created = Customer.objects.get_or_create(
                    email=email,
                    defaults={
                        "first_name": first_name,
                        "last_name": last_name,
                        "phone": phone,
                        "address": address,
                    },
                )
                customers.append(customer)
                created_counts["Customers"] += created

            car_data = [
                ("1HGBH41JXMN109186", "Toyota", "Camry", 2022, "Silver", 28400, "25995.00", "52.00", "used"),
                ("1HGBH41JXMN109187", "Honda", "CR-V", 2023, "Blue", 19300, "31250.00", "68.00", "used"),
                ("1HGBH41JXMN109188", "Ford", "F-150", 2024, "Black", 8700, "42900.00", "92.00", "used"),
                ("1HGBH41JXMN109189", "Subaru", "Outback", 2021, "Green", 35600, "27800.00", "61.00", "used"),
                ("1HGBH41JXMN109190", "Hyundai", "Tucson", 2023, "White", 14200, "28950.00", "64.00", "used"),
                ("1HGBH41JXMN109191", "Chevrolet", "Equinox", 2022, "Red", 22100, "26750.00", "59.00", "used"),
                ("1HGBH41JXMN109192", "Mazda", "CX-5", 2025, "Gray", 120, "34750.00", "72.00", "new"),
                ("1HGBH41JXMN109193", "Kia", "Sportage", 2025, "Blue", 85, "32900.00", "69.00", "new"),
                ("1HGBH41JXMN109194", "Nissan", "Altima", 2024, "White", 6100, "27400.00", "57.00", "used"),
                ("1HGBH41JXMN109195", "Volkswagen", "Tiguan", 2024, "Black", 9400, "33800.00", "73.00", "used"),
                ("1HGBH41JXMN109196", "Toyota", "RAV4", 2025, "Silver", 60, "36500.00", "76.00", "new"),
                ("1HGBH41JXMN109197", "Honda", "Civic", 2025, "Red", 45, "24900.00", "51.00", "new"),
            ]
            cars = []
            for index, data in enumerate(car_data):
                vin, make, model, year, color, mileage, price, rent_price, condition = data
                car, created = Car.objects.get_or_create(
                    vin=vin,
                    defaults={
                        "dealership": dealerships[index % len(dealerships)],
                        "make": make,
                        "model": model,
                        "year": year,
                        "color": color,
                        "mileage": mileage,
                        "price": Decimal(price),
                        "rent_price_per_day": Decimal(rent_price),
                        "condition": condition,
                    },
                )
                cars.append(car)
                created_counts["Cars"] += created

            salespeople = [employee for employee in employees if employee.role == "salesperson"]
            mechanics = [employee for employee in employees if employee.role == "mechanic"]

            for index, car in enumerate(cars[:3]):
                _, created = Sale.objects.get_or_create(
                    car=car,
                    defaults={
                        "customer": customers[index],
                        "employee": salespeople[index % len(salespeople)],
                        "sale_price": car.price,
                        "payment_method": ("Financing", "Cash", "Bank transfer")[index],
                    },
                )
                created_counts["Sales"] += created

            rental_start = date.today() + timedelta(days=1)
            for index, car in enumerate(cars[3:6]):
                _, created = Rental.objects.get_or_create(
                    car=car,
                    defaults={
                        "customer": customers[index + 3],
                        "start_date": rental_start,
                        "end_date": rental_start + timedelta(days=4 + index),
                        "payment_method": ("Credit card", "Debit card", "Credit card")[index],
                    },
                )
                created_counts["Rentals"] += created

            for index, car in enumerate(rng.sample(cars, 4)):
                drive_date = datetime(2025, 6, 10 + index, 10 + index, tzinfo=timezone.utc)
                _, created = TestDrive.objects.get_or_create(
                    car=car,
                    customer=rng.choice(customers),
                    drive_date=drive_date,
                )
                created_counts["Test drives"] += created

            service_descriptions = (
                "Oil and filter change; multi-point inspection",
                "Brake pads replaced and brake fluid checked",
                "Tire rotation and wheel alignment",
                "Battery and charging system diagnostic",
            )
            for index, car in enumerate(rng.sample(cars, 4)):
                _, created = Service.objects.get_or_create(
                    car=car,
                    employee=mechanics[index % len(mechanics)],
                    service_date=date(2025, 7, 5 + index),
                    description=service_descriptions[index],
                    defaults={"cost": Decimal(("89.95", "245.00", "119.50", "65.00")[index])},
                )
                created_counts["Services"] += created

        summary = ", ".join(
            f"{model}: {count}" for model, count in created_counts.items()
        )
        self.stdout.write(self.style.SUCCESS(f"Sample data ready. Created records: {summary}"))
