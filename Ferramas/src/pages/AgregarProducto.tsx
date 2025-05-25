import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonToast,
} from "@ionic/react";
import axios from "axios";

const AgregarProducto: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [precio, setPrecio] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/productos/agregar_producto", {
        nombre,
        categoria,
        marca,
        precio: Number(precio),
      });
      setToastMsg("Producto agregado correctamente");
      setShowToast(true);
      setNombre("");
      setCategoria("");
      setMarca("");
      setPrecio("");
    } catch (error) {
      setToastMsg("Error al agregar producto");
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Agregar Producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Nombre</IonLabel>
            <IonInput
              value={nombre}
              onIonChange={(e) => setNombre(e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Categoría</IonLabel>
            <IonInput
              value={categoria}
              onIonChange={(e) => setCategoria(e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Marca</IonLabel>
            <IonInput
              value={marca}
              onIonChange={(e) => setMarca(e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Precio</IonLabel>
            <IonInput
              type="number"
              value={precio}
              onIonChange={(e) => setPrecio(e.detail.value!)}
              required
            />
          </IonItem>
          <IonButton expand="block" type="submit" style={{ marginTop: 20 }}>
            Agregar Producto
          </IonButton>
        </form>
        <IonToast
          isOpen={showToast}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setShowToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default AgregarProducto;