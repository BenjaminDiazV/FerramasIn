from flask import Blueprint, jsonify
from api.services import producto_service

producto_bp = Blueprint('productos', __name__, url_prefix='/productos')

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