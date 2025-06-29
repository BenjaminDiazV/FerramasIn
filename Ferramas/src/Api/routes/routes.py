from flask import Blueprint, request, jsonify, redirect
from api.services import producto_service
from api.services.dolar_service import DolarService

from api.services.webpay_service import webpayService

from api.services import usuario_service

usuario_bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')
producto_bp = Blueprint('productos', __name__, url_prefix='/productos')
webpay_bp = Blueprint('webpay', __name__, url_prefix='/webpay')

dolar_service = DolarService()
webpay_service = webpayService()

@producto_bp.route('/', methods=['GET'])
def get_productos():
    productos = producto_service.obtener_todos_productos()
    email_usuario = request.args.get('email')  # Obtener email del query parameter
    
    print(f"DEBUG: Email recibido en productos: {email_usuario}")
    
    productos_json = []
    for producto in productos:
        producto_dict = producto.to_json()
        
        # Verificar si el usuario tiene descuento
        if email_usuario:
            usuario = usuario_service.obtener_usuario_por_email(email_usuario)
            print(f"DEBUG: Usuario encontrado: {usuario}")
            if usuario:
                print(f"DEBUG: Usuario tiene contraseña: {usuario.password is not None}")
            
            if usuario and usuario.password:  # Usuario registrado con contraseña
                precio_original = producto_dict['precio']
                descuento = precio_original * 0.15  # 15% de descuento
                producto_dict['precio_original'] = precio_original
                producto_dict['precio'] = round(precio_original - descuento, 2)
                producto_dict['descuento'] = 15
                producto_dict['ahorro'] = round(descuento, 2)
                print(f"DEBUG: Aplicando descuento - Precio original: {precio_original}, Precio con descuento: {producto_dict['precio']}")
        
        productos_json.append(producto_dict)
    
    return jsonify(productos_json)

@producto_bp.route('/<categoria>', methods=['GET'])
def get_producto(categoria):
    productos = producto_service.obtener_producto_por_cat(categoria)
    if productos:
        return jsonify([p.to_json() for p in productos])
    return jsonify({'message': 'Producto no encontrado'}), 404

#agregar endpoint para obtener valor dolar
#https://mindicador.cl/api/dolar
#localhost:5000/productos/dolarvalor
@producto_bp.route('/dolarvalor', methods=['GET'])
def get_dolar():
    result = dolar_service.get_dolar_hoy()
    # Si es un objeto Dolar, conviértelo a dict
    if hasattr(result, 'to_dict'):
        return jsonify(result.to_dict())
    return jsonify(result)


#agregar endpoint para obtener productos en dolares
#localhost:5000/productos/en_dolares
@producto_bp.route('/en_dolares', methods=['GET'])
def get_productos_en_dolares():
    categoria = request.args.get('categoria')
    if categoria:
        productos = producto_service.obtener_producto_por_cat(categoria)
    else:
        productos = producto_service.obtener_todos_productos()
    dolar = dolar_service.get_dolar_hoy()
    if hasattr(dolar, 'valor'):
        valor_dolar = dolar.valor
    elif isinstance(dolar, dict) and 'valor' in dolar:
        valor_dolar = dolar['valor']
    else:
        return jsonify({'error': 'No se pudo obtener el valor del dólar'}), 500

    productos_dolares = []
    for producto in productos:
        producto_dict = producto.to_json()
        producto_dict['precio_dolar'] = round(producto_dict['precio'] / valor_dolar, 2)
        productos_dolares.append(producto_dict)
    return jsonify(productos_dolares)

### Endpoint para agregar un nuevo producto
@producto_bp.route('/agregar_producto', methods=['POST'])
def agregar_producto():
    data = request.get_json()
    nombre = data.get('nombre')
    categoria = data.get('categoria')
    marca = data.get('marca')
    precio = data.get('precio')

    if not all([nombre, categoria, marca, precio]):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400

    nuevo_producto = producto_service.crear_producto(nombre, categoria, marca, precio)
    if nuevo_producto:
        return jsonify(nuevo_producto.to_json()), 201
    else:
        return jsonify({'error': 'No se pudo crear el producto'}), 500
         
@webpay_bp.route('/crear_transaccion', methods=['POST'])  # Ahora es POST
def crear_transaccion():
    data = request.get_json()
    product_ids = data.get('product_ids', [])
    total_amount = 0

    if product_ids:
        productos = [producto_service.obtener_producto_por_id(id_prod) for id_prod in product_ids]
        for producto in productos:
            if producto:
                total_amount += producto.precio

    if total_amount > 0:
        transaction = webpay_service.iniciar_pago(total_amount) # Pasa el monto total
        return jsonify({'url': transaction['url'], 'token': transaction['token']})
    else:
        return jsonify({'error': 'No se seleccionaron productos o no se encontraron'}), 400

@webpay_bp.route('/confirmar_pago', methods=['GET', 'POST'])
def confirmar_transaccion():
    if request.method == 'POST':
        token = request.form.get("token_ws")
    else:  # Si es GET
        token = request.args.get("token_ws")

    if token:
        response = webpay_service.confirmar_pago(token)
        print("Respuesta de Webpay (Commit):", response)
        estado_pago = "exitoso" if response and response.get('status') == 'AUTHORIZED' else "fallido"
        # Redirigimos al frontend con el estado del pago como parámetro
        return redirect(f"http://localhost:8100/confirmacion-pago?estado={estado_pago}")
    else:
        return jsonify({"error": "No se recibió el token de Webpay"}), 400
    

#Endpoint para suscripción (solo email)
@usuario_bp.route('/suscribir', methods=['POST'])
def suscribir_usuario():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email requerido'}), 400
    
    # Verificar si el email ya existe
    usuario_existente = usuario_service.obtener_usuario_por_email(email)
    if usuario_existente:
        return jsonify({'message': 'El email ya está registrado'}), 200
    
    # Crear suscripción simple (sin contraseña)
    usuario = usuario_service.crear_suscripcion(email)
    if usuario:
        return jsonify({'message': 'Suscripción exitosa', 'email': email}), 201
    else:
        return jsonify({'error': 'No se pudo procesar la suscripción'}), 500

#Endpoint para registrar un nuevo usuario
@usuario_bp.route('/registrar', methods=['POST'])
def registrar_usuario():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    nombre = data.get('nombre')
    
    if not email:
        return jsonify({'error': 'Email requerido'}), 400
    
    # Verificar si el usuario ya existe
    usuario_existente = usuario_service.obtener_usuario_por_email(email)
    if usuario_existente:
        return jsonify({'error': 'El usuario ya existe'}), 400
    
    usuario = usuario_service.crear_usuario(None, email, password, nombre)
    if usuario:
        return jsonify(usuario.to_dict()), 201
    else:
        return jsonify({'error': 'No se pudo registrar el usuario'}), 500

#Endpoint para verificar descuento por email
@usuario_bp.route('/verificar_descuento/<email>', methods=['GET'])
def verificar_descuento(email):
    usuario = usuario_service.obtener_usuario_por_email(email)
    if usuario and usuario.password:  # Solo usuarios con contraseña tienen descuento
        return jsonify({'tiene_descuento': True, 'descuento': 15}), 200
    else:
        return jsonify({'tiene_descuento': False, 'descuento': 0}), 200

#Endpoint para login de usuario
@usuario_bp.route('/login', methods=['POST'])
def login_usuario():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email y contraseña requeridos'}), 400
    
    usuario = usuario_service.verificar_credenciales(email, password)
    if usuario:
        return jsonify(usuario.to_dict()), 200
    else:
        return jsonify({'error': 'Credenciales inválidas'}), 401
    