from api.db.database import mysql
from api.models.productos import Producto

def obtener_todos_productos():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id_prod, nombre, categoria, marca, cod_marca, precio FROM productos")
    data = cur.fetchall()
    cur.close()
    productos = []
    for row in data:
        productos.append(Producto(*row))
    return productos