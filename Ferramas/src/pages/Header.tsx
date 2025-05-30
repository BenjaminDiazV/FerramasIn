import React from "react";
import { IonIcon } from "@ionic/react";
import { personOutline } from "ionicons/icons";
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
        <IonIcon icon={personOutline} className="ferramas-login-icon" />
        Subcribirse
      </button>
    </header>
  );
};

export default Header;
