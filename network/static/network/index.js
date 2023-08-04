async function getAllPosts(){
    const allPosts = await fetch('/posts').then((response) => response.json());
    console.log(allPosts);
    allPosts.forEach((post) => {
        const container = document.querySelector('#all-posts');
        const div = document.createElement('div');
        div.innerHTML = `<div class="card" style="width: 18rem;">
            <div class="card-body">
            <h5 class="card-title" id="user">${post.creator} </h5>
            <p class="card-text" id="content">${post.content}</p>
            <p class="card-text" id="date">${post.created}</p>
            <h4 class="card-text" id="likes">${post.likes} Likes</h5>
            <a href="#" class="btn btn-primary" aria-hidden="true">Like</a>
        </div>`

        container.appendChild(div)
    })

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
    console.log("hell")
    getAllPosts();

    //do the things
}

document.addEventListener('DOMContentLoaded', init)
