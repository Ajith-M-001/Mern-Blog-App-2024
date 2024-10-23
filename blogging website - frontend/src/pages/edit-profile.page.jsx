// import React, { useContext, useEffect, useRef, useState } from "react";
// import { UserContext } from "../App";
// import axios from "axios";
// import { profileStructure } from "./profile.page";
// import AnimationWrapper from "../common/page-animation";
// import Loader from "../components/loader.component";
// import toast, { Toaster } from "react-hot-toast";
// import InputBox from "../components/input.component";
// import { storage } from "../common/firebase";
// import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// const EditProfile = () => {
//   const { userAuth } = useContext(UserContext);
//   const access_token = userAuth?.access_token;
//   const { username } = userAuth?.user;
//   const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
//   const [profile, setProfile] = useState(profileStructure);
//   const [isLoading, setIsLoading] = useState(false);
//   const bioLimit = 150;
//   const [characterLeft, setCharacterLeft] = useState(bioLimit);
//   const profileImgEle = useRef();
//   const [updatedProfileImg, setUpdateProfileImg] = useState(null);
//   const [updatedProfileImgf, setUpdateProfileImgf] = useState(null);

//   const { personal_info, social_links } = profile;
//   const {
//     bio,
//     email,
//     fullname,
//     profile_img,
//     username: profile_username,
//   } = personal_info;

//   useEffect(() => {
//     if (access_token) {
//       setIsLoading(true);
//       axios
//         .post(`${baseURL}/blog/get-user`, {
//           username,
//         })
//         .then(({ data }) => {
//           setIsLoading(false);
//           setProfile(data);
//         })
//         .catch((err) => {
//           setIsLoading(false);
//           console.log(err.message);
//         });
//     }
//   }, [access_token]);

//   const handleChangeFucntion = (e) => {
//     setCharacterLeft(bioLimit - e.target.value.length);
//   };

//   const handleImagePreview = (e) => {
//     const file = e.target.files[0];
//     profileImgEle.current.src = URL.createObjectURL(file);
//     setUpdateProfileImg(file);
//   };

//   const handleImageUpload = (e) => {
//     e.preventDefault();
//     if (updatedProfileImg) {
//       e.target.setAttribute("disabled", true);
//       const uniqueFileName = new Date().getTime() + updatedProfileImg.name;
//       console.log(uniqueFileName);
//       const storageRef = ref(storage, `files/${uniqueFileName}`);
//       const uploadTask = uploadBytesResumable(storageRef, updatedProfileImg);
//       const loadingToast = toast.loading(`Uploading... ${progresspercent}`);
//       uploadTask.on(
//         "state_changed",
//         (snapshot) => {
//           // Progress updates
//           const progress = Math.round(
//             (snapshot.bytesTransferred / snapshot.totalBytes) * 100
//           );
//           setProgresspercent(progress);
//         },
//         (error) => {
//           toast.error("Upload failed! Please try again.", { id: loadingToast });
//           console.error("File upload error:", error);
//         },
//         () => {
//           // File uploaded successfully, get the download URL
//           getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//             setUpdateProfileImgf({ downloadURL });
//             toast.success("Upload successful!", { id: loadingToast });
//           });
//         }
//       );
//     }
//   };

//   console.log(updatedProfileImgf);

//   return (
//     <AnimationWrapper>
//       {isLoading ? (
//         <Loader />
//       ) : (
//         <form>
//           <Toaster />
//           <h1 className="max-md:hidden">Edit Profile</h1>
//           <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
//             <div className="max-lg:center mb-5">
//               <label
//                 className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
//                 htmlFor="uploadImg"
//                 id="profileImgLabel"
//               >
//                 <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/50 opacity-0 hover:opacity-100 cursor-pointer">
//                   Upload Image
//                 </div>
//                 <img ref={profileImgEle} src={profile_img} alt="profile pic" />
//               </label>
//               <input
//                 hidden
//                 type="file"
//                 id="uploadImg"
//                 accept="jpeg, .png, .jpg"
//                 onChange={handleImagePreview}
//               />
//               <button
//                 onClick={handleImageUpload}
//                 className="btn-light mt-5 max-lg:center lg:w-full px-10"
//               >
//                 Upload
//               </button>
//             </div>
//             <div className="w-full">
//               <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
//                 <div>
//                   <InputBox
//                     name="username"
//                     type="text"
//                     value={profile_username}
//                     placeholder="User Name"
//                     disable={true}
//                     icon="fi-rr-at"
//                   />
//                 </div>
//                 <div>
//                   <InputBox
//                     name="email"
//                     type="email"
//                     value={email}
//                     placeholder="Email"
//                     disable={true}
//                     icon="fi-rr-envelope"
//                   />
//                 </div>
//               </div>
//               <InputBox
//                 name="fullname"
//                 type="text"
//                 value={fullname}
//                 placeholder="Full Name"
//                 icon="fi-rr-user"
//               />
//               <textarea
//                 name="bio"
//                 maxLength={bioLimit}
//                 defaultValue={bio}
//                 className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
//                 placeholder="Bio"
//                 onChange={handleChangeFucntion}
//               ></textarea>
//               <p className="mt-1 text-dark-grey px-30">
//                 {characterLeft} character left
//               </p>

//               <p className="my-6 text-dark-grey">
//                 Add Your social Handle below
//               </p>

//               <div className="md:grid md:grid-cols-2 gap-x-6 ">
//                 {Object.keys(social_links).map((key, i) => {
//                   let link = social_links[key];

//                   return (
//                     <InputBox
//                       key={i}
//                       name={key}
//                       type="text"
//                       value={link}
//                       placeholder="https://"
//                       icon={`fi ${
//                         key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"
//                       }`}
//                     />
//                   );
//                 })}
//               </div>
//               <button className="btn-dark w-auto px-10" type="submit">
//                 Update
//               </button>
//             </div>
//           </div>
//         </form>
//       )}
//     </AnimationWrapper>
//   );
// };

// export default EditProfile;

import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { storage } from "../common/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const { username } = userAuth?.user;
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const [profile, setProfile] = useState(profileStructure);
  const [isLoading, setIsLoading] = useState(false);
  const bioLimit = 150;
  const [characterLeft, setCharacterLeft] = useState(bioLimit);
  const profileImgEle = useRef();
  const editProfileRef = useRef();
  const [updatedProfileImg, setUpdateProfileImg] = useState(null);
  const [updatedProfileImgf, setUpdateProfileImgf] = useState(null);
  const [progresspercent, setProgresspercent] = useState(0);
  const [isUploading, setIsUploading] = useState(false); // Track upload status

  const { personal_info, social_links } = profile;
  const {
    bio,
    email,
    fullname,
    profile_img,
    username: profile_username,
  } = personal_info;

  useEffect(() => {
    if (access_token) {
      setIsLoading(true);
      axios
        .post(`${baseURL}/blog/get-user`, {
          username,
        })
        .then(({ data }) => {
          setIsLoading(false);
          setProfile(data);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err.message);
        });
    }
  }, [access_token]);

  const handleChangeFunction = (e) => {
    setCharacterLeft(bioLimit - e.target.value.length);
  };

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      profileImgEle.current.src = URL.createObjectURL(file);
      setUpdateProfileImg(file);
    }
  };

  useEffect(() => {
    return () => {
      if (profileImgEle.current?.src) {
        URL.revokeObjectURL(profileImgEle.current.src); // Cleanup preview URL
      }
    };
  }, []);

  const handleImageUpload = (e) => {
    e.preventDefault();

    if (updatedProfileImg) {
      setIsUploading(true);
      const uniqueFileName = new Date().getTime() + updatedProfileImg.name;
      const storageRef = ref(storage, `files/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, updatedProfileImg);

      const loadingToast = toast.loading("Uploading...");

      // Handle Firebase upload progress and completion
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgresspercent(progress);
        },
        (error) => {
          toast.error("Upload failed! Please try again.", { id: loadingToast });
          setIsUploading(false);
          console.error("File upload error:", error);
        },
        () => {
          // Get download URL after successful upload
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setUpdateProfileImgf(downloadURL); // Update state with image URL
            toast.success("Upload successful!", { id: loadingToast });
            setIsUploading(false); // Re-enable button
            // API call to save the URL to MongoDB after getting the download URL
            axios
              .post(
                `${baseURL}/blog/update-profile-img`,
                { url: downloadURL }, // Use the resolved URL here
                {
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                  },
                }
              )
              .then(({ data }) => {
                let newUserAuth = {
                  user: {
                    ...userAuth.user, // Keep existing user details
                    profile_img: data.profile_img, // Update with the new profile image
                  },
                  access_token: userAuth.access_token, // Keep the same access token
                  message: "Profile image updated successfully!",
                };

                // Store updated user data in the session
                storeInSession("user", JSON.stringify(newUserAuth));

                // Update the state
                setUserAuth(newUserAuth);
              })
              .catch((err) => {
                toast.error("Failed to update profile image.");
                console.error("Error updating profile image:", err);
              });
          });
        }
      );
    }
  };



  return (
    <AnimationWrapper>
      {isLoading ? (
        <Loader />
      ) : (
        <form ref={editProfileRef}>
          <Toaster />
          <h1 className="max-md:hidden">Edit Profile</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
                htmlFor="uploadImg"
                id="profileImgLabel"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/50 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img ref={profileImgEle} src={profile_img} alt="profile pic" />
              </label>
              <input
                hidden
                type="file"
                id="uploadImg"
                accept=".jpeg, .png, .jpg"
                onChange={handleImagePreview}
              />
              <button
                onClick={handleImageUpload}
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                disabled={isUploading}
              >
                {isUploading ? `Uploading... ${progresspercent}%` : "Upload"}
              </button>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="username"
                    type="text"
                    value={profile_username}
                    placeholder="User Name"
                    disable={true}
                    icon="fi-rr-at"
                  />
                </div>
                <div>
                  <InputBox
                    name="email"
                    type="email"
                    value={email}
                    placeholder="Email"
                    disable={true}
                    icon="fi-rr-envelope"
                  />
                </div>
              </div>
              <InputBox
                name="fullname"
                type="text"
                value={fullname}
                placeholder="Full Name"
                icon="fi-rr-user"
              />
              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="Bio"
                onChange={handleChangeFunction}
              ></textarea>
              <p className="mt-1 text-dark-grey px-30">
                {characterLeft} characters left
              </p>

              <p className="my-6 text-dark-grey">
                Add Your Social Handles Below
              </p>

              <div className="md:grid md:grid-cols-2 gap-x-6 ">
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={`fi ${
                        key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"
                      }`}
                    />
                  );
                })}
              </div>
              <button
                onClick={handleSubmit}
                className="btn-dark w-auto px-10"
                type="submit"
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
