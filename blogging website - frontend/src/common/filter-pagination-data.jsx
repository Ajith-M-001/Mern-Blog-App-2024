// import axios from "axios";

// const FilterPaginationData = async ({
//   create_new_array = false,
//   state,
//   data,
//   page,
//   countRoute,
//   data_to_send = {},
//   user,
// }) => {
//   let obj;
//   const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
//   let headers = {};

//   console.log(
//     "function called",
//     create_new_array,
//     state,
//     page,
//     countRoute,
//     data_to_send,
//     user
//   );

//   if (user) {
//     headers.headers = {
//       Authorization: `Bearer ${user} `,
//     };
//   }
//   try {
//     if (!state && !create_new_array) {
//       // Append data to the existing state if state is not null and create_new_array is false
//       obj = { ...state, results: [...(state.results || []), ...data], page };
//     } else {
//       // Fetch the totalDocs count from the server
//       const response = await axios.post(
//         `${baseURL}/blog/${countRoute}`,
//         data_to_send,
//         headers
//       );
//       const { totalDocs } = response.data;
//       obj = { results: data, page: 1, totalDocs };
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }

//   return obj;
// };

// export default FilterPaginationData;

import axios from "axios";

const FilterPaginationData = async ({
  create_new_array = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
  user,
}) => {
  let obj;
  const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
  let headers = {};


  if (user) {
    headers.headers = {
      Authorization: `Bearer ${user}`,
    };
  }


  try {
    if (!state && !create_new_array) {
      // Append data to the existing state if state is not null and create_new_array is false
      obj = { ...state, results: [...(state?.results || []), ...data], page };
    } else {
      // Fetch the totalDocs count from the server
      const response = await axios.post(
        `${baseURL}/${countRoute}`,
        data_to_send,
        headers
      );
      const { totalDocs } = response.data;
      obj = { results: data, page: 1, totalDocs };
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return obj;
};

export default FilterPaginationData;
