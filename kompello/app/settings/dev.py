import os

from .shared import *

SECRET_KEY = os.getenv("KOMPELLO_SECRET", "SECRET_DEV_KEY")
DEBUG = True
ALLOWED_HOSTS = []

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR  / 'db.sqlite3',
    }
}

CORS_ALLOW_ALL_ORIGINS = True