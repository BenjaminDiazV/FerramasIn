import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonToolbar,
  IonAlert,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import "./Home.css";
import { iniciarPago } from "../webpay.service";

import Footer from "./Footer";
import Header from "./Header";

interface Producto {
  id_prod: number;
  nombre: string;
  categoria: string;
  marca: string;
  precio: number;
  precio_dolar?: number;
}

const ListaProductos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mostrarDolares, setMostrarDolares] = useState(false);
  const history = useHistory();
  const [showTransferAlert, setShowTransferAlert] = useState(false);

  const datosTransferencia = `
Banco: Banco Ejemplo
Cuenta: 123456789
Tipo: Cuenta Corriente
Nombre: Ferramas Ltda.
RUT: 12.345.678-9
Correo: pagos@ferramas.cl`;

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    const res = await axios.get("http://localhost:5000/productos/");
    setProductos(res.data);
    setMostrarDolares(false);
  };

  const cargarProductosEnDolares = async () => {
    const res = await axios.get("http://localhost:5000/productos/en_dolares");
    setProductos(res.data);
    setMostrarDolares(true);
  };

  const handleToggle = async () => {
    if (mostrarDolares) {
      await cargarProductos();
    } else {
      await cargarProductosEnDolares();
    }
  };

  const iniciarPagoWebpay = async () => {
    const productIds = productos.map((producto) => producto.id_prod); // Obtén los IDs de los productos mostrados
    try {
      const response = await axios.post(
        "http://localhost:5000/webpay/crear_transaccion",
        {
          product_ids: productIds,
        }
      );
      if (response.data && response.data.url) {
        window.location.href =
          response.data.url + "?token_ws=" + response.data.token;
      } else {
        console.error("No se recibió la URL o el token de Webpay.");
      }
    } catch (error: any) {
      console.error("Error al iniciar el pago con Webpay:", error);
    }
  };

  return (
    <IonPage>
      <Header />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lista de Productos</IonTitle>
          <IonButton
            slot="end"
            color="success"
            onClick={() => history.push("/agregar_producto")}
            className="ferramas-btn-circular success"
            shape="round"
          >
            +
          </IonButton>

          <IonButton
            slot="end"
            onClick={handleToggle}
            className={`ferramas-btn-circular ${
              mostrarDolares ? "usd" : "clp"
            }`}
            shape="round"
          >
            {mostrarDolares ? "USD" : "CLP"}
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ferramas-content">
        <IonList>
          {productos.map((producto) => (
            <IonItem key={producto.id_prod} className="ferramas-item">
              <IonLabel>
                <h2>{producto.nombre}</h2>
                <p>
                  <strong>Categoría:</strong> {producto.categoria}
                </p>
                <p>
                  <strong>Marca:</strong> {producto.marca}
                </p>
                <p>
                  <strong>Precio:</strong>{" "}
                  {mostrarDolares && producto.precio_dolar !== undefined
                    ? `$${producto.precio_dolar} USD`
                    : `$${producto.precio} CLP`}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {/* Botón para iniciar el pago con Webpay */}
        <IonButton
          expand="full"
          onClick={iniciarPagoWebpay}
          className="webpay-button"
        >
          Ir a Pagar con Webpay
        </IonButton>
        {/* Botón para mostrar datos de transferencia */}
        <IonButton
          expand="full"
          color="secondary"
          onClick={() => setShowTransferAlert(true)}
          style={{ marginTop: 12 }}
        >
          Ver datos de transferencia bancaria
        </IonButton>

        <IonAlert
          isOpen={showTransferAlert}
          onDidDismiss={() => setShowTransferAlert(false)}
          header="Datos de Transferencia Bancaria"
          message={`${datosTransferencia}`}
          buttons={[
            {
              text: "Cerrar",
              role: "cancel",
              handler: () => setShowTransferAlert(false),
            },
          ]}
          cssClass="transfer-alert"
        />
      </IonContent>
      <Footer />
    </IonPage>
  );
};

export default ListaProductos;
