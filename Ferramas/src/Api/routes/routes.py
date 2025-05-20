from flask import Blueprint, jsonify
from Api.services.product_service import ProductService

def register_routes(app, mysql):
    api_bp = Blueprint('Api', __name__)

    product_service = ProductService(mysql)

    @api_bp.route('/productos', methods=['GET'])
    def get_products():
        products = product_service.get_all_products()
        return jsonify(products)
    
    app.register_blueprint(api_bp)