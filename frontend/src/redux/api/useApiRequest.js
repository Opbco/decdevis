import PublicRequest from "../api/RequestApi";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { UNAUTHENTICATED } from "../reducers/UserReducer";

const useApiRequest = () => {
  const user = useSelector((state) => state);
  let dispatch = useDispatch();

  useEffect(() => {
    const requestIntercept = PublicRequest.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${user?.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    const responseIntercept = PublicRequest.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error?.response?.status === 401) {
          dispatch(UNAUTHENTICATED());
        }
        return Promise.reject(error);
      }
    );
    return () => {
      PublicRequest.interceptors.request.eject(requestIntercept);
      PublicRequest.interceptors.response.eject(responseIntercept);
    };
  }, [user.authenticated, user.access_token]);

  return PublicRequest;
};

export default useApiRequest;
