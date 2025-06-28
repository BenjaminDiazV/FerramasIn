import axios from "axios";

const API_URL = "http://localhost:5000/productos";

export const obtenerProductos = async (emailUsuario?: string) => {
  try {
    let url = API_URL;
    if (emailUsuario) {
      url += `?email=${encodeURIComponent(emailUsuario)}`;
    }
    console.log('DEBUG: URL para productos:', url);
    const response = await axios.get(url);
    console.log('DEBUG: Respuesta de productos:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
};
