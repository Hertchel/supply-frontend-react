import axios from "axios";

const API_URL =
  "https://supply-api-django.onrender.com/api/ai";

const getAuthHeaders = () => {

    const token =
        localStorage.getItem("access_token");

    return {

        headers: {
            Authorization: `Bearer ${token}`,
        },

        withCredentials: true,
    };
};

export const getRecommendations = async () => {

    const response = await axios.get(
        `${API_URL}/recommendations/`,
        getAuthHeaders()
    );

    return response.data;
};

export const getForecast = async () => {

    const response = await axios.get(
        `${API_URL}/forecast/`,
        getAuthHeaders()
    );

    return response.data;
};

export const getAnomalies = async () => {

    const response = await axios.get(
        `${API_URL}/anomalies/`,
        getAuthHeaders()
    );

    return response.data;
};