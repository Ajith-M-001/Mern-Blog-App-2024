import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import FilterPaginationData from "../common/filter-pagination-data";
import InpageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import NodataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import PageNotFound from "./404.page";

export const profileStructure = {
  personal_info: {
    fullname: "",
    email: "",
    username: "",
    bio: "",
    profile_img: "",
  },
  social_links: {},
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  joinedAt: "",
  _id: "",
};

const UserProfilePage = () => {
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState(profileStructure);
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const [isLoading, setIsLoading] = useState(false);
  const [blogs, setBlogs] = useState([]);

  const { userAuth } = useContext(UserContext);
  const username = userAuth?.user.username;

  const {
    personal_info: {
      fullname,
      email,
      username: profile_username,
      bio,
      profile_img,
    },
    social_links,
    account_info: { total_posts, total_reads },
    joinedAt,
  } = profile;

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/blog/get-user`, {
        username: profileId,
      });
      setProfile(data);
      getBlogs({ user_id: data._id });
      setIsLoading(false);
    } catch (error) {
      console.log("error", error.message);
      setIsLoading(false);
    }
  };

  const getBlogs = async ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? profile._id : user_id;
    try {
      const { data } = await axios.post(`${baseURL}/blog/search-blogs`, {
        author: user_id,
        page,
      });

      const formatedData = await FilterPaginationData({
        state: blogs,
        data: data,
        page,
        countRoute: "/search-blogs-count",
        data_to_send: { author: user_id },
      });
      formatedData.user_id = user_id;
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
      console.log("error", error.message);
    }
  };

  useEffect(() => {
    resetState();
    fetchUserProfile();
  }, [profileId]);

  const resetState = () => {
    setIsLoading(false);
    setProfile(profileStructure);
    setBlogs([]);
  };

  return (
    <AnimationWrapper>
      {isLoading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              alt="profilepic"
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
            />
            <h1 className="text-2xl font-medium ">@{profile_username}</h1>
            <p className="text-xl capitalize h-6">{fullname}</p>

            <p>
              {total_posts.toLocaleString()} Blogs -{" "}
              {total_reads.toLocaleString()} Reads
            </p>

            <div className="flex gap-4 mt-2">
              {profileId === username && (
                <Link
                  to={"/setting/edit-profile"}
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            <AboutUser
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
              className="max-md:hidden"
            />
          </div>

          <div className="max-md:mt-12 w-full ">
            <InpageNavigation
              routes={["Blogs published", "About"]}
              defaultHidden={["About"]}
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
                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
              </div>

              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InpageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default UserProfilePage;
