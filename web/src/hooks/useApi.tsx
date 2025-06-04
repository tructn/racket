import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useCallback } from "react";

// Create a single Axios client instance
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Utility to get auth headers using useAuth0
const useAuthHeaders = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getAuthHeaders = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (e) {
      console.error("Error fetching access token:", e);
      return {};
    }
  }, [getAccessTokenSilently]);

  return getAuthHeaders;
};

// Generic hook for API requests
export const useApi = () => {
  const getAuthHeaders = useAuthHeaders();

  const get = useCallback(
    async <T = any,>(url: string): Promise<T> => {
      const headers = await getAuthHeaders();
      const res = await client.get(url, { headers });
      return res.data as T;
    },
    [getAuthHeaders],
  );

  const post = useCallback(
    async <T = any,>(url: string, body: T): Promise<any> => {
      const headers = await getAuthHeaders();
      const res = await client.post(url, body, { headers });
      return res.data;
    },
    [getAuthHeaders],
  );

  const put = useCallback(
    async <T = any,>(url: string, body: T): Promise<any> => {
      const headers = await getAuthHeaders();
      const res = await client.put(url, body, { headers });
      return res.data;
    },
    [getAuthHeaders],
  );

  const del = useCallback(
    async (url: string): Promise<any> => {
      const headers = await getAuthHeaders();
      const res = await client.delete(url, { headers });
      return res.data;
    },
    [getAuthHeaders],
  );

  return { get, post, put, del };
};
