import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Ajusta el path para importar los módulos correctamente
src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Ferramas/src'))
sys.path.insert(0, src_path)

from api.services import producto_service
from api.services.webpay_service import webpayService

class ProductoMock:
    def __init__(self, id_prod, nombre, categoria, marca, cod_marca, precio):
        self.id_prod = id_prod
        self.nombre = nombre
        self.categoria = categoria
        self.marca = marca
        self.cod_marca = cod_marca
        self.precio = precio

@patch('api.services.producto_service.Producto', side_effect=ProductoMock)
@patch('api.services.producto_service.mysql')
class TestSimulacionCompra(unittest.TestCase):

    @patch('api.services.webpay_service.WebpayAPI.get_transaction')
    def test_compra_exitosa(self, mock_get_transaction, mock_mysql, mock_producto):
        # Simula productos existentes
        mock_cursor = MagicMock()
        mock_cursor.fetchone.side_effect = [
            (1, 'Prod1', 'Cat1', 'Marca1', 'CM1', 1000),
            (2, 'Prod2', 'Cat2', 'Marca2', 'CM2', 2000),
        ]
        mock_mysql.connection.cursor.return_value = mock_cursor

        # Simula respuesta exitosa de Webpay
        mock_transaction = MagicMock()
        mock_transaction.create.return_value = {'url': 'http://webpay/success', 'token': 'tok123'}
        mock_get_transaction.return_value = mock_transaction

        service = webpayService()
        result = service.iniciar_pago(3000)
        print("Compra exitosa:", result)
        print()
        self.assertEqual(result['url'], 'http://webpay/success')
        self.assertEqual(result['token'], 'tok123')

    @patch('api.services.webpay_service.WebpayAPI.get_transaction')
    def test_compra_fallida(self, mock_get_transaction, mock_mysql, mock_producto):
        # Simula productos existentes
        mock_cursor = MagicMock()
        mock_cursor.fetchone.side_effect = [
            (1, 'Prod1', 'Cat1', 'Marca1', 'CM1', 1000),
            (2, 'Prod2', 'Cat2', 'Marca2', 'CM2', 2000),
        ]
        mock_mysql.connection.cursor.return_value = mock_cursor

        # Simula excepción en Webpay
        mock_transaction = MagicMock()
        mock_transaction.create.side_effect = Exception("Error Webpay")
        mock_get_transaction.return_value = mock_transaction

        service = webpayService()
        with self.assertRaises(Exception):
            service.iniciar_pago(3000)
        print("Compra fallida: excepción lanzada correctamente")
        print()

    def test_no_productos_en_carrito(self, mock_mysql, mock_producto):
        # Simula que no hay productos en el carrito (fetchone retorna None)
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_mysql.connection.cursor.return_value = mock_cursor

        # Simula flujo de routes.py para crear_transaccion
        product_ids = []
        total_amount = 0
        productos = [producto_service.obtener_producto_por_id(id_prod) for id_prod in product_ids]
        for producto in productos:
            if producto:
                total_amount += producto.precio

        print("No hay productos, Total amount con carrito vacío:", total_amount)
        print()
        self.assertEqual(total_amount, 0)

if __name__ == '__main__':
    unittest.main()