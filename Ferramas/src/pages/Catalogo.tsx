import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonButton,
  IonToolbar,
  IonAlert
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import "./Home.css";
import "./Carrito.css";
import { iniciarPago } from "../webpay.service";

import Footer from "./Footer";
import Header from "./Header";
import { car } from "ionicons/icons";

interface Producto {
  id_prod: number;
  nombre: string;
  categoria: string;
  marca: string;
  precio: number;
  precio_dolar?: number;
  precio_original?: number;
  descuento?: number;
  ahorro?: number;
}

const ListaProductos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mostrarDolares, setMostrarDolares] = useState(false);
  const [categorias, setCategoria] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  const [carrito, setCarrito] = useState<Producto[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const history = useHistory();
  const [showTransferAlert, setShowTransferAlert] = useState(false);

  const datosTransferencia = `
Banco: Banco Ejemplo
Cuenta: 123456789
Tipo: Cuenta Corriente
Nombre: Ferramas Ltda.
RUT: 12.345.678-9
Correo: pagos@ferramas.cl`;

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  // useEffect para escuchar cambios en el estado del usuario
  useEffect(() => {
    const handleUserChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const userInfo = customEvent?.detail || (window as any).userInfo;
      
      // Recargar productos cuando cambie el estado del usuario
      if (mostrarDolares) {
        cargarProductosEnDolares(categoriaSeleccionada);
      } else {
        cargarProductos(categoriaSeleccionada);
      }
    };

    // Escuchar eventos personalizados de cambio de usuario
    window.addEventListener('userInfoChanged', handleUserChange);

    return () => {
      window.removeEventListener('userInfoChanged', handleUserChange);
    };
  }, [mostrarDolares, categoriaSeleccionada]);

  const cargarCategorias = async () => {
    const res = await axios.get("http://localhost:5000/productos/");
    const cate = Array.from(
      new Set(res.data.map((p: Producto) => p.categoria))
    );
    setCategoria(cate as string[]);
  };

  const cargarProductos = async (categoria?: string) => {
    let url = "http://localhost:5000/productos/";
    if (categoria && categoria !== "") {
      url = `http://localhost:5000/productos/${encodeURIComponent(categoria)}`;
    }
    
    // Agregar email del usuario para descuentos
    const userInfo = (window as any).userInfo;
    const emailUsuario = userInfo?.isLoggedIn ? userInfo.userEmail : undefined;
    
    if (emailUsuario) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}email=${encodeURIComponent(emailUsuario)}`;
    }
    
    const res = await axios.get(url);
    setProductos(res.data);
    setMostrarDolares(false);
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoria = e.target.value;
    setCategoriaSeleccionada(categoria);
    if (mostrarDolares) {
      cargarProductosEnDolares(categoria);
    } else {
      cargarProductos(categoria);
    }
  };

  const cargarProductosEnDolares = async (categoria?: string) => {
    let url = "http://localhost:5000/productos/en_dolares";
    if (categoria && categoria !== "") {
      url += `?categoria=${encodeURIComponent(categoria)}`;
    }
    
    // Agregar email del usuario para descuentos
    const userInfo = (window as any).userInfo;
    const emailUsuario = userInfo?.isLoggedIn ? userInfo.userEmail : undefined;
    
    if (emailUsuario) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}email=${encodeURIComponent(emailUsuario)}`;
    }
    
    const res = await axios.get(url);
    setProductos(res.data);
    setMostrarDolares(true);
    
    // Actualizar productos en carrito con precios en dólares
    actualizarCarritoConDolares(res.data);
  };

  const actualizarCarritoConDolares = (productosDolares: Producto[]) => {
    const carritoActualizado = carrito.map(itemCarrito => {
      const productoConDolares = productosDolares.find(p => p.id_prod === itemCarrito.id_prod);
      if (productoConDolares) {
        return {
          ...itemCarrito,
          precio_dolar: productoConDolares.precio_dolar
        };
      }
      return itemCarrito;
    });
    setCarrito(carritoActualizado);
  };

  const actualizarCarritoConPesos = async () => {
    // Recargar productos originales para obtener precios en pesos
    let url = "http://localhost:5000/productos/";
    if (categoriaSeleccionada && categoriaSeleccionada !== "") {
      url = `http://localhost:5000/productos/${encodeURIComponent(categoriaSeleccionada)}`;
    }
    
    // Agregar email del usuario para descuentos
    const userInfo = (window as any).userInfo;
    const emailUsuario = userInfo?.isLoggedIn ? userInfo.userEmail : undefined;
    
    if (emailUsuario) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}email=${encodeURIComponent(emailUsuario)}`;
    }
    
    const res = await axios.get(url);
    
    // Actualizar productos en carrito con precios en pesos
    const carritoActualizado = carrito.map(itemCarrito => {
      const productoConPesos = res.data.find((p: Producto) => p.id_prod === itemCarrito.id_prod);
      if (productoConPesos) {
        return {
          ...itemCarrito,
          precio: productoConPesos.precio,
          precio_original: productoConPesos.precio_original,
          descuento: productoConPesos.descuento,
          ahorro: productoConPesos.ahorro
        };
      }
      return itemCarrito;
    });
    setCarrito(carritoActualizado);
  };

  const handleToggle = async () => {
    if (mostrarDolares) {
      await cargarProductos(categoriaSeleccionada);
      await actualizarCarritoConPesos();
    } else {
      await cargarProductosEnDolares(categoriaSeleccionada);
    }
  };

  // Funciones del carrito
  const agregarAlCarrito = (producto: Producto) => {
    const productoExiste = carrito.find(item => item.id_prod === producto.id_prod);
    if (!productoExiste) {
      setCarrito([...carrito, producto]);
    }
  };

  const eliminarDelCarrito = (id_prod: number) => {
    setCarrito(carrito.filter(item => item.id_prod !== id_prod));
  };

  const estaEnCarrito = (id_prod: number) => {
    return carrito.some(item => item.id_prod === id_prod);
  };

  const calcularTotal = () => {
    return carrito.reduce((total, producto) => {
      const precio = mostrarDolares && producto.precio_dolar 
        ? producto.precio_dolar 
        : producto.precio;
      return total + precio;
    }, 0).toFixed(2);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  // Cerrar carrito con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mostrarCarrito) {
        setMostrarCarrito(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mostrarCarrito]);

  const iniciarPagoWebpay = async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío. Agregue productos antes de proceder al pago.");
      return;
    }

    const productIds = carrito.map((producto) => producto.id_prod);
    console.log("DEBUG: IDs de productos para Webpay:", productIds);
    console.log("DEBUG: Productos en carrito:", carrito);

    try {
      console.log("DEBUG: Enviando solicitud a Webpay...");
      const response = await axios.post(
        "http://localhost:5000/webpay/crear_transaccion",
        {
          product_ids: productIds,
        }
      );
      
      console.log("DEBUG: Respuesta de Webpay:", response.data);
      
      if (response.data && response.data.url && response.data.token) {
        const webpayUrl = response.data.url + "?token_ws=" + response.data.token;
        console.log("DEBUG: Redirigiendo a:", webpayUrl);
        window.location.href = webpayUrl;
      } else {
        console.error("ERROR: No se recibió la URL o el token de Webpay.", response.data);
        alert("Error: No se pudo iniciar el pago. Revise la consola para más detalles.");
      }
    } catch (error: any) {
      console.error("ERROR al iniciar el pago con Webpay:", error);
      console.error("Detalles del error:", error.response?.data);
      alert(`Error al conectar con Webpay: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <IonPage>
      <Header />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lista de Productos</IonTitle>
          
          <IonButton
            slot="end"
            fill="clear"
            onClick={() => setMostrarCarrito(!mostrarCarrito)}
            className="ferramas-btn-circular"
            shape="round"
          >
            🛒 ({carrito.length})
          </IonButton>

          <IonButton
            slot="end"
            color="success"
            onClick={() => history.push("/agregar_producto")}
            className="ferramas-btn-circular success"
            shape="round"
          >
            +
          </IonButton>

          <IonButton
            slot="end"
            onClick={handleToggle}
            className={`ferramas-btn-circular ${
              mostrarDolares ? "usd" : "clp"
            }`}
            shape="round"
          >
            {mostrarDolares ? "USD" : "CLP"}
          </IonButton>

          <IonButton
            slot="end"
            fill="outline"
            color="secondary"
            onClick={() => {
              if (mostrarDolares) {
                cargarProductosEnDolares(categoriaSeleccionada);
              } else {
                cargarProductos(categoriaSeleccionada);
              }
            }}
            shape="round"
          >
            🔄
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ferramas-content">
        {/* Indicador de usuario logueado */}
        {(() => {
          const userInfo = (window as any).userInfo;
          if (userInfo?.isLoggedIn) {
            return (
              <div className="usuario-registrado-info">
                ✨ ¡Hola {userInfo.userName || userInfo.userEmail}! Tienes 15% de descuento en todos los productos (cuenta registrada completa)
              </div>
            );
          } else {
            return (
              <div className="mensaje-registro-completo">
                💡 Para obtener 15% de descuento en todos los productos debes:
                <br />
                1️⃣ Registrarte con email y contraseña (no solo suscribirse)
                <br />
                2️⃣ Iniciar sesión con tu cuenta
              </div>
            );
          }
        })()}

        {/* Selector de categoría */}
        <div className="categoria-selector">
          <select
            value={categoriaSeleccionada}
            onChange={handleCategoriaChange}
            className="categoria-select"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cate) => (
              <option key={cate} value={cate}>
                {cate}
              </option>
            ))}
          </select>
        </div>

        <div className="productos-grid">
          {productos.map((producto) => (
            <div key={producto.id_prod} className="producto-card">
              <IonCard className="producto-card-container">
                {estaEnCarrito(producto.id_prod) && (
                  <div className="producto-check-mark">✓</div>
                )}
                {producto.descuento && (
                  <div className="descuento-badge">
                    -{producto.descuento}%
                  </div>
                )}
                <IonCardHeader>
                  <IonCardTitle>{producto.nombre}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="producto-info">
                    <strong>Categoría:</strong> {producto.categoria}
                  </p>
                  <p className="producto-info">
                    <strong>Marca:</strong> {producto.marca}
                  </p>
                  
                  {/* Mostrar precios con descuentos */}
                  {producto.descuento && !mostrarDolares ? (
                    <div className="producto-precios">
                      <p className="precio-original-tachado">
                        Precio regular: ${producto.precio_original} CLP
                      </p>
                      <div className="precio-con-descuento-destacado">
                        ¡CON DESCUENTO! ${producto.precio} CLP
                      </div>
                      <div className="ahorro-destacado">
                        ¡Ahorras ${producto.ahorro}!
                      </div>
                    </div>
                  ) : producto.descuento && mostrarDolares ? (
                    <div className="producto-precios">
                      <p className="precio-original-tachado">
                        Precio regular: ${((producto.precio_original || 0) / 850).toFixed(2)} USD
                      </p>
                      <div className="precio-con-descuento-destacado">
                        ¡CON DESCUENTO! ${producto.precio_dolar} USD
                      </div>
                      <div className="ahorro-destacado">
                        ¡Ahorras ${((producto.ahorro || 0) / 850).toFixed(2)} USD!
                      </div>
                    </div>
                  ) : (
                    <p className="producto-info">
                      <strong>Precio:</strong>{" "}
                      {mostrarDolares && producto.precio_dolar !== undefined
                        ? `$${producto.precio_dolar} USD`
                        : `$${producto.precio} CLP`}
                    </p>
                  )}

                  {/* Botones del carrito */}
                  <div className="producto-botones">
                    {estaEnCarrito(producto.id_prod) ? (
                      <IonButton
                        expand="block"
                        fill="outline"
                        color="danger"
                        onClick={() => eliminarDelCarrito(producto.id_prod)}
                      >
                        🗑️ Quitar del carrito
                      </IonButton>
                    ) : (
                      <IonButton
                        expand="block"
                        color="primary"
                        onClick={() => agregarAlCarrito(producto)}
                      >
                        🛒 Agregar al carrito
                      </IonButton>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          ))}
        </div>

        {/* Carrito lateral - siempre en DOM para animaciones */}
        <>
          {/* Overlay */}
          <div 
            className={`carrito-overlay ${mostrarCarrito ? 'visible' : ''}`}
            onClick={() => setMostrarCarrito(false)}
          />
          
          {/* Panel del carrito */}
          <div className={`carrito-panel ${mostrarCarrito ? 'abierto' : ''}`}>
            <div className="carrito-header">
              <span>🛒 Carrito ({carrito.length})</span>
              <button 
                className="carrito-cerrar"
                onClick={() => setMostrarCarrito(false)}
              >
                ×
              </button>
            </div>
            
            <div className="carrito-contenido">
              {carrito.length === 0 ? (
                <div className="carrito-vacio">
                  El carrito está vacío
                </div>
              ) : (
                <>
                  {carrito.map((producto) => (
                    <div key={producto.id_prod} className="carrito-item">
                      <div className="carrito-item-info">
                        <div className="carrito-item-nombre">{producto.nombre}</div>
                        <div className="carrito-item-detalles">
                          {producto.categoria} - {producto.marca}
                        </div>
                        <div className={`carrito-item-precio ${producto.descuento ? 'descuento' : ''}`}>
                          {producto.descuento && !mostrarDolares ? (
                            `$${producto.precio} CLP (${producto.descuento}% desc.)`
                          ) : (
                            mostrarDolares && producto.precio_dolar 
                              ? `$${producto.precio_dolar} USD` 
                              : `$${producto.precio} CLP`
                          )}
                        </div>
                      </div>
                      <IonButton
                        fill="clear"
                        color="danger"
                        onClick={() => eliminarDelCarrito(producto.id_prod)}
                      >
                        🗑️
                      </IonButton>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            {carrito.length > 0 && (
              <div className="carrito-footer">
                <div className="carrito-total">
                  Total: ${calcularTotal()} {mostrarDolares ? 'USD' : 'CLP'}
                </div>
                <div className="carrito-botones">
                  <IonButton
                    expand="block"
                    onClick={iniciarPagoWebpay}
                    className="webpay-button"
                  >
                    💳 Pagar con Webpay
                  </IonButton>
                  
                  <IonButton
                    expand="block"
                    color="secondary"
                    onClick={() => setShowTransferAlert(true)}
                  >
                    🏦 Transferencia bancaria
                  </IonButton>
                  
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="danger"
                    onClick={vaciarCarrito}
                  >
                    🗑️ Vaciar carrito
                  </IonButton>
                  
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="warning"
                    onClick={() => {
                      console.log("DEBUG: Estado del carrito:", carrito);
                      console.log("DEBUG: IDs para Webpay:", carrito.map(p => p.id_prod));
                      console.log("DEBUG: Total calculado:", calcularTotal());
                    }}
                  >
                    🔍 Debug
                  </IonButton>
                </div>
              </div>
            )}
          </div>
        </>

        {/* Botones de pago alternativos cuando el carrito no está visible */}
        {!mostrarCarrito && carrito.length > 0 && (
          <div className="pago-botones">
            <IonButton
              expand="full"
              onClick={iniciarPagoWebpay}
              className="webpay-button"
            >
              Ir a Pagar con Webpay ({carrito.length} productos)
            </IonButton>
            
            <IonButton
              expand="full"
              color="secondary"
              onClick={() => setShowTransferAlert(true)}
              style={{ marginTop: 12 }}
            >
              Ver datos de transferencia bancaria
            </IonButton>
          </div>
        )}

        {/* Mensaje cuando el carrito está vacío */}
        {carrito.length === 0 && (
          <div className="pago-mensaje-vacio">
            Agregue productos al carrito para proceder al pago
          </div>
        )}

        <IonAlert
          isOpen={showTransferAlert}
          onDidDismiss={() => setShowTransferAlert(false)}
          header="Datos de Transferencia Bancaria"
          message={`${datosTransferencia}`}
          buttons={[
            {
              text: "Cerrar",
              role: "cancel",
              handler: () => setShowTransferAlert(false),
            },
          ]}
          cssClass="transfer-alert"
        />
      </IonContent>
      <Footer />
    </IonPage>
  );
};

export default ListaProductos;
