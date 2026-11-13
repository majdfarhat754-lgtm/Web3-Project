from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from cars.models import Car
from .models import Customer, Sale, Rental
from .serializers import CarSerializer, CustomerSerializer, SaleSerializer, RentalSerializer

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

class RentalViewSet(viewsets.ModelViewSet):
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer

@api_view(['GET'])
def lookup_customer(request):
    email = request.query_params.get('email', '').strip()
    if not email:
        return Response({'error': 'Email parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        customer = Customer.objects.get(email__iexact=email)
        return Response(CustomerSerializer(customer).data)
    except Customer.DoesNotExist:
        return Response({'found': False}, status=status.HTTP_404_NOT_FOUND)
