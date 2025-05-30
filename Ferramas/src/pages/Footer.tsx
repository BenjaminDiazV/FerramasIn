import { IonFooter, IonToolbar, IonTitle, IonIcon } from "@ionic/react";
import {
  logoFacebook,
  logoInstagram,
  logoTwitter,
  logoWhatsapp,
} from "ionicons/icons";
import React from "react";
import "./Home.css";

const Footer: React.FC = () => (
  <IonFooter>
    <IonToolbar className="ferramas-footer-toolbar">
      
      <div className="ferramas-footer-content">
        <IonTitle className="ferramas-footer-title">
          © {new Date().getFullYear()} Ferramas | Síguenos:
        </IonTitle>
        <div className="ferramas-footer-social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <IonIcon icon={logoFacebook} />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <IonIcon icon={logoInstagram} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <IonIcon icon={logoTwitter} />
          </a>
          <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer">
            <IonIcon icon={logoWhatsapp} />
          </a>
        </div>
      </div>
    </IonToolbar>
  </IonFooter>
);

export default Footer;