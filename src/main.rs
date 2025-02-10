use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Clone)]
struct Post {
    title: String,
    content: String,
    comments: Vec<Comment>,
}

#[derive(Serialize, Deserialize, Clone)]
struct Comment {
    text: String,
}

struct AppState {
    posts: Mutex<Vec<Post>>, // Stores multiple posts
}

// Fetch all posts
async fn get_posts(data: web::Data<AppState>) -> impl Responder {
    let posts = data.posts.lock().unwrap();
    HttpResponse::Ok().json(&*posts)
}

// Fetch a single post
async fn get_post(data: web::Data<AppState>, index: web::Path<usize>) -> impl Responder {
    let posts = data.posts.lock().unwrap();
    if let Some(post) = posts.get(*index) {
        HttpResponse::Ok().json(post)
    } else {
        HttpResponse::NotFound().finish()
    }
}

// Add a new comment
async fn add_comment(
    data: web::Data<AppState>,
    payload: web::Json<(usize, Comment)>,
) -> impl Responder {
    let mut posts = data.posts.lock().unwrap();
    let (index, new_comment) = payload.into_inner();

    if let Some(post) = posts.get_mut(index) {
        post.comments.push(new_comment);
        HttpResponse::Ok().json(post)
    } else {
        HttpResponse::NotFound().finish()
    }
}

// Add a new post
async fn add_post(data: web::Data<AppState>, new_post: web::Json<Post>) -> impl Responder {
    let mut posts = data.posts.lock().unwrap();
    posts.insert(0, new_post.into_inner()); // Insert at the beginning (newest first)
    HttpResponse::Ok().json(&*posts)
}

// Serve the HTML frontend
async fn index() -> impl Responder {
    HttpResponse::Ok().content_type("text/html").body(
        r#"
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reddit-Like App</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #1a1a1b;
                    color: white;
                    display: flex;
                }
                .sidebar {
                    width: 300px;
                    background: #242526;
                    padding: 15px;
                    overflow-y: auto;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                .top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .top-bar h2 {
                    font-size: 20px;
                    margin: 0;
                }
                .add-post-button {
                    background-color: #d63031;
                    color: white;
                    border: none;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 5px;
                    font-size: 14px;
                }
                .add-post-button:hover {
                    background-color: #b71c1c;
                }
                .post-list {
                    list-style: none;
                    padding: 0;
                }
                .post-box-sidebar {
                    background: #3a3b3c;
                    padding: 10px;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    border-left: 5px solid #d63031;
                }
                .post-box-sidebar:hover {
                    background: #4a4b4c;
                }
                .container {
                    flex: 1;
                    padding: 20px;
                }
                .post-box {
                    background: #d63031;
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }
                .post-title {
                    font-size: 32px;
                    font-weight: bold;
                }
                .post-content {
                    font-size: 18px;
                    margin-top: 10px;
                }
                .comments-box {
                    background: white;
                    padding: 15px;
                    border-radius: 10px;
                    text-align: left;
                    color: black;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .comment {
                    font-size: 16px;
                    padding: 10px;
                    margin-bottom: 5px;
                    background: #f4f4f4;
                    border-radius: 5px;
                    border-left: 5px solid #d63031;
                }
                .bottom-section {
                    display: flex;
                    align-items: center;
                    margin-top: 10px;
                }
                .comment-input {
                    display: flex;
                    align-items: center;
                    background: #333;
                    padding: 10px;
                    border-radius: 5px;
                    flex: 1;
                }
                .comment-input input {
                    flex: 1;
                    padding: 8px;
                    border-radius: 5px;
                    border: none;
                    background: #444;
                    color: white;
                }
                .comment-input button {
                    background-color: #d63031;
                    color: white;
                    border: none;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 5px;
                    margin-left: 10px;
                }
            </style>
        </head>
        <body>
            <div class="sidebar">
                <div class="top-bar">
                    <h2>Posts</h2>
                    <button class="add-post-button" onclick="createPost()">New Post</button>
                </div>
                <ul id="postList" class="post-list"></ul>
            </div>

            <div class="container">
                <div class="post-box">
                    <div class="post-title" id="postTitle">Loading...</div>
                    <div class="post-content" id="postContent">Loading...</div>
                </div>

                <h2>Comments</h2>
                <div class="comments-box" id="comments">Loading...</div>

                <div class="bottom-section">
                    <div class="comment-input">
                        <input type="text" id="commentText" placeholder="Add a comment...">
                        <button onclick="addComment()">Submit</button>
                    </div>
                </div>
            </div>

            <script>
                let currentPostIndex = 0;

                async function fetchPosts() {
                    let response = await fetch('/posts');
                    let data = await response.json();

                    let postListHTML = data.map((post, index) => 
                        `<li class="post-box-sidebar" onclick="fetchPost(${index})">
                            <strong>${post.title}</strong>
                        </li>`
                    ).join('');
                    document.getElementById('postList').innerHTML = postListHTML;

                    if (data.length > 0) {
                        fetchPost(0);
                    }
                }

                async function fetchPost(index) {
                    let response = await fetch('/post/' + index);
                    let data = await response.json();

                    currentPostIndex = index;
                    document.getElementById('postTitle').innerText = data.title;
                    document.getElementById('postContent').innerText = data.content;
                }

                async function createPost() {
                    let title = prompt("Enter post title:");
                    let content = prompt("Enter post content:");

                    if (!title || !content) return;

                    await fetch('/post', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title, content, comments: [] })
                    });

                    fetchPosts();
                }

                window.onload = fetchPosts;
            </script>
        </body>
        </html>
        "#,
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let data = web::Data::new(AppState {
        posts: Mutex::new(Vec::new()),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(data.clone())
            .route("/", web::get().to(index))
            .route("/posts", web::get().to(get_posts))
            .route("/post/{index}", web::get().to(get_post))
            .route("/post/comment", web::post().to(add_comment))
            .route("/post", web::post().to(add_post))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
