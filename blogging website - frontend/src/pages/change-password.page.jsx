import React, { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
const baseURL = import.meta.env.VITE_SERVER_DOMAIN;
import { UserContext } from "../App";

const ChangePassword = () => {
  const changePasswordForm = useRef();
  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;

  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(changePasswordForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;
    if (!currentPassword.length || !newPassword.length) {
      return toast.error("Required fields can't be empty");
    }

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "Password must be 6-20 characters long, with at least one digit, one lowercase letter, and one uppercase letter."
      );
    }

    e.target.setAttribute("disabled", true);

    let loadingToast = toast.loading("updating...");

    axios
      .post(`${baseURL}/auth/change-password`, formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        changePasswordForm.current.reset(); // Clear the form fields
        return toast.success("password changed successfully");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.error(response.data.message);
      });
  };
  return (
    <AnimationWrapper>
      <Toaster />
      <form ref={changePasswordForm}>
        <h1 className="max-md:hidden\">Change Password</h1>
        <div className="py-10 w-full md:max-w-[400px]">
          <InputBox
            name="currentPassword"
            type="password"
            className="profie-edit-input"
            placeholder="Current Password *"
            icon="fi-rr-unlock"
          />
          <InputBox
            name="newPassword"
            type="password"
            className="profie-edit-input"
            placeholder="New Password *"
            icon="fi-rr-unlock"
          />
          <button
            onClick={handleSubmit}
            className="btn-dark px-10 "
            type="submit"
          >
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
