import React, { useState } from "react";

const InputBox = ({
  name,
  type,
  id,
  value,
  placeholder,
  icon,
  disable = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative w-[100%] mb-4">
      <input
        type={type === "password" ? (showPassword ? "text" : "password") : type}
        name={name}
        placeholder={placeholder}
        defaultValue={value}
        id={id}
        className="input-box"
        disabled={disable}
      />

      <i className={`fi ${icon} input-icon`}></i>

      {type === "password" ? (
        <i
          onClick={() => setShowPassword((prevState) => !prevState)}
          className={`fi fi-rr-${
            showPassword ? "eye" : "eye-crossed"
          } input-icon left-[auto] right-4 cursor-pointer`}
        ></i>
      ) : (
        ""
      )}
    </div>
  );
};

export default InputBox;
