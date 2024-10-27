import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import axios from "axios";
const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

const BlogStats = ({ stats }) => {
  return (
    <div className="flex gap-2 max-lg:mb-6 max-xl:pb-6 border-grey max-lg:border-b">
      {Object.keys(stats).map((key, index) => {
        return !key.includes("parent") ? (
          <div
            key={index}
            className={
              "flex flex-col items-center w-full h-full justify-center p-4 px-6" +
              (index !== 0 ? " border-grey border-1" : "")
            }
          >
            <h1 className="text-xl max-lg:text-2xl mb-2">
              {stats[key].toLocaleString()}
            </h1>
            <p className="max-lg:text-dark-grey capitalize">
              {key.split("_")[1]}
            </p>
          </div>
        ) : null; // Changed from "" to null for cleaner rendering
      })}
    </div>
  );
};

export const ManagePublishedBlogCard = ({ blog }) => {
  const [showStats, setShowStats] = useState(false);
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;

  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
        <img
          className="max-md:hidden lg:hidden xl:block h-28 w-28 flex-none bg-grey object-cover"
          src={blog.banner}
          alt="banner"
        />

        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
            <Link
              className="blog-title mb-4 hover:underline"
              to={`/blog/${blog.blog_id}`}
            >
              {blog.title}
            </Link>
            <p className="line-clamp-1">Published on {blog.publishedAt}</p>

            <div className="flex gap-4 mt-3">
              <Link
                className="pr-4 py-2 underline"
                to={`/editor/${blog.blog_id}`}
              >
                Edit
              </Link>
              <button
                onClick={() => setShowStats((preVal) => !preVal)}
                className="lg:hidden pr-4 py-2 underline"
              >
                Stats
              </button>
              <button
                onClick={(e) => handleDeleteBlog(blog, access_token, e.target)}
                className="pr-4 py-2 underline text-red"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="max-lg:hidden">
          <BlogStats stats={blog.activity} />
        </div>
      </div>
      {showStats && (
        <div className="lg:hidden">
          <BlogStats stats={blog.activity} />
        </div>
      )}
    </>
  );
};

export const ManageDraftsBlogCard = ({ blog }) => {
  let { title, des, blog_id, index } = blog;
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  index++;

  return (
    <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
      <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">
        {index < 10 ? "0" + index : index}{" "}
      </h1>

      <div>
        <h1 className="blog-title mb-3">{title}</h1>
        <p className="line-clamp-2 font-gelasio">
          {des.length ? des : "No Description"}
        </p>

        <div className="flex gap-6 mt-3">
          <Link className="pr-4 py-2 underline " to={`/editor/${blog_id}`}>
            Edit
          </Link>{" "}
          <button
            onClick={(e) => handleDeleteBlog(blog, access_token, e.target)}
            className="pr-4 py-2 underline text-red"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const handleDeleteBlog = (blog, access_token, target) => {
  console.log(blog);
  console.log(access_token);
  console.log(target);

  const { index, blog_id, setStateFun } = blog;
  target.setAttribute("disabled", true);

  axios
    .post(
      `${baseURL}/blog/delete-blog`,
      { blog_id },
      { headers: { Authorization: `Bearer ${access_token}` } } // Fixed typo here
    )
    .then(({ data }) => {
      target.removeAttribute("disabled");
      console.log(data);

      // Properly updating state
      setStateFun((prevVal) => {
        const { deleteDocCount = 0, totalDocs, results } = prevVal; // Defaulting deleteDocCount to 0 if undefined
        const updatedResults = [...results]; // Make a shallow copy of results array

        // Remove the blog from results
        updatedResults.splice(index, 1);

        if (!updatedResults.length && totalDocs - 1 > 0) {
          return prevVal; // Return the previous state if there's no need to update
        }

        // Return the updated state
        return {
          ...prevVal,
          results: updatedResults,
          totalDocs: totalDocs - 1, // Decrement totalDocs count
          deleteDocCount: deleteDocCount + 1, // Increment deleteDocCount
        };
      });
    })
    .catch((err) => {
      console.log(err);
      target.removeAttribute("disabled"); // Re-enable the button in case of error
    });
};

