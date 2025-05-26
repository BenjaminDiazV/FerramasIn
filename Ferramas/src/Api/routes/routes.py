from flask import Blueprint, request, jsonify, redirect
from api.services import producto_service
from api.services.dolar_service import DolarService

from api.services.webpay_service import webpayService


producto_bp = Blueprint('productos', __name__, url_prefix='/productos')
webpay_bp = Blueprint('webpay', __name__, url_prefix='/webpay')

dolar_service = DolarService()
webpay_service = webpayService()

@producto_bp.route('/', methods=['GET'])
def get_productos():
    productos = producto_service.obtener_todos_productos()
    return jsonify([producto.to_json() for producto in productos])

@producto_bp.route('/<int:id_prod>', methods=['GET'])
def get_producto(id_prod):
    producto = producto_service.obtener_producto_por_id(id_prod)
    if producto:
        return jsonify(producto.to_json())
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
    