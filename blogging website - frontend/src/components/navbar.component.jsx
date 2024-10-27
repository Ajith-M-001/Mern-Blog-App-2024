import React, { useContext, useEffect, useState } from "react";
import logo from "../imgs/logo.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";

const NavbarComponent = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const [showUserPanel, setShowUserPanel] = useState(false);
  // console.log(userAuth, userAuth?.access_token);
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const navigate = useNavigate();
  const [serarchBoxVisibility, setSearchBoxVisiblity] = useState(false);
  const profile_img = userAuth?.user?.profile_img;
  const access_token = userAuth?.access_token;
  const new_notification_available = userAuth?.new_notification_available;
  console.log(new_notification_available);
  const handleBlur = () => {
    setTimeout(() => {
      setShowUserPanel(false);
    }, 200);
  };

  useEffect(() => {
    if (access_token) {
      axios
        .get(`${baseURL}/notification/new`, {
          headers: {
            Authorization: `Brarer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, [access_token]);

  const handlesearch = (e) => {
    let query = e.target.value;
    if (e.key === "Enter" && query.length) {
      navigate(`/search/${query}`);
    }
  };
  return (
    <>
      <nav className="navbar z-50 flex items-center p-4 max-w-screen-xl mx-auto">
        <Link to="/" className="w-10 h-auto">
          <img className="w-full" src={logo} alt="Company Logo" />
        </Link>
        <div
          className={
            `absolute md:border-0 md:block md:relative bg-white w-full left-0 top-full mt-0.5 border-b md:inset-0 border-grey py-4 px-[5vw] md:p-0  md:w-auto md:show ` +
            `${serarchBoxVisibility ? "show" : "hide"}`
          }
        >
          <input
            type="text"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
            placeholder="search"
            onKeyDown={handlesearch}
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            onClick={() =>
              setSearchBoxVisiblity((currentValue) => !currentValue)
            }
            className="md:hidden bg-grey h-12 w-12 rounded-full flex items-center justify-center"
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>

          <Link to={"/editor"} className="hidden md:flex gap-2 link">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write</p>
          </Link>
          {userAuth?.access_token ? (
            <>
              <Link to={"/dashboard/notifications"}>
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
                  <i className="fi fi-rr-bell text-2xl block mt-1"></i>
                  {new_notification_available && (
                    <span className="bg-red absolute w-3 h-3 rounded-full top-2 right-2 z-10"></span>
                  )}
                </button>
              </Link>
              <div
                onBlur={handleBlur}
                onClick={() => setShowUserPanel((prevState) => !prevState)}
                className="relative"
              >
                <button className="w-12 h-12 mt-1">
                  <img
                    className="w-full h-full rounded-full object-cover"
                    src={profile_img}
                    alt={userAuth?.user?.username}
                  />
                </button>
                {showUserPanel && <UserNavigationPanel />}
              </div>
            </>
          ) : (
            <>
              <Link className="btn-dark py-2 " to={"/signin"}>
                Sign In
              </Link>
              <Link className="btn-lighe py-2 hidden md:block" to={"/signup"}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default NavbarComponent;
