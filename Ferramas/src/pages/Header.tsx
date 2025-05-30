import React from "react";
import { IonIcon } from "@ionic/react";
import { logInOutline } from "ionicons/icons";
import "./Home.css";

const Header: React.FC = () => {
  return (
    <header className="ferramas-header">
      <img
        src="/logo_ferramas1.png"
        alt="Logo Ferrama"
        width="200"
        
    
        
        className="ferramas-header-logo"></img>
      
      <button className="ferramas-login-btn">
        <IonIcon icon={logInOutline} className="ferramas-login-icon" />
        Iniciar Sesión
      </button>
    </header>
  );
};

export default Header;
