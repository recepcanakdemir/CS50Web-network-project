
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following_posts, name="following_posts"),
    path("users/<str:username>", views.load_profile, name="load_profile"),
 #   path("users/follow/<str:username>", views.follow, name="follow"),

    # API Routes
    path("posts", views.create_new_post, name="create_new_post"),
    path("posts/<int:post_id>", views.like_unlike, name="like_unlike"),
    path("posts/edit/<int:post_id>", views.edit_post, name="edit_post"),
    #path("users/posts/edit/<int:post_id>", views.edit_post, name="edit_post"),

]
