import React from "react";

const LoadMoreDataBtn = ({ state, fetchDataFun }) => {
  // Safely check if state and state.results exist before accessing their properties
  if (state && state.totalDocs > state?.results?.length) {
    return (
      <button
        onClick={() => {
          fetchDataFun({ page: state.page });
        }}
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
      >
        Load More
      </button>
    );
  }

  return null; // Return null if the button should not be displayed
};

export default LoadMoreDataBtn;
