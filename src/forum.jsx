import React, { useState } from "react";
import "./forum.css";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [newPost, setNewPost] = useState("");
  const [username, setUsername] = useState("");
  const [answers, setAnswers] = useState({});
  const [likes, setLikes] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (newPost.trim() && username.trim()) {
      const newPostObj = {
        id: Date.now(),
        username,
        content: newPost,
        subject: selectedSubject,
      };
      setPosts([...posts, newPostObj]);
      setNewPost("");
      setUsername("");
    }
  };

  const addLike = (postId) => {
    setLikes({
      ...likes,
      [postId]: (likes[postId] || 0) + 1,
    });
  };

  const handleFilterPosts = (subject) => {
    setSelectedSubject(subject);
    setSelectedPost(null);
  };

  const filteredPosts =
    selectedSubject === "All"
      ? posts
      : posts.filter((post) => post.subject === selectedSubject);

  return (
    <div className="container">
      {/* Left Navigation Bar */}
      <nav className="left-nav">
        <h3>Menu</h3>
        <ul>
          <li onClick={() => handleFilterPosts("All")}>All</li>
          <li onClick={() => handleFilterPosts("Maths")}>Maths</li>
          <li onClick={() => handleFilterPosts("Science")}>Science</li>
          <li onClick={() => handleFilterPosts("History")}>History</li>
          <li>Refresh</li>
        </ul>
        <form onSubmit={handlePostSubmit} className="create-post-form">
          <h4>Create Post</h4>
          <input
            type="text"
            className="forum-input"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <textarea
            className="forum-textarea"
            rows="3"
            placeholder="Write your question or comment..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          ></textarea>
          <button type="submit" className="forum-button">
            Create Post
          </button>
        </form>
      </nav>

      {/* Middle Section */}
      <div className="main-content">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`forum-post ${
                selectedPost?.id === post.id ? "active-post" : ""
              }`}
              onClick={() => setSelectedPost(post)}
            >
              <p>{post.content}</p>
              <p>
                <strong>Posted by:</strong> {post.username}
              </p>
              <div className="post-stats">
                <span>{(answers[post.id] || []).length} Answers</span>
                <span>{likes[post.id] || 0} Likes</span>
                <button onClick={(e) => { e.stopPropagation(); addLike(post.id); }}>Like</button>
              </div>
            </div>
          ))
        ) : (
          <p>No posts available for the selected subject.</p>
        )}
      </div>

      {/* Post Detail View */}
      <div className="post-detail">
        {selectedPost ? (
          <>
            <h2>{selectedPost.content}</h2>
            <p>
              <strong>Posted by:</strong> {selectedPost.username}
            </p>
            <div className="answers">
              <h3>Answers:</h3>
              {(answers[selectedPost.id] || []).map((answer, index) => (
                <p key={index} className="answer">
                  {answer}
                </p>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPost.trim()) {
                  setAnswers({
                    ...answers,
                    [selectedPost.id]: [
                      ...(answers[selectedPost.id] || []),
                      newPost,
                    ],
                  });
                  setNewPost("");
                }
              }}
              className="answer-form"
            >
              <textarea
                className="forum-textarea"
                rows="2"
                placeholder="Write your answer..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              ></textarea>
              <button type="submit" className="forum-button">
                Answer
              </button>
            </form>
          </>
        ) : (
          <p>Select a post to view its details and answers.</p>
        )}
      </div>
    </div>
  );
}

export default Forum;
