import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonButton,
  IonToolbar,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { checkmarkCircle, closeCircle, time } from "ionicons/icons";
import "./Carrito.css";

const ConfirmacionPago: React.FC = () => {
  const location = useLocation();
  const [estadoPago, setEstadoPago] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const estado = searchParams.get("estado");
    setEstadoPago(estado);
  }, [location.search]);

  const volverCatalogo = () => {
    history.push("/catalogo"); // Navega al catálogo
  };

  const volverIntentar = () => {
    history.push("/catalogo"); // Volver al catálogo para intentar de nuevo
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={volverCatalogo}>Volver al Catálogo</IonButton>
          </IonButtons>
          <IonTitle>Confirmación de Pago</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="confirmacion-pago-container">
          <IonCard className="confirmacion-pago-card">
            <IonCardHeader>
              <IonCardTitle>
                {estadoPago === "exitoso" && (
                  <>
                    <IonIcon icon={checkmarkCircle} color="success" className="confirmacion-pago-icon" />
                    <h2 className="confirmacion-pago-titulo" style={{ color: '#28a745' }}>¡Pago Exitoso!</h2>
                  </>
                )}
                {estadoPago === "fallido" && (
                  <>
                    <IonIcon icon={closeCircle} color="danger" className="confirmacion-pago-icon" />
                    <h2 className="confirmacion-pago-titulo" style={{ color: '#dc3545' }}>Pago Fallido</h2>
                  </>
                )}
                {estadoPago === null && (
                  <>
                    <IonIcon icon={time} color="warning" className="confirmacion-pago-icon" />
                    <h2 className="confirmacion-pago-titulo" style={{ color: '#ffc107' }}>Verificando...</h2>
                  </>
                )}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {estadoPago === "exitoso" && (
                <>
                  <p className="confirmacion-pago-mensaje">
                    ¡Tu pago se ha procesado correctamente! 
                    Recibirás un correo de confirmación en breve.
                  </p>
                  <div className="confirmacion-pago-botones">
                    <IonButton 
                      expand="block" 
                      color="success" 
                      onClick={volverCatalogo}
                    >
                      Continuar Comprando
                    </IonButton>
                  </div>
                </>
              )}
              {estadoPago === "fallido" && (
                <>
                  <p className="confirmacion-pago-mensaje">
                    El pago no pudo ser procesado. Esto puede deberse a:
                  </p>
                  <ul className="confirmacion-pago-lista">
                    <li>Fondos insuficientes</li>
                    <li>Datos de tarjeta incorrectos</li>
                    <li>Problemas de conectividad</li>
                    <li>Pago cancelado por el usuario</li>
                  </ul>
                  <div className="confirmacion-pago-botones">
                    <IonButton 
                      expand="block" 
                      color="primary" 
                      onClick={volverIntentar}
                    >
                      Intentar Nuevamente
                    </IonButton>
                    <IonButton 
                      expand="block" 
                      fill="outline" 
                      color="medium" 
                      onClick={volverCatalogo}
                    >
                      Volver al Catálogo
                    </IonButton>
                  </div>
                </>
              )}
              {estadoPago === null && (
                <p className="confirmacion-pago-mensaje">
                  Verificando el estado de tu pago...
                </p>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmacionPago;
