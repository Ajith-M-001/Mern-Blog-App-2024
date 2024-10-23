const storeInSession = (key, value) => {
  return sessionStorage.setItem(key, value);
};

const removeFromSession = (key, value) => {
  return sessionStorage.removeItem(key, value);
};

const lookInSession = (key) => {
  return sessionStorage.getItem(key);
};

const logoutSession = () => {
  sessionStorage.clear();
};

export { storeInSession, logoutSession, removeFromSession, lookInSession };
