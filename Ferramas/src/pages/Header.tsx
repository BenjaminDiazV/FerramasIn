import React, { useState } from "react";
import { IonIcon, IonAlert, IonToast, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput } from "@ionic/react";
import { personOutline, logInOutline } from "ionicons/icons";
import axios from "axios";
import "./Home.css";
import { useHistory } from "react-router-dom";

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
  const [formNombre, setFormNombre] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const history = useHistory();
  
  // Cargar estado del usuario desde localStorage al inicializar
  React.useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo);
        if (userInfo.isLoggedIn) {
          setIsLoggedIn(userInfo.isLoggedIn);
          setUserName(userInfo.userName);
          setUserEmail(userInfo.userEmail);
          console.log('DEBUG: Estado de usuario restaurado desde localStorage:', userInfo);
        }
      } catch (error) {
        console.error('Error al cargar estado del usuario:', error);
        localStorage.removeItem('userInfo'); // Limpiar si hay datos corruptos
      }
    }
  }, []);
  
  // Función para obtener el estado del usuario (para usar en otros componentes)
  const getUserInfo = () => ({
    isLoggedIn,
    userName,
    userEmail
  });

  // Función para guardar el estado del usuario en localStorage
  const saveUserToLocalStorage = (userInfo: any) => {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      console.log('DEBUG: Estado de usuario guardado en localStorage:', userInfo);
    } catch (error) {
      console.error('Error al guardar estado del usuario en localStorage:', error);
    }
  };

  // Actualizar la información del usuario globalmente solo cuando cambie el estado
  React.useEffect(() => {
    const userInfo = getUserInfo();
    (window as any).userInfo = userInfo;
    
    // Guardar en localStorage cuando cambie el estado
    saveUserToLocalStorage(userInfo);
    
    // Disparar evento personalizado para notificar cambios
    const userChangeEvent = new CustomEvent('userInfoChanged', {
      detail: userInfo
    });
    window.dispatchEvent(userChangeEvent);
    
    // Solo hacer log cuando hay cambios significativos
    if (isLoggedIn) {
      console.log('DEBUG: Usuario logueado actualizado:', userInfo);
    }
  }, [isLoggedIn, userName, userEmail]); // Solo se ejecuta cuando estos valores cambian
  const showToastMessage = (message: string, color: string = "success") => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };
  const catalogo = () => {
    history.push("/catalogo"); // Navega a la ruta de la lista de productos
  };

  return (
    <header className="ferramas-header">
      <img
        src="/logo_ferramas1.png"
        alt="Logo Ferrama"
        width="200"
        className="ferramas-header-logo"
      ></img>
      <div style={{ display: "flex", gap: "10px" }}>
        <button className="ferramas-login-btn">
          Nosotros
        </button>
        <button className="ferramas-login-btn" onClick={catalogo}>
          Catálogo
        </button>
        <button className="ferramas-login-btn">
          Contacto
        </button>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        {!isLoggedIn ? (
          <>
            <button
              className="ferramas-login-btn"
              onClick={() => setShowLoginAlert(true)}
            >
              <IonIcon icon={logInOutline} className="ferramas-login-icon" />
              Iniciar Sesión
            </button>
            <button
              className="ferramas-login-btn"
              onClick={() => setShowSubscribeAlert(true)}
            >
              <IonIcon icon={personOutline} className="ferramas-login-icon" />
              ¡Suscríbete!
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "white" }}>Hola, {userName}</span>
            <button
              className="ferramas-login-btn"
              onClick={() => {
                setIsLoggedIn(false);
                setUserName("");
                setUserEmail("");
                // Limpiar localStorage al cerrar sesión
                localStorage.removeItem('userInfo');
                console.log('DEBUG: Sesión cerrada y localStorage limpiado');
                showToastMessage("Sesión cerrada correctamente");
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
      {/* Modal personalizado para Login */}
      <IonModal isOpen={showLoginAlert} onDidDismiss={() => {
        setShowLoginAlert(false);
        setLoginEmail("");
        setLoginPassword("");
      }}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Iniciar Sesión</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p style={{ marginBottom: "20px", textAlign: "center", color: "#666" }}>
            Ingresa con tu cuenta para acceder a todos los beneficios.
          </p>
          
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={loginEmail}
              placeholder="Ingrese su email"
              onIonInput={(e) => setLoginEmail(e.detail.value!)}
              clearInput
            />
          </IonItem>
          
          <IonItem>
            <IonLabel position="stacked">Contraseña</IonLabel>
            <IonInput
              type="password"
              value={loginPassword}
              placeholder="Ingrese su contraseña"
              onIonInput={(e) => setLoginPassword(e.detail.value!)}
              clearInput
            />
          </IonItem>
          
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <IonButton
              expand="block"
              onClick={async () => {
                console.log("DEBUG: Valores del login personalizado:");
                console.log("- Email:", `'${loginEmail}' (longitud: ${loginEmail.length})`);
                console.log("- Password:", `'${loginPassword}' (longitud: ${loginPassword.length})`);

                // Validaciones
                const email = loginEmail.trim();
                const password = loginPassword.trim();

                if (email.length === 0) {
                  showToastMessage("Por favor, ingrese su email", "warning");
                  return;
                }

                if (password.length === 0) {
                  showToastMessage("Por favor, ingrese su contraseña", "warning");
                  return;
                }

                // Validación de email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                  showToastMessage("Por favor, ingrese un email válido", "warning");
                  return;
                }

                console.log("DEBUG: Validaciones de login OK, procediendo a iniciar sesión");

                try {
                  const response = await axios.post(
                    "http://localhost:5000/usuarios/login",
                    {
                      email: email,
                      password: password,
                    }
                  );
                  
                  console.log("DEBUG: Respuesta de login:", response.data);
                  
                  if (response.data) {
                    setIsLoggedIn(true);
                    setUserName(response.data.nombre || response.data.email);
                    setUserEmail(response.data.email);
                    console.log("DEBUG: Usuario logueado exitosamente:", response.data);
                    
                    // Cerrar modal y limpiar formulario
                    setShowLoginAlert(false);
                    setLoginEmail("");
                    setLoginPassword("");
                    
                    showToastMessage("Inicio de sesión exitoso");
                  }
                } catch (error: any) {
                  console.error("Error al iniciar sesión:", error);
                  showToastMessage(
                    "Error al iniciar sesión. Verifique sus credenciales.",
                    "danger"
                  );
                }
              }}
            >
              Iniciar Sesión
            </IonButton>
            
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => {
                setShowLoginAlert(false);
                setLoginEmail("");
                setLoginPassword("");
                setShowCreateUserAlert(true);
              }}
            >
              Crear Usuario
            </IonButton>
            
            <IonButton
              expand="block"
              fill="clear"
              color="medium"
              onClick={() => {
                setShowLoginAlert(false);
                setLoginEmail("");
                setLoginPassword("");
              }}
            >
              Cancelar
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
      {/* Alert para Suscripción (solo email) */}
      <IonAlert
        isOpen={showSubscribeAlert}
        onDidDismiss={() => setShowSubscribeAlert(false)}
        header={"Suscribirse al Newsletter"}
        subHeader={"Solo recibirás noticias y ofertas por email. Para descuentos del 15%, debes registrarte con cuenta completa."}
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
              // Validación frontend para campos vacíos
              if (!data.email) {
                showToastMessage(
                  "Por favor, ingrese su email.",
                  "warning"
                );
                return false; // Mantiene el alert abierto
              }

              // Validación adicional para campos con solo espacios
              if (data.email.trim() === "") {
                showToastMessage(
                  "El email no puede estar vacío o contener solo espacios.",
                  "warning"
                );
                return false; // Mantiene el alert abierto
              }

              // Validación básica de email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(data.email.trim())) {
                showToastMessage(
                  "Por favor, ingrese un email válido.",
                  "warning"
                );
                return false; // Mantiene el alert abierto
              }

              setShowSubscribeAlert(false);
              try {
                const response = await axios.post(
                  "http://localhost:5000/usuarios/suscribir",
                  {
                    email: data.email.trim(),
                  }
                );

                if (response.data) {
                  showToastMessage("Suscripción exitosa");
                }
              } catch (error) {
                console.error("Error al suscribirse:", error);
                showToastMessage(
                  "Error al suscribirse. Intente nuevamente.",
                  "danger"
                );
              }
            },
          },
        ]}
      />
      {/* Modal personalizado para Crear Usuario */}
      <IonModal isOpen={showCreateUserAlert} onDidDismiss={() => {
        setShowCreateUserAlert(false);
        setFormNombre("");
        setFormEmail("");
        setFormPassword("");
      }}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Registrarse para Descuentos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p style={{ marginBottom: "20px", textAlign: "center", color: "#666" }}>
            Crea una cuenta completa con email y contraseña para obtener 15% de descuento en todos los productos.
          </p>
          
          <IonItem>
            <IonLabel position="stacked">Nombre</IonLabel>
            <IonInput
              value={formNombre}
              placeholder="Ingrese su nombre"
              onIonInput={(e) => setFormNombre(e.detail.value!)}
              clearInput
            />
          </IonItem>
          
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={formEmail}
              placeholder="Ingrese su email"
              onIonInput={(e) => setFormEmail(e.detail.value!)}
              clearInput
            />
          </IonItem>
          
          <IonItem>
            <IonLabel position="stacked">Contraseña</IonLabel>
            <IonInput
              type="password"
              value={formPassword}
              placeholder="Ingrese su contraseña (mín. 6 caracteres)"
              onIonInput={(e) => setFormPassword(e.detail.value!)}
              clearInput
            />
          </IonItem>
          
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            <IonButton
              expand="block"
              fill="clear"
              color="medium"
              onClick={() => {
                setShowCreateUserAlert(false);
                setFormNombre("");
                setFormEmail("");
                setFormPassword("");
              }}
            >
              Cancelar
            </IonButton>
            
            <IonButton
              expand="block"
              onClick={async () => {
                console.log("DEBUG: Valores del formulario personalizado:");
                console.log("- Nombre:", `'${formNombre}' (longitud: ${formNombre.length})`);
                console.log("- Email:", `'${formEmail}' (longitud: ${formEmail.length})`);
                console.log("- Password:", `'${formPassword}' (longitud: ${formPassword.length})`);

                // Validaciones
                const nombre = formNombre.trim();
                const email = formEmail.trim();
                const password = formPassword.trim();

                if (nombre.length === 0) {
                  showToastMessage("Por favor, ingrese su nombre", "warning");
                  return;
                }

                if (email.length === 0) {
                  showToastMessage("Por favor, ingrese su email", "warning");
                  return;
                }

                if (password.length === 0) {
                  showToastMessage("Por favor, ingrese su contraseña", "warning");
                  return;
                }

                if (password.length < 6) {
                  showToastMessage("La contraseña debe tener al menos 6 caracteres", "warning");
                  return;
                }

                // Validación de email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                  showToastMessage("Por favor, ingrese un email válido", "warning");
                  return;
                }

                console.log("DEBUG: Todas las validaciones OK, procediendo a crear usuario");
                
                // Cerrar modal y limpiar formulario
                setShowCreateUserAlert(false);
                setFormNombre("");
                setFormEmail("");
                setFormPassword("");

                try {
                  console.log("DEBUG: Enviando datos al backend:");
                  console.log("- Nombre:", nombre);
                  console.log("- Email:", email);
                  console.log("- Password length:", password.length);
                  
                  const response = await axios.post(
                    "http://localhost:5000/usuarios/registrar",
                    {
                      nombre: nombre,
                      email: email,
                      password: password,
                    }
                  );

                  console.log("DEBUG: Respuesta completa del backend:", response);
                  console.log("DEBUG: Datos de respuesta:", response.data);
                  
                  if (response.status === 201 && response.data) {
                    showToastMessage(
                      "¡Cuenta registrada exitosamente! Ahora puedes iniciar sesión y obtener 15% de descuento en todos los productos.",
                      "success"
                    );
                  } else {
                    showToastMessage(
                      "Error: Respuesta inesperada del servidor",
                      "danger"
                    );
                  }
                } catch (error: any) {
                  console.error("ERROR completo al crear usuario:", error);
                  console.error("ERROR respuesta:", error.response);
                  console.error("ERROR data:", error.response?.data);
                  
                  const errorMessage = error.response?.data?.error || 
                                     error.response?.data?.message || 
                                     "Error desconocido al crear usuario";
                  
                  showToastMessage(
                    `Error: ${errorMessage}`,
                    "danger"
                  );
                }
              }}
            >
              Crear Usuario
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
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
