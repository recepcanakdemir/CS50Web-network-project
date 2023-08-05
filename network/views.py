import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required 
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, render,redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Like, Follower


def index(request):
    return render(request, "network/index.html")


@csrf_exempt
def create_new_post(request):

    #creating new post must be via POST request
    if request.method != "POST":
        posts = Post.objects.all().order_by('-created_at')
        for post in posts:
            post.likes = len(Like.objects.all().filter(post = post))
            post.save()

        return JsonResponse([post.serialize() for post in posts], safe=False)


    data = json.loads(request.body)
    #get content of post
    post = Post(
        creator=request.user,
        content=data.get("content", ""),
    )
    post.save()

    return JsonResponse({"message": "Your post is published"}, status=201)


@login_required
def like_unlike(request,post_id):
    if request.method == 'PUT':
        post = get_object_or_404(Post, id=post_id)
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
