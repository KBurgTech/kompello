from django.http import HttpResponse
from kompello.core.models import KompelloUser

def create_dummy_user(request): 
    for i in range(4):
        user = KompelloUser.objects.create_user(
            username=f"testuser{i+1}",
            email=f"testuser{i+1}@example.com",
            password="password123"
        )
    return HttpResponse(status=201, content="")