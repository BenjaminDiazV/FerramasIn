// src/pages/ListaProductos.tsx
import { IonContent, IonHeader, IonPage, IonTitle, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import React, { useState, useEffect } from 'react';
import { obtenerProductos } from '../producto.service';

interface Producto {
  id_prod: number;
  nombre: string;
  categoria: string;
  marca: string;
  cod_marca: string;
  precio: number;
  precio_original?: number;
  descuento?: number;
  ahorro?: number;
}

const ListaProductos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUserState, setLastUserState] = useState<string>('');
  const cargarProductos = async () => {
    setLoading(true);
    try {
      // Obtener información del usuario desde el objeto global
      const userInfo = (window as any).userInfo;
      const emailUsuario = userInfo?.isLoggedIn ? userInfo.userEmail : undefined;
      
      console.log('DEBUG Frontend: Estado del usuario:', userInfo);
      console.log('DEBUG Frontend: Email para productos:', emailUsuario);
      
      const data = await obtenerProductos(emailUsuario);
      console.log('DEBUG Frontend: Productos recibidos:', data);
      setProductos(data);
    } catch (err: any) {
      setError('Error al cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);
  // Escuchar cambios en el estado del usuario para recargar productos
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUserInfo = (window as any).userInfo;
      const currentUserState = JSON.stringify(currentUserInfo || {});
      
      if (currentUserState !== lastUserState) {
        console.log('DEBUG: Estado del usuario cambió, recargando productos');
        setLastUserState(currentUserState);
        cargarProductos();
      }
    }, 1000); // Verificar cada segundo

    return () => clearInterval(interval);
  }, [lastUserState]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonTitle>Cargando Productos...</IonTitle>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>Cargando la lista de productos...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonHeader>
          <IonTitle>Error</IonTitle>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>{error}</p>
        </IonContent>
      </IonPage>
    );
  }
  return (
    <IonPage>
      <IonHeader>
        <IonTitle>Lista de Productos</IonTitle>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '16px' }}>
          <IonButton 
            expand="block" 
            fill="outline" 
            onClick={() => {
              console.log('DEBUG: Recargando productos manualmente');
              cargarProductos();
            }}
          >
            🔄 Recargar Productos
          </IonButton>
          
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            Estado actual: {(window as any).userInfo?.isLoggedIn ? 
              `Logueado como ${(window as any).userInfo?.userEmail}` : 
              'No logueado'}
          </div>
        </div>
        
        <IonList>
          {productos.map((producto) => (
            <IonItem key={producto.id_prod}>
              <IonLabel>
                <h2>{producto.nombre}</h2>
                <p>Categoría: {producto.categoria}</p>
                <p>Marca: {producto.marca}</p>
                {producto.descuento ? (
                  <div>
                    <p style={{ textDecoration: 'line-through', color: '#888' }}>
                      Precio regular: ${producto.precio_original}
                    </p>
                    <p style={{ color: 'red', fontWeight: 'bold' }}>
                      Precio con descuento ({producto.descuento}%): ${producto.precio}
                    </p>
                    <p style={{ color: 'green' }}>
                      ¡Ahorras: ${producto.ahorro}!
                    </p>
                  </div>
                ) : (
                  <p>Precio: ${producto.precio}</p>
                )}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ListaProductos;