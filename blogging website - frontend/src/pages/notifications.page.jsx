// import React, { useContext, useEffect, useState } from "react";
// import axios, { formToJSON } from "axios";
// import { UserContext } from "../App";
// import FilterPaginationData from "../common/filter-pagination-data";

// const Notifications = () => {
//   const [filter, setFilter] = useState("all");
//   const [notification, setNotification] = useState("");
//   const filters = ["all", "like", "comment", "reply"];
//   const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
//   const { userAuth } = useContext(UserContext);
//   const access_token = userAuth?.access_token;

//   const fetchNotifications = async ({ page, deleteDocCount = 0 }) => {
//     axios
//       .post(
//         `${baseURL}/notification/getNotificatons`,
//         { page, filter, deleteDocCount },
//         {
//           headers: {
//             Authorization: `Bearer ${access_token} `,
//           },
//         }
//       )
//       .then(async ({ data }) => {
//         console.log(data);
//         let formatedData = await FilterPaginationData({
//           state: notification,
//           data,
//           page,
//           countRoute: "/all-notification-count",
//           data_to_send: { filter },
//           user: access_token,
//         });
//         setNotification(formatedData);
//         console.log(formatedData);
//       })
//       .catch(({response}) => {
//         console.log(response.data.message);
//       });
//   };

//   useEffect(() => {
//     if (access_token) {
//       fetchNotifications({ page: 1 });
//     }
//   }, [access_token, filter]);

//   const handleFilter = (e) => {
//     let btn = e.target.innerHTML.toLowerCase();
//     setFilter(btn);
//     setNotification(null);
//   };

//   return (
//     <>
//       <div>
//         <h1 className="max-md:hidden">Recent Notification</h1>
//         <div className="my-8 flex gap-6">
//           {filters.map((filterName, i) => {
//             return (
//               <button
//                 onClick={handleFilter}
//                 className={`py-2 ${
//                   filter === filterName.toLowerCase() ? "btn-dark" : "btn-light"
//                 }`}
//                 key={i}
//               >
//                 <p className="capitalize">{filterName}</p>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Notifications;

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import FilterPaginationData from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NodataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";

const Notifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState({
    results: [],
    page: 1,
    totalDocs: 0,
  });
  const filters = ["all", "like", "comment", "reply"];
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  const { userAuth, setUserAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const new_notification_available = userAuth?.new_notification_available;
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = ({ page, deleteDocCount = 0 }) => {
    setIsLoading(true);
    axios
      .post(
        `${baseURL}/notification/getNotificatons`,
        { page, filter, deleteDocCount },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        if (new_notification_available) {
          setUserAuth({ ...userAuth, new_notification_available: false });
        }
        const formatedData = await FilterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "notification/all-notification-count",
          data_to_send: { filter },
          user: access_token,
        });
        setNotifications(formatedData);
        setIsLoading(false);
      })
      .catch(({ response }) => {
        console.error(response.data.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  const handleFilter = (e) => {
    const btn = e.target.textContent.toLowerCase();
    setFilter(btn);
    setNotifications({ results: [], page: 1, totalDocs: 0 });
  };

  return (
    <>
      <div>
        <h1 className="max-md:hidden">Recent Notification</h1>
        <div className="my-8 flex gap-6">
          {filters.map((filterName, i) => {
            return (
              <button
                onClick={handleFilter}
                className={`py-2 ${
                  filter === filterName.toLowerCase() ? "btn-dark" : "btn-light"
                }`}
                key={i}
              >
                <p className="capitalize">{filterName}</p>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <>
            {notifications?.results?.length ? (
              notifications.results.map((notification, i) => (
                <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                  <NotificationCard
                    data={notification}
                    index={i}
                    notificationState={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              ))
            ) : (
              <NodataMessage message={"no Nod"} />
            )}
          </>
        )}

        <LoadMoreDataBtn
          state={notifications}
          fetchDataFun={fetchNotifications}
          additionalParams={{ deleteDocCount: notifications.deleteDocCount }}
        />
      </div>
    </>
  );
};

export default Notifications;
