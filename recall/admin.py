from django.contrib import admin
from recall.models import BlogPost
from recall.models import Comment
from recall.models import Person
# Register your models here.

admin.site.register(Person)
admin.site.register(BlogPost)
admin.site.register(Comment)
