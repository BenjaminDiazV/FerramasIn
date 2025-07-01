import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Agrega correctamente Ferramas/src al path
src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Ferramas/src'))
sys.path.insert(0, src_path)

from api.services.producto_service import obtener_todos_productos

class ProductoMock:
    def __init__(self, id_prod, nombre, categoria, marca, cod_marca, precio):
        self.id_prod = id_prod
        self.nombre = nombre
        self.categoria = categoria
        self.marca = marca
        self.cod_marca = cod_marca
        self.precio = precio
    def to_json(self):
        return {
            "id_prod": self.id_prod,
            "nombre": self.nombre,
            "categoria": self.categoria,
            "marca": self.marca,
            "cod_marca": self.cod_marca,
            "precio": self.precio
        }

def convertir_a_dolar(producto_dict, valor_dolar):
    # Simula la lógica del endpoint: convierte el precio a dólares
    return round(producto_dict['precio'] / valor_dolar, 2) if producto_dict['precio'] else 0

@patch('api.services.producto_service.mysql')
@patch('api.services.producto_service.Producto', side_effect=ProductoMock)
class TestProductosEnDolares(unittest.TestCase):
    def test_conversion_a_dolares(self, mock_producto, mock_mysql):
        # Simula los datos de la base de datos
        mock_cursor = MagicMock()
        mock_cursor.fetchall.return_value = [
            (1, 'Producto Valido', 'Cat', 'Marca', 'CM', 10000),
            (2, 'Producto Negativo', 'Cat', 'Marca', 'CM', -5000),
            (3, 'Producto Cero', 'Cat', 'Marca', 'CM', 0),
            (4, 'Producto Nulo', 'Cat', 'Marca', 'CM', None),
        ]
        mock_mysql.connection.cursor.return_value = mock_cursor

        productos = obtener_todos_productos()
        valor_dolar = 950  # Valor fijo para la prueba

        productos_dolares = []
        for p in productos:
            producto_dict = p.to_json()
            # Normalización de precio (igual que en tu backend)
            if producto_dict['precio'] is None or producto_dict['precio'] == 0:
                producto_dict['precio'] = 0
            elif producto_dict['precio'] < 0:
                producto_dict['precio'] = abs(producto_dict['precio'])
            # Conversión a dólares
            producto_dict['precio_dolar'] = round(producto_dict['precio'] / valor_dolar, 2) if producto_dict['precio'] else 0
            productos_dolares.append(producto_dict)

        precios_dolar = [p['precio_dolar'] for p in productos_dolares]
        print("Precios en dólares:", precios_dolar)

        self.assertEqual(precios_dolar[0], 10.53)  # 10000/950
        self.assertEqual(precios_dolar[1], 5.26)   # abs(-5000)/950
        self.assertEqual(precios_dolar[2], 0)     # 0/950
        self.assertEqual(precios_dolar[3], 0)     # None -> 0

if __name__ == '__main__':
    unittest.main()