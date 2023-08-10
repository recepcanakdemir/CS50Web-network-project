import json
from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
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
    paginator = Paginator(all_posts,10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    if request.user.is_authenticated:
        likes = Like.objects.filter(user = request.user)
        liked_posts = []
        for like in likes:
            liked_posts.append(like.post)
    else:
        liked_posts = None
    return render(request, "network/index.html",{
        "posts":page_obj,
        "user":request.user,
        "liked_posts":liked_posts
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
        return JsonResponse({'likes':post.likes},status=400, safe=False)

def load_profile(request,username):
    profile_owner = User.objects.get(username = username)
    follower_user = request.user
    if follower_user.is_authenticated:
        user_not_logged_in = False
        likes = Like.objects.filter(user = follower_user)
        liked_posts = []
        for like in likes:
            liked_posts.append(like.post)
        if request.method == 'PUT':
            profile_owner = User.objects.get(username = username)
            follower_user = request.user
            try:
                user_follow_object = Follower.objects.get(followers=follower_user)
            except Follower.DoesNotExist:
                user_follow_object = None
            if user_follow_object is None:
                user_follow_object = Follower.objects.create()
                user_follow_object.followers.add(follower_user)
                user_follow_object.save()
                user_follow_object.following.remove(request.user)
                user_follow_object.save()
            
            if user_follow_object.following.contains(profile_owner):
                user_follow_object.following.remove(profile_owner)
                is_following = False
                user_follow_object.save()
            else:
                user_follow_object.following.add(profile_owner)
                is_following = True 
                user_follow_object.save()
            #live_followers_for_frontend = len(Follower.objects.get(followers = profile_owner).following.all())
            live_followers_for_frontend = len(Follower.objects.filter(following = profile_owner))
            return JsonResponse([{'followers':live_followers_for_frontend},{'is_following':is_following}],safe = False)
            #create new FollowObject for follower user
        try:
            user_follow_object = Follower.objects.get(followers=follower_user)
        except Follower.DoesNotExist:
            user_follow_object = None
        if user_follow_object is None:
            is_following = "Follow" 
        elif user_follow_object.following.contains(profile_owner):
            is_following = "Unfollow" 
        else:
            is_following = "Follow" 
    else:
        is_following = "Follow"
        liked_posts = None
        user_not_logged_in = True
    #how many followers does user have
    if Follower.objects.filter(following=profile_owner):
        followers = len(Follower.objects.filter(following=profile_owner))
    else:
        followers = 0

    #how many people user is following
    for obj in Follower.objects.all():
        if obj.followers.contains(profile_owner):
            is_user_following_someone = True 
            break
        else:   
            is_user_following_someone = False
    if is_user_following_someone:
        following = len(get_object_or_404(Follower, followers = profile_owner).following.all())
    else:
        following= 0
    posts = Post.objects.all().filter(creator = profile_owner).order_by('-created_at')
    paginator = Paginator(posts,10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    return render(request, "network/profile.html",{
       "following":following,
        "followers":followers,
        "profile_owner":username,
        "posts": page_obj,
        "visitor":follower_user,
        "is_following":is_following,
        "liked_posts":liked_posts,
        "user_not_logged_in": user_not_logged_in,
    })

def following_posts(request):
    if request.user.is_authenticated:
        if Follower.objects.filter(followers=request.user):
            following = Follower.objects.filter(followers=request.user).first().following.all()
            posts = Post.objects.all()
            followings_posts = [post for post in posts if post.creator in following]
            followings_posts.reverse()
        else:
            followings_posts = []
            following = None

        likes = Like.objects.filter(user=request.user)
        liked_posts = [like.post for like in likes]

        paginator = Paginator(followings_posts, 10)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)

        return render(request, "network/following.html", {
            "following": following,
            "posts": page_obj,
            "liked_posts": liked_posts
        })
    else:
        return JsonResponse({"error":"You should logged in to see following posts"})


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
    else:
        return HttpResponse(status=400)



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
