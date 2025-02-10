import React, { useState } from "react";
import "./forum.css";

export default function Forum() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPost, setNewPost] = useState({
    username: "",
    content: "",
    category: "Misc",
  });
  const [filterCategory, setFilterCategory] = useState("All");
  const [expandedPost, setExpandedPost] = useState(null);

  const addPost = () => {
    if (newPost.username.trim() === "" || newPost.content.trim() === "")
      return;
    const post = {
      id: Date.now(),
      username: newPost.username,
      content: newPost.content,
      category: newPost.category,
      answers: [],
    };
    setPosts([post, ...posts]);
    setNewPost({ username: "", content: "", category: "Misc" });
  };

  const addAnswer = (postId, answer) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, answers: [...post.answers, { text: answer }] }
          : post
      )
    );
  };

  const filteredPosts =
    filterCategory === "All"
      ? posts
      : posts.filter((post) => post.category === filterCategory);

  return (
    <div className="forum-container">
      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Maths">Maths</option>
          <option value="Science">Science</option>
          <option value="Computers">Computers</option>
          <option value="Misc">Misc</option>
        </select>
      </div>
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Center Content */}
      <div className="center-content">
        <div className="content-wrapper">
          {/* Create Post */}
          <div className="create-post">
            <h3>Create Post</h3>
            <input
              type="text"
              placeholder="Enter your username..."
              value={newPost.username}
              onChange={(e) =>
                setNewPost({ ...newPost, username: e.target.value })
              }
            />
            <textarea
              placeholder="Write your question or comment..."
              value={newPost.content}
              onChange={(e) =>
                setNewPost({ ...newPost, content: e.target.value })
              }
            />
            <div className="drop">
            <select
              value={newPost.category}
              onChange={(e) =>
                setNewPost({ ...newPost, category: e.target.value })
              }
            >
              <option value="Maths">Maths</option>
              <option value="Science">Science</option>
              <option value="Computers">Computers</option>
              <option value="Misc">Misc</option>
            </select>
            </div>
            <br/>
            <button onClick={addPost}>Post</button>
          </div>
          {/* Posts */}
          <div>
            {filteredPosts.length > 0 ? (
              filteredPosts
                .filter(
                  (post) =>
                    post.content
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    post.username
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((post) => (
                  <div className="post" key={post.id}>
                    <h4
                      onClick={() =>
                        setExpandedPost(
                          expandedPost === post.id ? null : post.id
                        )
                      }
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "blue",
                      }}
                    >
                      {post.content}{" "}
                      <span style={{ fontSize: "14px", color: "#888" }}>
                        (Posted by: {post.username})
                      </span>
                    </h4>
                    <p>
                      <strong>Category:</strong> {post.category}
                    </p>
                    {/* Answers */}
                    {expandedPost === post.id && (
                      <div>
                        {post.answers.length > 0 ? (
                          <div className="answers">
                            <h5>Answers:</h5>
                            {post.answers.map((answer, index) => (
                              <p key={index}>{answer.text}</p>
                            ))}
                          </div>
                        ) : (
                          <p>No answers yet.</p>
                        )}
                        {/* Answer Input */}
                        <div className="answer-input">
                          <textarea
                            placeholder="Write your answer..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                addAnswer(post.id, e.target.value);
                                e.target.value = "";
                                setExpandedPost(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <p style={{ textAlign: "center" }}>No posts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
