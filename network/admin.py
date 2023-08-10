from django.contrib import admin

from .models import Post, Like, User,Follower
# Register your models here.
admin.site.register(Post)
admin.site.register(User)
admin.site.register(Like)
admin.site.register(Follower)
