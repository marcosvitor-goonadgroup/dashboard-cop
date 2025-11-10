const API_BASE_URL = "https://api-rac-n-play.vercel.app/api/data/all?event=cop";

export const fetchAllData = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados da API:", error);
    throw error;
  }
};

const ApiBase = {
  fetchAllData,
};

export default ApiBase;
