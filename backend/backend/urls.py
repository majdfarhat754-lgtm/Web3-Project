from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from dealership.views import CarViewSet, CustomerViewSet, SaleViewSet, RentalViewSet, lookup_customer

router = DefaultRouter()
router.register(r'cars', CarViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'rentals', RentalViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/lookup_customer/', lookup_customer, name='lookup_customer'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)