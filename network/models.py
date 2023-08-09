from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    nickname = models.CharField(max_length=20, null = True)
    image = models.URLField(null=True,  blank=True)
    def serialize(self):
        return {
            #"id":self.pk,
            "nickname":self.nickname,
        }
    def __str__(self):
        return self.username

class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, null = False, default = False)
    content = models.TextField(max_length=550, null = True)
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True)
    likes = models.IntegerField(blank=True, null=True)

    def serialize(self):
        return {
            "id":self.pk,
            "creator":self.creator.username,
            "content":self.content,
            "created":self.created_at.strftime("%b %d %Y, %I:%M %p"),
            "likes":self.likes
        }

    def __str__(self):
        return self.content
    
class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="like", null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="like_owner",null=True)

class Follower(models.Model):
    followers = models.ManyToManyField(User,related_name="followers",blank = True)
    following = models.ManyToManyField(User,related_name="following",blank = True)

##class Profie(models.Model):
    ##user = models.ForeignKey(User, on_delete = models.CASCADE, null = False, default= False)
    ##banner = models.URLField(null = True, blank = True)
