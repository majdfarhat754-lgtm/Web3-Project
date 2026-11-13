from rest_framework import serializers
from cars.models import Car
from .models import Dealership, Customer, Sale, Rental

class CarSerializer(serializers.ModelSerializer):
    dealership_name = serializers.CharField(source='dealership.name', read_only=True)

    class Meta:
        model = Car
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    customer_details = CustomerSerializer(source='customer', read_only=True)
    car_details = CarSerializer(source='car', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['sale_date', 'sale_price']

    def create(self, validated_data):
        car = validated_data['car']
        validated_data['sale_price'] = car.price
        return super().create(validated_data)

class RentalSerializer(serializers.ModelSerializer):
    customer_details = CustomerSerializer(source='customer', read_only=True)
    car_details = CarSerializer(source='car', read_only=True)

    class Meta:
        model = Rental
        fields = '__all__'
        read_only_fields = ['total_cost']