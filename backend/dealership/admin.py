from django.contrib import admin
from .models import Dealership, Customer, Employee, Sale, Rental, TestDrive, Service

admin.site.register(Dealership)
admin.site.register(Customer)
admin.site.register(Employee)
admin.site.register(Sale)
admin.site.register(Rental)
admin.site.register(TestDrive)
admin.site.register(Service)

