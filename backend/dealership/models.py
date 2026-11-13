from django.db import models

class Dealership(models.Model):
    dealership_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    address = models.TextField()

    def __str__(self):
        return self.name


class Customer(models.Model):
    customer_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    address = models.TextField()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Employee(models.Model):
    EMPLOYEE_ROLES = [
        ('salesperson', 'Salesperson'),
        ('mechanic', 'Mechanic'),
    ]

    employee_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=30, choices=EMPLOYEE_ROLES)
    phone = models.CharField(max_length=30)
    hire_date = models.DateField()

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"


class Sale(models.Model):
    sale_id = models.AutoField(primary_key=True)
    car = models.OneToOneField('cars.Car', on_delete=models.PROTECT, related_name='sale')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='purchases')
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='sales_handled')
    sale_date = models.DateField(auto_now_add=True)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.car.status = 'sold'
            self.car.save()

    def __str__(self):
        return f"Sale #{self.sale_id} - {self.customer}"


class Rental(models.Model):
    rental_id = models.AutoField(primary_key=True)
    car = models.OneToOneField('cars.Car', on_delete=models.PROTECT, related_name='rental_record')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='rentals')
    start_date = models.DateField()
    end_date = models.DateField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    payment_method = models.CharField(max_length=50)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        days = (self.end_date - self.start_date).days
        self.total_cost = self.car.rent_price_per_day * max(days, 1)

        super().save(*args, **kwargs)
        if is_new:
            self.car.status = 'rented'
            self.car.save()

    def __str__(self):
        return f"Rental #{self.rental_id} - {self.customer}"


class TestDrive(models.Model):
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE, related_name='test_drives')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='test_drives')
    drive_date = models.DateTimeField()

    def __str__(self):
        return f"Test Drive: {self.customer} - {self.car} on {self.drive_date}"


class Service(models.Model):
    service_id = models.AutoField(primary_key=True)
    car = models.ForeignKey('cars.Car', on_delete=models.CASCADE, related_name='services')
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='services_performed')
    service_date = models.DateField()
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Service #{self.service_id} for {self.car}"