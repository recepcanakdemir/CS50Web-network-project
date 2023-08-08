import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required 
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, render,redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages

from .models import User, Post, Like, Follower


def index(request):
    all_posts = Post.objects.all().order_by('-created_at')
    return render(request, "network/index.html",{
        "posts":all_posts,
        "user":request.user
    })

 
@login_required
def create_new_post(request):
    posts = Post.objects.all().order_by('-created_at')
    if request.method == 'POST':
        content = request.POST['content']
        likes = 0
        creator = request.user
        new_post = Post.objects.create(content = content, likes = likes, creator = creator)
        new_post.save()
        #return render(request, "network/index.html", {"posts":posts})
        return HttpResponseRedirect(request.headers['Referer'])
    posts = Post.objects.all().order_by('-created_at')
    return JsonResponse([post.serialize() for post in posts], safe=False)


#@login_required
def like_unlike(request,post_id):
    post = get_object_or_404(Post, id=post_id)
    if request.user.is_authenticated:
        if request.method == 'PUT':
            existing_like = Like.objects.filter(user=request.user, post=post).first()

            if existing_like:
                # If the user has already liked the post, unlike it
                existing_like.delete()
                post.likes -= 1
                post.save()
            else:
                # If the user has not liked the post, like it
                Like.objects.create(user=request.user, post=post)
                post.likes += 1
                post.save()

            return JsonResponse({'likes': post.likes})
        else:
            return JsonResponse({'error': 'Invalid request, request must be via PUT'}, status=400)
    else:
        return JsonResponse([{'error': 'User should be logged to be able to like the posts'}, {'likes': post.likes}], status=400)

def user_profile(request,username):
    user = get_object_or_404(User, username = username)
    posts = Post.objects.all().filter(creator = user)
    return render(request, "network/profile.html",{
        "user":user,
    })

def edit_post(request, post_id):
    try:
        post = Post.objects.get(pk = post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error":"There is no post with this id"})

    if request.method == 'PUT':
        data = json.loads(request.body)
        if data.get("content") is not None:
            post.content = data["content"]
        post.save()
        return HttpResponse(status=204)




def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
