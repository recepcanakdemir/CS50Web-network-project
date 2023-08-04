async function getAllPosts(){
    const allPosts = await fetch('/posts').then((response) => response.json());
    console.log(allPosts);
    allPosts.forEach((post) => {
        const container = document.querySelector('#all-posts');
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="card" style="width: 18rem;">
        <div class="card-body post" id=${post.id}>
                <h5 class="card-title" id="user">${post.creator} </h5>
                <p class="card-text" id="content">${post.content}</p>
                <p class="card-text" id="date">${post.created}</p>
                <h4 class="card-text" id="likes">${post.likes} Likes</h5>
                <a href="#" class="btn btn-primary" aria-hidden="true">Like</a>
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
function likePost(e){
    e.preventDefault();
    post =  e.target.closest('.post');
    const amountOfLikes = parseInt(post.querySelector('#likes').innerHTML.split(" ")[0]);
    console.log(amountOfLikes);
    const postID =post.getAttribute('id');
    console.log(postID);

    fetch(`/posts/${postID}`, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": getCookie("csrftoken"),  // don't forget to include the 'getCookie' function
    },
    body: JSON.stringify({
        likes: amountOfLikes + 1,
    })
    })
    .then(response => response.json())
    .then(data => {
    console.log(data);
    });
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
    document.addEventListener('submit', createNewPost)
    document.querySelector('#all-posts').addEventListener('click',likePost)
    console.log("hell")
    getAllPosts();

    //do the things
}

document.addEventListener('DOMContentLoaded', init)
