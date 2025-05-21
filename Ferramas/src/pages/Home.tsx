// src/pages/ListaProductos.tsx
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { obtenerProductos } from "../producto.service";

interface Producto {
  id_prod: number;
  nombre: string;
  categoria: string;
  marca: string;
  cod_marca: string;
  precio: number;
}

const ListaProductos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (err: any) {
        setError("Error al cargar los productos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonTitle>Cargando Productos...</IonTitle>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>Cargando la lista de productos...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonTitle>Error</IonTitle>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>{error}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonTitle>Lista de Productos</IonTitle>
      </IonHeader>
      <IonContent>
        <IonList>
          {productos.map((producto) => (
            <IonItem key={producto.id_prod}>
              <IonLabel>
                <h2>{producto.nombre}</h2>
                <p>Categoría: {producto.categoria}</p>
                <p>Marca: {producto.marca}</p>
                <p>Precio: ${producto.precio}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ListaProductos;
