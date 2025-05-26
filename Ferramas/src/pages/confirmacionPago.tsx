import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonButton,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";

const ConfirmacionPago: React.FC = () => {
  const location = useLocation();
  const [estadoPago, setEstadoPago] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const estado = searchParams.get("estado");
    setEstadoPago(estado);
  }, [location.search]);

  const volverListaProductos = () => {
    history.push("/home"); // Navega a la ruta de la lista de productos
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Confirmación de Pago</IonTitle>
          <IonButton slot="start" onClick={volverListaProductos}>
            Volver
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {estadoPago === "exitoso" && <p>¡El pago se ha realizado con éxito!</p>}
        {estadoPago === "fallido" && (
          <p>El pago ha fallado. Por favor, inténtelo de nuevo.</p>
        )}
        {estadoPago === null && <p>Verificando el estado del pago...</p>}
      </IonContent>
    </IonPage>
  );
};

export default ConfirmacionPago;
