function getTextAreaValue(e){
  if(e.target.value == "" || e.target.value.trim().lenght ==0){
    document.querySelector('#create-post-button').setAttribute('disabled','')
  }
  else{
    document.querySelector('#create-post-button').removeAttribute('disabled')
  }
}
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function updateData(e){
  if(e.target.classList.contains('like-button')){
    e.preventDefault()
    const post = e.target.closest('.post');
    likePost(post);
  }
  else if(e.target.classList.contains('edit-button')){
    e.preventDefault()
    const post = e.target.closest('.post');
    displayEditView(post)
  }
  else if(e.target.classList.contains('save-button')){
    e.preventDefault()
    const post = e.target.closest('.post');
    newContext =  saveTheChanges(post)
    updatePostContent(post, newContext)
    hideEditView(post)
  }else if(e.target.classList.contains('user')){
    const post = e.target.closest('.post');
    displayEditView(post)
  }
  else if(e.target.classList.contains('follow-button')){
    e.preventDefault()
    const username = document.querySelector('#user_name').innerHTML
    console.log(username)
    followUnfollow(username)
  }
  else if(e.target.classList.contains('unfollow-button')){
    e.preventDefault()
  //  followUnfollow(username)
  }
  else{

    return
  }
}

async function followUnfollow(username){
    await fetch(`../users/${username}`, {
        method: 'PUT',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': getCookie('csrftoken'),         
        },
      })
      .then(response => {
        console.log(response)
        return response.json()
      }).then(data => {
        document.querySelector('#followers').innerHTML = `${data[0].followers}`
        if(data[1].is_following == false){
          document.querySelector('#follow-button').innerHTML = "Follow"
        }else{
          document.querySelector('#follow-button').innerHTML = "Unfollow"
        }
        console.log(data)
      })
}


function hideEditView(post){
    console.log("a1", post.childNodes[1])
    console.log("a2", post.childNodes[3])
    post.childNodes[1].className = 'd-none'
    post.childNodes[3].className = 'd-block'
}

function saveTheChanges(post){
  const postID = post.getAttribute('id');
    const newContext = post.childNodes[1].childNodes[1].childNodes[1].value
    console.log("newContext",newContext)
    console.log(newContext)
    console.log(postID)
    fetch(`../posts/edit/${postID}`,{
      method:'PUT',
      credentials: 'include',
        headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
      },  
      body: JSON.stringify({
        content:newContext,
      })
    })
    return newContext
}

function updatePostContent(post, newContext){
  console.log("update",)
post.childNodes[3].childNodes[3].childNodes[1].childNodes[1].childNodes[1] = newContext
}

function displayEditView(post){
   console.log(post.childNodes)
    // Get the second childNodes which is textarea to edit and get the fourth childNode 
    const edit_views = post.childNodes[1];
    console.log("edit views",edit_views)
    const post_content_views = post.childNodes[3]
    
    edit_views.className = 'd-block'
    post_content_views.className = 'd-none'
    console.log("this is edit-views",edit_views.childNodes[1].childNodes[1])
    console.log(" askjdl",)
    edit_views.childNodes[1].childNodes[1].value = post_content_views.childNodes[3].childNodes[1].childNodes[1].childNodes[1].innerHTML
    
}

async function likePost(post){
  if(document.querySelector('#current-user')){
    const postID = post.getAttribute('id');
    console.log(postID)
      await fetch(`/posts/${postID}`, {
        method: 'PUT',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': getCookie('csrftoken'),         
        },
      })
      .then(response => {
        return response.json()
      }).then(data => {
        console.log(data);
        console.log(parseInt(post.querySelector('#likes').innerHTML))
        if(post.querySelector('.like-button').classList.contains('fa-heart-o')){
          post.querySelector('.like-button').classList.contains('fa-heart-o')
          post.querySelector('.like-button').classList.remove('fa-heart-o')
          post.querySelector('.like-button').classList.add('fa-heart')
          post.querySelector('.like-button').style.color = 'red'
        }else{
          post.querySelector('.like-button').classList.contains('fa-heart')
          post.querySelector('.like-button').classList.remove('fa-heart')
          post.querySelector('.like-button').classList.add('fa-heart-o')
          post.querySelector('.like-button').style.color = 'black'
        }
        post.querySelector('#likes').innerHTML = `${data.likes}`
      })
  }else{
    console.log("he,")
    displayError(document.querySelector('#like-error'));
  }
   
}
function fakeButton(){
  displayError(document.querySelector('#follow-error'))
}
function displayError(error){
  error.className = 'd-block'
        setTimeout(() => {
          error.className = 'd-none'
        }, 2000);
}

function init(){
  const textArea =  document.querySelector('#text-area');
  const likeBtn = document.querySelector('#all-posts');
  const followBtn = document.querySelector('#follow-unfollow')
  const fakeBtn = document.querySelector('#fake-button')
  if(textArea){
    textArea.addEventListener('keyup', getTextAreaValue)
  }
  if(likeBtn){
    likeBtn.addEventListener('click', updateData);
  }if(followBtn){
    followBtn.addEventListener('click',updateData)
  }if(fakeBtn){
    fakeBtn.addEventListener('click',fakeButton)
  }

}

document.addEventListener('DOMContentLoaded', init)
