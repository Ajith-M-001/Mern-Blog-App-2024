import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import FilterPaginationData from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import InpageNavigation from "../components/inpage-navigation.component";
import AnimationWrapper from "../common/page-animation";
import {
  ManageDraftsBlogCard,
  ManagePublishedBlogCard,
} from "../components/manage-blogcard.component";

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState("");
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;

  const getBlogs = ({ page, draft, deleteDocCount = 0 }) => {
    axios
      .post(
        `${baseURL}/blog/user-written-blogs`,
        {
          page,
          draft,
          query,
          deleteDocCount,
        },
        {
          headers: {
            authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        const formattedData = await FilterPaginationData({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: access_token,
          countRoute: "/blog/user-written-blogs-count",
          data_to_send: { draft, query },
        });

        if (draft) {
          setDrafts(formattedData);
        } else {
          setBlogs(formattedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Fetch blogs and drafts when the component mounts and access_token is available
  useEffect(() => {
    if (access_token) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [access_token, drafts, blogs]);

  // Fetch new blogs and drafts when the query changes
  useEffect(() => {
    if (access_token && query.length > 0) {
      getBlogs({ page: 1, draft: false });
      getBlogs({ page: 1, draft: true });
    }
  }, [query]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setBlogs(null); // Reset blogs before searching
      setDrafts(null); // Reset drafts before searching
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value); // Update query as the user types
  };

  return (
    <>
      <h1 className="max-md:hidden">Manage Blogs</h1>
      <Toaster />

      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="Search Blogs"
          value={query}
          onChange={handleChange} // Handle typing
          onKeyDown={handleSearch} // Trigger search on "Enter"
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
      </div>

      <InpageNavigation routes={["Published Blogs", "Drafts"]}>
        {blogs?.results && blogs?.results.length > 0 ? (
          <>
            {blogs.results.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: 1 * 0.04 }}>
                  <ManagePublishedBlogCard
                    blog={{ ...blog, index: i, setStateFun: setBlogs }}
                  />
                </AnimationWrapper>
              );
            })}
          </>
        ) : (
          <h1>No published blogs available.</h1>
        )}

        {drafts?.results && drafts?.results.length > 0 ? (
          <>
            {drafts.results.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: 1 * 0.04 }}>
                  <ManageDraftsBlogCard
                    blog={{ ...blog, index: i , setStateFun: setDrafts }}
                  />
                </AnimationWrapper>
              );
            })}
          </>
        ) : (
          <h1>No Drafts available.</h1>
        )}
      </InpageNavigation>
    </>
  );
};

export default ManageBlogs;
