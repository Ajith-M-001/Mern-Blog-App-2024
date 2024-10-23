import React from "react";
import pagenotfoundimage from "../imgs/404.png";
import fullLogo from "../imgs/full-logo.png";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
      <img
        src={pagenotfoundimage}
        alt="pagenotfound"
        className="select-none border-2 border-grey w-44 aspect-square "
      />
      <h1 className="text-2xl font-gelasio leading-7">Page not Found</h1>
      <p className="text-dark-grey text-xl leading-7 -mt-10">
        The page you are looking for doesnot exist. Head back to the{" "}
        <Link to={"/"} className="text-black underline">
          Home page
        </Link>
      </p>

      <div className="mt-auto">
        <img
          src={fullLogo}
          alt="logo"
          className="h-8 object-contain block mx-auto select-none"
        />
        <p className="mt-5 text-dark-grey">
          Read millians of stories around the world
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
