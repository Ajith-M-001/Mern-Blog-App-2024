// import React, { useContext, useState } from "react";
// import { Navigate, NavLink, Outlet } from "react-router-dom";
// import { UserContext } from "../App";

// const SideNav = () => {
//   const { userAuth } = useContext(UserContext);
//   const access_token = userAuth?.access_token;
//   const [page, setPage] = useState("");

//   if (!access_token) {
//     // If the user is not authenticated, navigate to the signin page
//     return <Navigate to="/signin" />;
//   }

//   return (
//     <>
//       <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
//         <div className="sticky top-[80px] z-30">
//           <div className="min-w-[200px] h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0">
//             <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
//             <hr className="border-grey -ml-6 mb-8 mr-6" />
//             <NavLink
//               className="sidebar-link"
//               to="/dashboard/blogs"
//               onClick={(e) => setPage(e.target.innerText)}
//             >
//               <i className="fi fi-rr-document"></i>
//               Blogs
//             </NavLink>
//             <NavLink
//               className="sidebar-link"
//               to="/dashboard/notification"
//               onClick={(e) => setPage(e.target.innerText)}
//             >
//               <i className="fi fi-rs-bell"></i>
//               Notification
//             </NavLink>
//             <NavLink
//               className="sidebar-link"
//               to="/editor"
//               onClick={(e) => setPage(e.target.innerText)}
//             >
//               <i className="fi fi-rr-file-edit"></i>
//               write
//             </NavLink>

//             <h1 className="text-xl text-dark-grey mt-20 mb-3">Settings</h1>
//             <hr className="border-grey -ml-6 mb-8 mr-6" />

//             <NavLink
//               className="sidebar-link"
//               to="/settings/edit-profile"
//               onClick={(e) => setPage(e.target.innerText)}
//             >
//               <i className="fi fi-rr-user"></i>
//               Edit Profile
//             </NavLink>

//             <NavLink
//               className="sidebar-link"
//               to="/settings/change-password"
//               onClick={(e) => setPage(e.target.innerText)}
//             >
//               <i className="fi fi-rr-lock"></i>
//               Change Password
//             </NavLink>
//           </div>
//         </div>
//         <div className="max-md:-mt-8 mt-5 w-full ">
//           <Outlet />
//         </div>
//       </section>
//     </>
//   );
// };

// export default SideNav;

import React, { useContext, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../App";

const SideNav = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const new_notification_available = userAuth?.new_notification_available;
  const [page, setPage] = useState(path ? path.replace("-", " ") : "Dashboard");
  const activeTabLine = useRef();
  const sideBarIconTab = useRef();
  const pageStateTab = useRef();
  const [showSideNav, setShowSideNav] = useState(false);

  if (!access_token) {
    return <Navigate to="/signin" />;
  }

  const handlePageClick = (pageName) => {
    setPage(pageName);
  };

  const handlePageChange = (e) => {
    const { offsetWidth, offsetLeft } = e.target;
    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    if (e.target === sideBarIconTab.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  useEffect(() => {
    setShowSideNav(false);
    pageStateTab.current.click();
  }, [page]);

  return (
    <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
      <div className="sticky top-[80px] z-30">
        <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
          <button
            onClick={handlePageChange}
            ref={sideBarIconTab}
            className="p-5 capitalize"
          >
            <i className="fi fi-rr-menu-burger pointer-events-none"></i>
          </button>
          <button
            onClick={handlePageChange}
            ref={pageStateTab}
            className="p-5 capitalize"
          >
            {page}
          </button>
          <hr ref={activeTabLine} className="absolute bottom-0 duration-500" />
        </div>
        <div
          className={`min-w-[200px] h-[calc(100vh-80px-70px)] md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:ml-7 duration-500 ${
            !showSideNav
              ? "max-md:opacity-0 max-md:pointer-events-none"
              : "opacity-100 pointer-events-auto"
          }`}
        >
          <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
          <hr className="border-grey -ml-6 mb-8 mr-6" />
          <NavLink
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            to="/dashboard/blogs"
            onClick={() => handlePageClick("Blogs")}
          >
            <i className="fi fi-rr-document"></i>
            Blogs
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            to="/dashboard/notifications"
            onClick={() => handlePageClick("Notification")}
          >
            <div className="relative">
              <i className="fi fi-rs-bell"></i>
              {new_notification_available && (
                <span className="bg-red h-2 w-2 rounded-full absolute z-10 top-0 right-0"></span>
              )}
            </div>
            Notification
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            to="/editor"
            onClick={() => handlePageClick("Write")}
          >
            <i className="fi fi-rr-file-edit"></i>
            Write
          </NavLink>

          <h1 className="text-xl text-dark-grey mt-10 mb-3">Settings</h1>
          <hr className="border-grey -ml-6 mb-8 mr-6" />

          <NavLink
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            to="/settings/edit-profile"
            onClick={() => handlePageClick("Edit Profile")}
          >
            <i className="fi fi-rr-user"></i>
            Edit Profile
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            to="/settings/change-password"
            onClick={() => handlePageClick("Change Password")}
          >
            <i className="fi fi-rr-lock"></i>
            Change Password
          </NavLink>
        </div>
      </div>
      <div className="max-md:-mt-8 mt-5 w-full">
        <Outlet />
      </div>
    </section>
  );
};

export default SideNav;
