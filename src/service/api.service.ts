import axios from "axios";

const SCANNER_API = "http://localhost:8000"; // URL du service scanner

export const runScan = async (url: string) => {
  try {
    const response = await axios.get(`${SCANNER_API}/scan?url=${encodeURIComponent(url)}`);
    return response.data; // Retourner les résultats de l'API
  } catch (error) {
    throw new Error("Erreur lors de l'appel API: " + error);
  }
};
