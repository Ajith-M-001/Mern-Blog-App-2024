// import React, { useContext, useEffect } from "react";
// import { BlogContext } from "../pages/blog.page";
// import { Link } from "react-router-dom";
// import { UserContext } from "../App";
// import { Toaster, toast } from "react-hot-toast";
// import axios from "axios";

// const BlogIntraction = () => {
//   const {
//     blog: {
//       _id,
//       blog_id,
//       activity: { total_likes, total_comments, total_reads },
//       author: {
//         personal_info: { username: author_username },
//       },
//     },
//     blog,
//     setBlog,
//     isLikedByUser,
//     setIsLikedByUser,
//   } = useContext(BlogContext);
//   const { userAuth } = useContext(UserContext);
//   const username = userAuth?.user?.username;
//   const access_token = userAuth?.access_token;
//   const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

//   console.log(access_token);

//   useEffect(() => {
//     const checkIfBlogIsLiked = async () => {
//       if (access_token) {
//         try {
//           const { data } = await axios.post(
//             `${baseURL}/blog/isLiked-by-blog`,
//             {
//               _id,
//             },
//             {
//               headers: {
//                 Authorization: `Bearer ${access_token}`,
//               },
//             }
//           );
//           console.log(data);
//           setIsLikedByUser(Boolean(data.isLiked));
//         } catch (error) {
//           console.log("error", error.message);
//         }
//       }
//     };

//     checkIfBlogIsLiked();
//   }, [access_token, _id]);

//   const handleLike = () => {
//     if (access_token) {
//       const updatedLikes = !isLikedByUser ? total_likes + 1 : total_likes - 1;

//       // Optimistically update the state
//       setIsLikedByUser(!isLikedByUser);
//       setBlog({
//         ...blog,
//         activity: {
//           ...blog.activity,
//           total_likes: updatedLikes,
//         },
//       });

//       try {
//         const { data } = axios.post(
//           `${baseURL}/blog/like-blog`,
//           {
//             _id,
//             isLikedByUser,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${access_token}`,
//             },
//           }
//         );
//         setIsLikedByUser(data);
//         console.log(data);
//       } catch (error) {
//         console.log("error", error.message);
//       }
//     } else {
//       toast.error("please login to like this blog");
//     }
//   };

//   console.log(isLikedByUser);

//   return (
//     <>
//       <Toaster />
//       <hr className="border-grey my-2" />
//       <div className="gap-6 flex justify-between">
//         <div className="flex gap-3 items-center ">
//           <button
//             onClick={handleLike}
//             className={`w-10 h-10 rounded-full flex items-center justify-center ${
//               isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80"
//             }`}
//           >
//             <i
//               className={`fi  ${isLikedByUser ? "fi-sr-heart" : "fi-rs-heart"}`}
//             ></i>
//           </button>
//           <p className="text-xl text-dark-grey">{total_likes}</p>
//           <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
//             <i className="fi fi-rr-comment-dots"></i>
//           </button>
//           <p className="text-xl text-dark-grey">{total_comments}</p>
//         </div>

//         <div className="flex gap-6 items-center">
//           {username === author_username && (
//             <Link
//               to={`/editor/${blog_id}`}
//               className="underline hover:text-purple"
//             >
//               Edit
//             </Link>
//           )}
//           <Link
//             to={`https://twitter.com/intent/tweet?text=Check out this blog!&url=${window.location.href}`}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <i className="fi fi-brands-twitter hover:text-twitter"></i>
//           </Link>
//         </div>
//       </div>
//       <hr className="border-grey my-2" />
//     </>
//   );
// };

// export default BlogIntraction;

import React, { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogIntraction = () => {
  const {
    blog: {
      _id,
      blog_id,
      activity: { total_likes, total_comments, total_reads },
      author: {
        personal_info: { username: author_username },
      },
    },
    blog,
    setBlog,
    isLikedByUser,
    setIsLikedByUser,
    setContentWrapper,
  } = useContext(BlogContext);
  const { userAuth } = useContext(UserContext);
  const username = userAuth?.user?.username;
  const access_token = userAuth?.access_token;
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

  useEffect(() => {
    const checkIfBlogIsLiked = async () => {
      if (access_token) {
        try {
          const { data } = await axios.post(
            `${baseURL}/blog/isLiked-by-blog`,
            {
              _id,
            },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          );
          setIsLikedByUser(Boolean(data.isLiked));
        } catch (error) {
          console.log("error", error.message);
        }
      }
    };

    checkIfBlogIsLiked();
  }, [access_token, _id]);

  const handleLike = async () => {
    if (access_token) {
      const updatedLikes = !isLikedByUser ? total_likes + 1 : total_likes - 1;

      // Optimistically update the state
      setIsLikedByUser(!isLikedByUser);
      setBlog({
        ...blog,
        activity: {
          ...blog.activity,
          total_likes: updatedLikes,
        },
      });

      try {
        const { data } = await axios.post(
          `${baseURL}/blog/like-blog`,
          {
            _id,
            isLikedByUser,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        setIsLikedByUser(data.isLikedByUser);
      } catch (error) {
        console.log("error", error.message);
      }
    } else {
      toast.error("Please login to like this blog");
    }
  };

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />
      <div className="gap-6 flex justify-between">
        <div className="flex gap-3 items-center ">
          <button
            onClick={handleLike}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80"
            }`}
          >
            <i
              className={`fi ${isLikedByUser ? "fi-sr-heart" : "fi-rs-heart"}`}
            ></i>
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>
          <button
            onClick={() => setContentWrapper((preValue) => !preValue)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
          >
            <i className="fi fi-rr-comment-dots"></i>
          </button>
          <p className="text-xl text-dark-grey">{total_comments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username && (
            <Link
              to={`/editor/${blog_id}`}
              className="underline hover:text-purple"
            >
              Edit
            </Link>
          )}
          <Link
            to={`https://twitter.com/intent/tweet?text=Check out this blog!&url=${window.location.href}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fi fi-brands-twitter hover:text-twitter"></i>
          </Link>
        </div>
      </div>
      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogIntraction;
