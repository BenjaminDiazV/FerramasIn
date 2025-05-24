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