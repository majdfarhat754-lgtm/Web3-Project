from django.contrib import admin
from .models import Car

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('vin', 'make', 'model', 'year', 'price', 'status', 'dealership')
    list_filter = ('status', 'condition', 'make')
    search_fields = ('vin', 'make', 'model')
    
