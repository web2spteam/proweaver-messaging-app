import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "https://collablearn.dworks.online/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getData = async <TResponse>(
  endpoint: string,
): Promise<TResponse> => {
  try {
    const response: AxiosResponse<TResponse> = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const postData = async <TResponse, TRequest>(
  endpoint: string,
  data: TRequest,
): Promise<TResponse> => {
  try {
    const response: AxiosResponse<TResponse> = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

export const postFormData = async <TResponse>(
  endpoint: string,
  formData: FormData,
): Promise<TResponse> => {
  try {
    const response: AxiosResponse<TResponse> = await api.post(
      endpoint,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error posting FormData:", error);
    throw error;
  }
};

export default api;
