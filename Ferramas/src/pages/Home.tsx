import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonButton,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
} from "@ionic/react";
import React from "react";
import { useHistory } from "react-router-dom";
import { storefront, build, card, shield } from "ionicons/icons";
import "./Home.css";

import Footer from "./Footer";
import Header from "./Header";

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <Header />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ferramas - Tu Tienda de Herramientas</IonTitle>
          <IonButton
            slot="end"
            color="primary"
            onClick={() => history.push("/catalogo")}
            fill="outline"
          >
            Ver Catálogo
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ferramas-content">
        {/* Hero Section */}
        <div className="hero-section">
          <IonCard className="hero-card">
            <IonCardContent>
              <h1 className="hero-title">Bienvenido a Ferramas</h1>
              <p className="hero-subtitle">
                Tu tienda de confianza para herramientas y materiales de construcción
              </p>
              <IonButton
                expand="block"
                size="large"
                onClick={() => history.push("/catalogo")}
                className="hero-button"
              >
                <IonIcon icon={storefront} slot="start" />
                Explorar Productos
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="section-title">¿Por qué elegir Ferramas?</h2>
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonCard className="feature-card">
                  <IonCardHeader>
                    <IonIcon icon={build} className="feature-icon" />
                    <IonCardTitle>Calidad Garantizada</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Solo trabajamos con las mejores marcas y productos de alta calidad
                    para asegurar la durabilidad de tus herramientas.
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonCard className="feature-card">
                  <IonCardHeader>
                    <IonIcon icon={card} className="feature-icon" />
                    <IonCardTitle>Pagos Seguros</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Múltiples opciones de pago seguras: Webpay, transferencia bancaria
                    y más. Tu seguridad es nuestra prioridad.
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonCard className="feature-card">
                  <IonCardHeader>
                    <IonIcon icon={shield} className="feature-icon" />
                    <IonCardTitle>Soporte Técnico</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Nuestro equipo de expertos está disponible para ayudarte
                    a elegir las herramientas perfectas para tu proyecto.
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <IonCard className="cta-card">
            <IonCardContent>
              <h2 className="cta-title">¿Listo para comenzar?</h2>
              <p className="cta-subtitle">
                Descubre nuestra amplia selección de herramientas y materiales
              </p>
              <div className="cta-buttons">
                <IonButton
                  expand="block"
                  size="large"
                  onClick={() => history.push("/catalogo")}
                  className="cta-primary-button"
                >
                  Ver Catálogo Completo
                </IonButton>
                <IonButton
                  expand="block"
                  fill="outline"
                  size="large"
                  onClick={() => history.push("/agregar_producto")}
                  className="cta-secondary-button"
                >
                  Agregar Producto
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
      <Footer />
    </IonPage>
  );
};

export default Home;
