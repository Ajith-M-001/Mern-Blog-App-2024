import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const BlogContent = ({ block }) => {
  const { type, data } = block;
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(data.code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset copy success message after 2 seconds
    });
  };

  if (type === "paragraph") {
    return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>;
  }

  if (type === "header") {
    if (data.level === 3) {
      return (
        <h3
          className="text-3xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h3>
      );
    } else {
      return (
        <h2
          className="text-4xl font-bold"
          dangerouslySetInnerHTML={{ __html: data.text }}
        ></h2>
      );
    }
  }

  if (type === "image") {
    return (
      <div
        className={`image-container ${data.withBorder ? "border" : ""} ${
          data.withBackground ? "bg-gray-200" : ""
        }`}
      >
        <img
          src={data.file.url}
          alt={data.caption || "Image"}
          className={`max-w-full ${data.stretched ? "w-full" : ""}`}
        />
        {data.caption && (
          <p className="text-center mt-2 text-gray-500">{data.caption}</p>
        )}
      </div>
    );
  }

  if (type === "code") {
    return (
      <div className="relative">
        <button
          onClick={handleCopyClick}
          className="absolute top-2 right-2 px-2 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          {copySuccess ? "Copied!" : "Copy"}
        </button>
        <SyntaxHighlighter language="javascript" style={oneDark}>
          {data.code}
        </SyntaxHighlighter>
      </div>
    );
  }

  if (type === "quote") {
    return (
      <blockquote
        className={`border-l-4 pl-4 italic text-gray-700 ${
          data.alignment === "center" ? "text-center" : "text-left"
        }`}
      >
        {data.text}
        {data.caption && (
          <cite className="block mt-2 text-right text-sm text-gray-500">
            — {data.caption}
          </cite>
        )}
      </blockquote>
    );
  }

   if (type === "list") {
     return data.style === "ordered" ? (
       <ol className="list-decimal pl-6">
         {data.items.map((item, index) => (
           <li
             key={index}
             dangerouslySetInnerHTML={{ __html: item }}
             className="mb-2"
           ></li>
         ))}
       </ol>
     ) : (
       <ul className="list-disc pl-6">
         {data.items.map((item, index) => (
           <li
             key={index}
             dangerouslySetInnerHTML={{ __html: item }}
             className="mb-2"
           ></li>
         ))}
       </ul>
     );
   }

  return <div>BlogContent</div>;
};

export default BlogContent;
