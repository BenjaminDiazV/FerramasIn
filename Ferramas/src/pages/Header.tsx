import React, { useState } from "react";
import { IonIcon, IonAlert } from "@ionic/react";
import { personOutline } from "ionicons/icons";
import axios from "axios";
import "./Home.css";

const Header: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <header className="ferramas-header">
      <img
        src="/logo_ferramas1.png"
        alt="Logo Ferrama"
        width="200"
        className="ferramas-header-logo"
      ></img>

      <button className="ferramas-login-btn" onClick={() => setShowAlert(true)}>
        <IonIcon icon={personOutline} className="ferramas-login-icon" />
        ¡Subcribete!
      </button>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={"Suscribirse"}
        inputs={[
          {
            name: "email",
            type: "text",
            placeholder: "Ingrese su email",
          },
        ]}
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
            handler: () => setShowAlert(false),
          },
          {
            text: "Enviar",
            handler: async (data) => {
              setShowAlert(false);
              try {
                await axios.post("http://localhost:5000/usuarios/registrar", {
                  email: data.email,
                });
                
              } catch (error) {
                
              }
            },
          },
        ]}
      />
    </header>
  );
};

export default Header;
