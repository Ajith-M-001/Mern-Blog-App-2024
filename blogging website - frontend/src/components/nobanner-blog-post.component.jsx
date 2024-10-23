import React from "react";
import { Link } from "react-router-dom";

const MinimalBlogPost = ({ content, i }) => {
  const { blog_id, title, author, publishedAt, activity } = content;
  return (
    <Link to={`/blog/${blog_id}`} className="flex gap-3 mb-8">
      <h1 className="blog-index">{i < 10 ? `0${i + 1}` : i + 1}</h1>
      <div>
        <div className="flex gap-2 items-center mb-7">
          <img
            className="w-6 h-6 rounded-full "
            src={author?.personal_info?.profile_img}
            alt={author.personal_info.username}
          />
          <p className="line-clamp-1">
            {author.personal_info.fullname} @{author.personal_info.username}
          </p>
          <p className="min-w-fit">
            {new Date(publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <h1>{title}</h1>
      </div>
    </Link>
  );
};

export default MinimalBlogPost;
