import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Ajusta el path para importar los módulos correctamente
src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Ferramas/src'))
sys.path.insert(0, src_path)

from api.services import producto_service
from api.models.productos import Producto

class ProductoMock(Producto):
    def to_json(self):
        return {
            'id_prod': self.id_prod,
            'nombre': self.nombre,
            'categoria': self.categoria,
            'marca': self.marca,
            'cod_marca': self.cod_marca,
            'precio': self.precio
        }

@patch('api.services.producto_service.mysql')
@patch('api.services.producto_service.Producto', side_effect=ProductoMock)
class TestListarProductos(unittest.TestCase):

    def test_recuperar_todos_los_productos(self, mock_producto, mock_mysql):
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            (1, 'Prod1', 'Cat1', 'Marca1', 'CM1', 1000),
            (2, 'Prod2', 'Cat2', 'Marca2', 'CM2', 2000),
        ]
        mock_mysql.connection.cursor.return_value = mock_cursor

        productos = producto_service.obtener_todos_productos()
        print("Todos los productos:", [p.to_json() for p in productos])
        print()
        self.assertEqual(len(productos), 2)
        self.assertEqual(productos[0].nombre, 'Prod1')
        self.assertEqual(productos[1].nombre, 'Prod2')

    def test_recuperar_productos_por_categoria(self, mock_producto, mock_mysql):
        mock_cursor = MagicMock()
        # Solo productos de 'CatX', como lo haría el SQL real
        mock_cursor.fetchall.return_value = [
            (3, 'Prod3', 'CatX', 'MarcaX', 'CMX', 1500),
            (5, 'Prod5', 'CatX', 'MarcaY', 'CMY', 3500),
            (6, 'Prod6', 'CatY', 'MarcaZ', 'CMZ', 4000),
        ]
        mock_mysql.connection.cursor.return_value = mock_cursor

        productos = producto_service.obtener_producto_por_cat('CatX')
        print("Productos por categoría (CatX):", [p.to_json() for p in productos])
        print()
        
        # Verifica si hay productos de otra categoría y muestra un mensaje
        for p in productos:
            if p.categoria != 'CatX':
                print(f"ADVERTENCIA: Producto fuera de categoría: {p.to_json()}")
        print()

     # El test sigue igual
        for p in productos:
            self.assertEqual(p.categoria, 'CatX')
        nombres = [p.nombre for p in productos]
        self.assertIn('Prod3', nombres)
        self.assertIn('Prod5', nombres)
        self.assertNotIn('Prod6', nombres)  # Ahora explícitamente verificas que no esté

        self.assertEqual(len(productos), 2) 

    def test_no_hay_productos(self, mock_producto, mock_mysql):
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = []
        mock_mysql.connection.cursor.return_value = mock_cursor

        productos = producto_service.obtener_producto_por_cat('CatInexistente')
        print("Productos inexistentes:", [p.to_json() for p in productos])
        print()
        self.assertEqual(len(productos), 0)
        # Simula la respuesta del endpoint según tu routes.py
        if not productos:
            mensaje = {'message': 'Producto no encontrado'}
            status = 404
        else:
            mensaje = 'OK'
            status = 200
        self.assertEqual(mensaje, {'message': 'Producto no encontrado'})
        self.assertEqual(status, 404)

if __name__ == '__main__':
    unittest.main()