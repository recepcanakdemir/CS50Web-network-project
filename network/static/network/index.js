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
  e.preventDefault()

  if(e.target.classList.contains('like-button')){
    const post = e.target.closest('.post');
    likePost(post);
  }
  else if(e.target.classList.contains('edit-button')){
    const post = e.target.closest('.post');
    displayEditView(post)
  }
  else if(e.target.classList.contains('save-button')){
    const post = e.target.closest('.post');
    newContext =  saveTheChanges(post)
    updatePostContent(post, newContext)
    hideEditView(post)
  }else{
    return
  }
}

function displayError(error){
  error.className = 'd-block'
        setTimeout(() => {
          error.className = 'd-none'
        }, 2000);
}

function hideEditView(post){
    post.childNodes[1].className = 'd-none'
    post.childNodes[3].className = 'd-block'
}
function saveTheChanges(post){
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
    return newContext
}

function updatePostContent(post, newContext){
  post.childNodes[3].childNodes[3].innerHTML = newContext
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
    edit_views.childNodes[1].childNodes[1].value = post_content_views.childNodes[3].innerHTML
    
}
function likePost(post){
    const postID = post.getAttribute('id');
    console.log(postID)
    try{
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
        console.log('Fetch error:', error);
        const likeError = document.querySelector('#like-error');
        displayError(likeError);
      });
    }catch(error){
      console.log(error)
    }
}
function init(){
  const textArea =  document.querySelector('#text-area');
  const likeBtn = document.querySelector('#all-posts');
  if(textArea){
    textArea.addEventListener('keyup', getTextAreaValue)
  }
  if(likeBtn){
    likeBtn.addEventListener('click', updateData);
  }
}

document.addEventListener('DOMContentLoaded', init)
