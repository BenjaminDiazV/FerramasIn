// src/services/webpay.service.ts
import axios from "axios";

const API_URL = "http://localhost:5000/webpay";

export const iniciarPago = async () => {
  try {
    // Simplemente hacemos un GET y el backend se encargará de la redirección
    window.location.href = `${API_URL}/crear_transaccion`;
    return true; // Indicamos que la acción de iniciar el pago se intentó
  } catch (error: any) {
    console.error("Error al iniciar el pago con Webpay:", error);
    return false;
  }
};
