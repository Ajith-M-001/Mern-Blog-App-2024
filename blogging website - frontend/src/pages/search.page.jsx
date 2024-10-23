import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InpageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NodataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import FilterPaginationData from "../common/filter-pagination-data";
import axios from "axios";
import BlogPostCard from "../components/blog-post.component";
import UserCard from "../components/usercard.component";

const SearchPage = () => {
  const { query } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

  const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/blog/search-blogs`, {
        // tag: pageState,
        page,
        query,
      });

      const formatedData = await FilterPaginationData({
        state: blogs,
        data: data,
        page,
        countRoute: "search-blogs-count",
        data_to_send: { query },
        create_new_arr,
      });


      setBlogs((prevBlogs) => {
        if (formatedData?.results) {
          // Ensure that `page` is properly initialized before incrementing
          const currentPage = prevBlogs.page || 1; // If `prevBlogs.page` is undefined, default to 1
          return {
            ...formatedData,
            results: [...(prevBlogs.results || []), ...formatedData.results],
            page: currentPage + 1, // Increment the page by 1
          };
        }
        return prevBlogs;
      });
    } catch (error) {
      console.error("Error fetching blogs by category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/blog/search-users`, {
        query,
      });
      setUsers(data);
      setIsLoading(false);
    } catch (error) {
      console.log("error", error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs([]);
    setUsers([]);
  };


  const UserCardWrapper = () => {
    return (
      <>
        {isLoading ? (
          <Loader />
        ) : users && users.length > 0 ? (
          <>
            {users.map((user, index) => (
              <AnimationWrapper
                key={index}
                transition={{ duration: 1, delay: index * 0.08 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            ))}
          </>
        ) : (
          <NodataMessage message={"no user found"} />
        )}
      </>
    );
  };

  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InpageNavigation
          routes={[`Search Results from "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {isLoading ? (
              <Loader />
            ) : blogs?.results?.length ? (
              blogs.results.map((blog, i) => (
                <AnimationWrapper
                  transition={{ duration: 1, delay: i * 0.1 }}
                  key={i}
                >
                  <BlogPostCard content={blog} />
                </AnimationWrapper>
              ))
            ) : (
              <NodataMessage message={"No Post published"} />
            )}
            <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
          </>

          <UserCardWrapper />
        </InpageNavigation>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min  border-l border-grey pl-8 pt-3 max-md:hidden">
        <h1 className="font-medium text-xl mb-8 mt-1">
          {" "}
          user related to search <i className="fi fi-rr-user"></i>
        </h1>
        <UserCardWrapper />
      </div>
    </section>
  );
};

export default SearchPage;
