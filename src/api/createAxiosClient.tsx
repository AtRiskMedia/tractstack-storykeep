import axios from "axios";
import type { AxiosError } from "axios";

import type { IAxiosClientProps } from "../types";

/* eslint-disable  @typescript-eslint/no-explicit-any */
let failQueue: any[] = [];
let isRefreshing = false;

const processQueue = (error: AxiosError | null) => {
  failQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failQueue = [];
};

export function createAxiosClient({
  options,
  getCurrentAccessToken,
  getCurrentRefreshToken,
  refreshTokenUrl,
  setRefreshedTokens,
  getAuthData,
  logout,
}: IAxiosClientProps) {
  const client = axios.create(options);

  client.interceptors.request.use(
    (config: any) => {
      if (config.authorization !== false) {
        const token = getCurrentAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ` + token;
          config.withCredentials = true;
        }
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    response => {
      return response;
    },
    async error => {
      const originalRequest = error.config;
      originalRequest.headers = JSON.parse(
        JSON.stringify(originalRequest.headers || {})
      );

      const handleError = (error: AxiosError) => {
        processQueue(error);
        return Promise.reject(error);
      };

      if (
        refreshTokenUrl &&
        error.response?.status === 401 &&
        originalRequest?.url !== refreshTokenUrl &&
        originalRequest?._retry !== true
      ) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failQueue.push({ resolve, reject });
          })
            .then(() => {
              return client(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }
        isRefreshing = true;
        originalRequest._retry = true;
        //const authPayload = getAuthData();
        getAuthData();
        console.log(
          `PIN to fix: getAuthData should pull from nanostore? when memory is enabled`
        );
        const refreshToken = getCurrentRefreshToken();
        return client
          .post(refreshTokenUrl, { /* ...authPayload,*/ refreshToken })
          .then(response => {
            setRefreshedTokens(response.data);
            processQueue(null);
            return client(originalRequest);
          }, handleError)
          .catch(e => {
            logout(true);
            return handleError(e);
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else if (error.response?.status === 401) {
        logout();
        return handleError(error);
      }

      return Promise.reject(error);
    }
  );

  return client;
}
