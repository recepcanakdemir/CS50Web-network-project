async function getAllPosts(){
    const allPosts = await fetch('/posts').then((response) => response.json())
    console.log(allPosts);
    allPosts.forEach((post) => {
        const container = document.querySelector('#all-posts') 
        const div = document.createElement('div');
        let username = ""
        if(document.querySelector('#current-user')){
          username =  document.querySelector('#current-user').textContent.split(" ")[0];
        }
        else{
            username=""
        }
        const editBtn =  post.creator === username ?  '<a href="#" class="btn btn-success edit-button" aria-hidden="true">Edit</a>':  '<div></div>'
        div.innerHTML = `<div class="card" style="width: 18rem;">
          <div class="card-body post" id=${post.id}>
              <div id="edit-view" class="d-none">
                <form id="edit-selected-post">
                  <textarea class="m-2" id="text-area" placeholder="Your thoughts" rows="3" cols=""></textarea>
                  <input type="submit" class="btn btn-primary save-button" value="Save"/>
                </form>
              </div>
                <div id="post-content-view" class="d-block">
                  <h5 class="card-title" id="user">${post.creator}</h5>
                  <p class="card-text" id="content">${post.content}</p>
                  <p class="card-text" id="date">${post.created}</p>
                  <h4 class="card-text" id="likes">${post.likes} Likes</h5>
                  <a href="#" class="btn btn-primary like-button" aria-hidden="true">Like</a>
                  ${editBtn}
                </div>
            </div>
        </div>`
        container.appendChild(div)
    })

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

//Like posts via AJAX PUT request
function updatePost(e) {
  e.preventDefault();
  if(e.target.classList.contains('like-button')){
    // If like-button is clicked then like the post
    const post = e.target.closest('.post');
    likePost(post)
  }else if(e.target.classList.contains('edit-button')){
    // if edit button is clicked display edit textarea.
    const post = e.target.closest('.post');
    displayEditView(post)
 
  }else if(e.target.classList.contains('save-button')){
    const post = e.target.closest('.post');
    const postID = post.getAttribute('id');
    const newContext = post.childNodes[1].childNodes[1].childNodes[1].value
    console.log(newContext)
    console.log(postID)
    fetch(`posts/edit/${postID}`,{
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
    updatePostContent(post, newContext)
    hideEditView(post);
  }
  else{
    return
  }
}

function updatePostContent(post, newContext){
  post.childNodes[3].childNodes[3].innerHTML = newContext
}

function hideEditView(post){
 //console.log(post.childNodes[1].childNodes[1])
    post.childNodes[1].className = 'd-none'
    post.childNodes[3].className = 'd-block'
}
function displayEditView(post){
 // getPostById(postID)
   console.log(post.childNodes)
    // Get the second childNodes which is textarea to edit and get the fourth childNode 
    const edit_views = post.childNodes[1];
    console.log("edit views",edit_views)
    const post_content_views = post.childNodes[3]
    
    edit_views.className = 'd-block'
    post_content_views.className = 'd-none'
    console.log("this is edit-views",edit_views.childNodes[1].childNodes[1])
    edit_views.childNodes[1].childNodes[1].value = post_content_views.childNodes[3].innerHTML
    
}


function likePost(post){
    //const amountOfLikes = parseInt(post.querySelector('#likes').innerHTML.split(" ")[0]);
    const postID = post.getAttribute('id');
    fetch(`/posts/${postID}`, {
      method: 'PUT',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': getCookie('csrftoken'), // Don't forget to include the CSRF token
      },
    })
    .then(response => {
      return response.json()
    }).then(data => {
      console.log(data);
      post.querySelector('#likes').innerHTML = `${data.likes} Likes`

    })
    .catch(error => {
      // Handle fetch errors if necessary
      console.error('Fetch error:', error);
    });
}


async function getPostById(postID){
  const posts = await fetch('/posts').then(response => response.json)
  console.log(posts)
}


async function createNewPost(){
    await fetch('/posts',{
        method: 'POST',
        body: JSON.stringify({
            content:document.querySelector('#text-area').value,
        })
    })
    .then((response) => response.json())
    .then(data => console.log(data))
}

function init(){
   if(document.querySelector('#all-posts')){
      document.addEventListener('submit', createNewPost)
      document.querySelector('#all-posts').addEventListener('click',updatePost)
      getAllPosts()
   }
   else{
    console.log("hello")
   }
    //document.querySelector('#all-posts-link').addEventListener('click',getAllPosts)
    //do the things
}

document.addEventListener('DOMContentLoaded', init)
