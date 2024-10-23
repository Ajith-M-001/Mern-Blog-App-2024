import React from "react";
import { Link } from "react-router-dom";

const BlogPostCard = ({ content }) => {
  const {
    blog_id,
    title,
    banner,
    des,
    tags,
    author,
    publishedAt,
    activity: { total_likes },
  } = content;

  return (
    <Link to={`/blog/${blog_id}`} className="flex gap-8 items-center border-b border-grey pb-5 mb-4">
      <div className="w-full">
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
        <h1 className="blog-title">{title}</h1>

        <p className="my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px] line-clamp-2">
          {des}
        </p>
        <div className="flex gap-4 mt-7">
          <span className="btn-light py-1 px-4">{tags[0]}</span>
          <span className="ml-3 flex items-center gap-2">
            <i className="fi fi-rr-heart text-xl"></i>
            {total_likes}
          </span>
        </div>
      </div>
      <div className="h-28 aspect-square bg-grey">
        <img
          className="w-full h-full aspect-square object-cover"
          src={banner}
          alt={"blog banner"}
        />
      </div>
    </Link>
  );
};

export default BlogPostCard;
