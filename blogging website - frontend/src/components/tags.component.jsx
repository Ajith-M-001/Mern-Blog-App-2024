import React, { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const Tag = ({ tag, tagIndex }) => {
  const {
    blog: { tags },
    blog,
    setBlog,
  } = useContext(EditorContext);

  const handleDeleteTagFunction = () => {
    const updatedTags = tags.filter((t) => t !== tag); // Create a new array without the deleted tag
    setBlog({ ...blog, tags: updatedTags }); // Update the state with the new tags array
  };

  const addEditable = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  };

  const handleKeyDownFuntion = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();
      const currentTag = e.target.innerText;
      tags[tagIndex] = currentTag;
      setBlog({ ...blog, tags });
      e.target.setAttribute("contentEditable", false);
      e.target.focus();
    }
  };

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block border border-black hover:bg-opacity-50 pr-8">
      <p
        onKeyDown={handleKeyDownFuntion}
        className="outline-none"
        onClick={addEditable}
      >
        {tag}
      </p>
      <button
        onClick={handleDeleteTagFunction}
        className="mt-[2px] rounded-full absolute right-2 top-1/2 -translate-y-1/2"
      >
        <i className="fi fi-rr-circle-xmark text-sm pointer-events-none"></i>
      </button>
    </div>
  );
};

export default Tag;
