// src/pages/ListaProductos.tsx
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import axios from "axios";

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

  return (
    <IonPage>
      <IonHeader>
        <IonTitle>Lista de Productos</IonTitle>
      </IonHeader>
      <IonContent>
        <IonButton
          onClick={handleToggle}
          expand="block"
          color={mostrarDolares ? "secondary" : "primary"}
        >
          {mostrarDolares
            ? "Mostrar precios en pesos"
            : "Mostrar precios en dólares"}
        </IonButton>
        <IonList>
          {productos.map((producto) => (
            <IonItem key={producto.id_prod}>
              <IonLabel>
                <h2>{producto.nombre}</h2>
                <p>Categoría: {producto.categoria}</p>
                <p>Marca: {producto.marca}</p>
                <p>
                  Precio:{" "}
                  {mostrarDolares && producto.precio_dolar !== undefined
                    ? `$${producto.precio_dolar} USD`
                    : `$${producto.precio} CLP`}
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ListaProductos;
