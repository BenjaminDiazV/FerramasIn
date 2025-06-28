import React, { useState } from "react";
import { IonIcon, IonAlert, IonToast } from "@ionic/react";
import { personOutline, logInOutline } from "ionicons/icons";
import axios from "axios";
import "./Home.css";

const Header: React.FC = () => {
  const [showSubscribeAlert, setShowSubscribeAlert] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showCreateUserAlert, setShowCreateUserAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("success");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  // Función para obtener el estado del usuario (para usar en otros componentes)
  const getUserInfo = () => ({
    isLoggedIn,
    userName,
    userEmail
  });
  // Actualizar la información del usuario globalmente cuando cambie el estado
  React.useEffect(() => {
    const userInfo = getUserInfo();
    (window as any).userInfo = userInfo;
    console.log('DEBUG: Actualizando userInfo global:', userInfo);
  }, [isLoggedIn, userName, userEmail]);
  const showToastMessage = (message: string, color: string = "success") => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  return (
    <header className="ferramas-header">
      <img
        src="/logo_ferramas1.png"
        alt="Logo Ferrama"
        width="200"
        className="ferramas-header-logo"
      ></img>

      <div style={{ display: 'flex', gap: '10px' }}>
        {!isLoggedIn ? (
          <>
            <button className="ferramas-login-btn" onClick={() => setShowLoginAlert(true)}>
              <IonIcon icon={logInOutline} className="ferramas-login-icon" />
              Iniciar Sesión
            </button>
            <button className="ferramas-login-btn" onClick={() => setShowSubscribeAlert(true)}>
              <IonIcon icon={personOutline} className="ferramas-login-icon" />
              ¡Suscríbete!
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'white' }}>Hola, {userName}</span>
            <button 
              className="ferramas-login-btn"            onClick={() => {
              setIsLoggedIn(false);
              setUserName("");
              setUserEmail("");
              showToastMessage("Sesión cerrada correctamente");
            }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>

      {/* Alert para Login */}
      <IonAlert
        isOpen={showLoginAlert}
        onDidDismiss={() => setShowLoginAlert(false)}
        header={"Iniciar Sesión"}
        inputs={[
          {
            name: "email",
            type: "email",
            placeholder: "Ingrese su email",
          },
          {
            name: "password",
            type: "password",
            placeholder: "Ingrese su contraseña",
          },
        ]}        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
            handler: () => setShowLoginAlert(false),
          },
          {
            text: "Crear Usuario",
            handler: () => {
              setShowLoginAlert(false);
              setShowCreateUserAlert(true);
            },
          },
          {
            text: "Iniciar Sesión",
            handler: async (data) => {
              setShowLoginAlert(false);
              try {
                const response = await axios.post("http://localhost:5000/usuarios/login", {
                  email: data.email,
                  password: data.password,
                });
                  if (response.data) {
                  setIsLoggedIn(true);
                  setUserName(response.data.nombre || response.data.email);
                  setUserEmail(response.data.email);
                  console.log('DEBUG: Usuario logueado:', response.data);
                  showToastMessage("Inicio de sesión exitoso");
                }
              } catch (error) {
                console.error('Error al iniciar sesión:', error);
                showToastMessage("Error al iniciar sesión. Verifique sus credenciales.", "danger");
              }
            },
          },
        ]}
      />      {/* Alert para Suscripción (solo email) */}
      <IonAlert
        isOpen={showSubscribeAlert}
        onDidDismiss={() => setShowSubscribeAlert(false)}
        header={"Suscribirse"}
        inputs={[
          {
            name: "email",
            type: "email",
            placeholder: "Ingrese su email",
          },
        ]}
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
            handler: () => setShowSubscribeAlert(false),
          },
          {
            text: "Suscribirse",
            handler: async (data) => {
              setShowSubscribeAlert(false);
              try {
                const response = await axios.post("http://localhost:5000/usuarios/suscribir", {
                  email: data.email,
                });
                
                if (response.data) {
                  showToastMessage("Suscripción exitosa");
                }
              } catch (error) {
                console.error('Error al suscribirse:', error);
                showToastMessage("Error al suscribirse. Intente nuevamente.", "danger");
              }
            },
          },
        ]}
      />

      {/* Alert para Crear Usuario */}
      <IonAlert
        isOpen={showCreateUserAlert}
        onDidDismiss={() => setShowCreateUserAlert(false)}
        header={"Crear Usuario"}
        inputs={[
          {
            name: "nombre",
            type: "text",
            placeholder: "Ingrese su nombre",
          },
          {
            name: "email",
            type: "email",
            placeholder: "Ingrese su email",
          },
          {
            name: "password",
            type: "password",
            placeholder: "Ingrese su contraseña",
          },
        ]}
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
            handler: () => setShowCreateUserAlert(false),
          },
          {
            text: "Crear Usuario",
            handler: async (data) => {
              setShowCreateUserAlert(false);
              try {
                const response = await axios.post("http://localhost:5000/usuarios/registrar", {
                  nombre: data.nombre,
                  email: data.email,
                  password: data.password,
                });
                
                if (response.data) {
                  showToastMessage("Usuario creado exitosamente. Ahora puede iniciar sesión.");
                }
              } catch (error) {
                console.error('Error al crear usuario:', error);
                showToastMessage("Error al crear usuario. Intente nuevamente.", "danger");
              }
            },
          },
        ]}
      />

      {/* Toast para mensajes */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
      />
    </header>
  );
};

export default Header;
