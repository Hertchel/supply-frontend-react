import axios from "axios";

const react_env = import.meta.env.VITE_REACT_ENV;
const development_url = import.meta.env.VITE_API_URL;
const production_url = import.meta.env.VITE_RENDER_API_URL;

console.log(`Running in ${react_env} Mode`);

const baseURL =
  react_env === "development" ? development_url : production_url;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const getAccessToken = () => {
  return sessionStorage.getItem("access_token");
};

const getRefreshToken = () => {
  return sessionStorage.getItem("refresh_token");
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite retry loops
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // Send refresh token from THIS TAB
        const response = await axios.post(
          `${baseURL}/api/token/refresh/`,
          {
            refresh_token: refreshToken,
          },
          {
            withCredentials: true,
          }
        );

        const { access_token } = response.data;

        if (!access_token) {
          throw new Error("No access token returned");
        }

        // Save refreshed access token to THIS TAB
        sessionStorage.setItem(
          "access_token",
          access_token
        );

        // Retry original request with the new token
        originalRequest.headers.Authorization =
          `Bearer ${access_token}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.error(
          "Token refresh failed:",
          refreshError
        );

        // Clear only THIS TAB's authentication data
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("auth-storage");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;