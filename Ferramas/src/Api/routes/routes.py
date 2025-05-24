from flask import Blueprint, request, jsonify
from api.services import producto_service
from api.services.dolar_service import DolarService

producto_bp = Blueprint('productos', __name__, url_prefix='/productos')
dolar_service = DolarService()

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