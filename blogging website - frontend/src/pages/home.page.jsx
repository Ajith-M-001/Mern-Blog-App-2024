import React, { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InpageNavigation, {
  activeTabRef,
} from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NodataMessage from "../components/nodata.component";
import FilterPaginationData from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const [blogs, setBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [pageState, setPageState] = useState("home");
  const [isLoading, setIsLoading] = useState(false);


  const categories = [
    "programming",
    "hollywood",
    "marvel",
    "dc",
    "joker",
    "netflix",
    "avatar: the last airbender",
  ];

  const fetchLatestBlogs = async ({ page = 1 }) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/blog/latest-blogs`, {
        page,
      });

      const formatedData = await FilterPaginationData({
        state: blogs,
        data: data,
        page,
        countRoute: "blog/all-latest-blogs-count",
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
      console.error("Error fetching latest blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlogByCategory = async ({ page = 1 }) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/blog/search-blogs`, {
        tag: pageState,
        page,
      });

      const formatedData = await FilterPaginationData({
        state: blogs,
        data: data,
        page,
        countRoute: "blog/search-blogs-count",
        data_to_send: { tag: pageState },
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

  const fetchTrendingBlogs = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${baseURL}/blog/trending-blogs`);
      setTrendingBlogs(data);
    } catch (error) {
      console.error("Error fetching trending blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlogs([]);

    setPageState((prevPageState) =>
      prevPageState === category ? "home" : category
    );
  };

  useEffect(() => {
    activeTabRef.current.click();
    if (pageState === "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogByCategory({ page: 1 });
    }
  }, [pageState]);

  useEffect(() => {
    fetchTrendingBlogs();
  }, []);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* Latest blogs */}
        <div className="w-full">
          <InpageNavigation
            routes={[pageState, "trending blog"]}
            defaultHidden={["trending blog"]}
          >
            <div>
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
              <LoadMoreDataBtn
                state={blogs}
                fetchDataFun={
                  pageState === "home" ? fetchLatestBlogs : fetchBlogByCategory
                }
              />
            </div>

            {isLoading ? (
              <Loader />
            ) : (
              trendingBlogs.map((blog, i) => (
                <AnimationWrapper
                  transition={{ duration: 1, delay: i * 0.1 }}
                  key={i}
                >
                  <MinimalBlogPost content={blog} i={i} />
                </AnimationWrapper>
              ))
            )}
          </InpageNavigation>
        </div>

        {/* Filters and trending blogs */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium">Stories from all interests</h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => (
                  <button
                    onClick={loadBlogByCategory}
                    className={`tag ${
                      pageState === category.toLowerCase()
                        ? "bg-black text-white"
                        : ""
                    }`}
                    key={i}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              {isLoading ? (
                <Loader />
              ) : (
                trendingBlogs.map((blog, i) => (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost content={blog} i={i} />
                  </AnimationWrapper>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
