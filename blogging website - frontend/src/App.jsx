import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavbarComponent from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import EditorPages from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import UserProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";

export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState();
  useEffect(() => {
    let userInSession = lookInSession("user");
    if (userInSession) {
      setUserAuth(JSON.parse(userInSession));
    } else {
      setUserAuth({ access_token: null });
    }
  }, []);
  return (
    <BrowserRouter>
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <Routes>
          <Route path="/" element={<NavbarComponent />}>
            <Route index element={<HomePage />} />
            <Route path="settings" element={<SideNav />}>
              <Route
                path="edit-profile"
                element={<EditProfile/>}
              />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
            <Route path="signin" element={<UserAuthForm type="signin" />} />
            <Route path="signup" element={<UserAuthForm type="singup" />} />
            <Route path="search/:query" element={<SearchPage />} />
            <Route path="user/:id" element={<UserProfilePage />} />
            <Route path="blog/:blog_id" element={<BlogPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
          <Route path="/editor" element={<EditorPages />} />
          <Route path="/editor/:blog_id" element={<EditorPages />} />
        </Routes>
      </UserContext.Provider>
    </BrowserRouter>
  );
};

export default App;
