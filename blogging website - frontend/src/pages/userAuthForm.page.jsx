import React, { useContext } from "react";
import InputBox from "../components/input.component";
import googleIcons from "../imgs/google.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";


const UserAuthForm = ({ type }) => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const navigate = useNavigate()

  let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

   const baseURL = import.meta.env.VITE_SERVER_DOMAIN;

  const UserAuthThroughServer = async (serverRoute, formData) => {
    try {
      const { data } = await axios.post(
        `${baseURL}/auth/${serverRoute}`,
        formData
      );
      setUserAuth(data);
      storeInSession("user", JSON.stringify(data));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const serverRoute = type === "signin" ? "signin" : "signup";
    // retrive the data from form
    let form = new FormData(formElement);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;
    if (fullname < 3) {
      return toast.error("Fullname must be at least 3 letter long");
    }
    if (!email) {
      return toast.error("Enter Email");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is Invalid");
    }

    if (!passwordRegex.test(password)) {
      return toast.error(
        "password should be 6 to 20 characters long with a numberic, 1 lowercase and 1 uppercase letters"
      );
    }
    UserAuthThroughServer(serverRoute, formData);
  };

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    authWithGoogle()
      .then((user) => {
        let serverRoute = "google-signin";

        let formData = {
          access_token: user.accessToken,
        };

        const newUser = UserAuthThroughServer(serverRoute, formData);
        if (newUser) {
          navigate('/')
        }
      })
      .catch((error) => {
        toast.error("trobule login with google");
        console.log(error);
      });
  };

  return (
    <>
      {access_token ? (
        <Navigate to={"/"} />
      ) : (
        <AnimationWrapper keyValue={type}>
          <Toaster />
          <section className="h-cover flex items-center justify-center">
            <form id="formElement" className="w-[80%] max-w-[400px]">
              <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                {type === "signin" ? "Welcome Back" : "Join us Today"}
              </h1>
              {type !== "signin" ? (
                <InputBox
                  name="fullname"
                  type="text"
                  placeholder="Full Name"
                  icon="fi-rr-user"
                />
              ) : (
                ""
              )}
              <InputBox
                name="email"
                type="email"
                placeholder="Email"
                icon="fi-rr-envelope"
              />
              <InputBox
                name="password"
                type="password"
                placeholder="Password"
                icon="fi-rr-key"
              />
              <button
                onClick={handleSubmit}
                type="submit"
                className="btn-dark center mt-14"
              >
                {type === "signin" ? "Sign In" : "Sign Up"}
              </button>

              <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                <hr className="w-1/2 border-black" />
                <p>or</p>
                <hr className="w-1/2 border-black" />
              </div>

              <button
                onClick={handleGoogleAuth}
                className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
              >
                <img className="w-5" src={googleIcons} alt="google-img" />{" "}
                Continue with Google
              </button>

              {type === "signin" ? (
                <p className="mt-6 text-dark-grey text-xl text-center">
                  Don't have an account
                  <Link
                    to={"/signup"}
                    className="underline text-black text-xl ml-1"
                  >
                    Join us Today
                  </Link>
                </p>
              ) : (
                <p className="mt-6 text-dark-grey text-xl text-center">
                  Already a member?
                  <Link
                    to={"/signin"}
                    className="underline text-black text-xl ml-1"
                  >
                    Sign in here
                  </Link>
                </p>
              )}
            </form>
          </section>
          <div></div>
        </AnimationWrapper>
      )}
    </>
  );
};

export default UserAuthForm;
