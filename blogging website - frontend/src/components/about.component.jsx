import React from "react";
import { Link } from "react-router-dom";

const AboutUser = ({ bio, social_links, joinedAt, className }) => {
  return (
    <div className={`md:w-[90%] md:mt-7 ${className}`}>
      <p className="text-xl leading-7">
        {bio.length ? bio : "Nothing to read here"}
      </p>

      <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
        <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
          {Object.keys(social_links).map((key) => {
            const link = social_links[key];

            return link ? (
              <Link to={link} key={key} target="_blank">
                <i
                  className={`fi ${
                    key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"
                  } text-2xl hover:text-black`}
                ></i>
              </Link>
            ) : null;
          })}
        </div>
        <p className="text-xl leading-7 text-dark-grey">
          {new Date(joinedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

export default AboutUser;
