from api.db.database import mysql
from api.models.productos import Producto

def obtener_todos_productos():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id_prod, nombre, categoria, marca, cod_marca, precio FROM productos")
    data = cur.fetchall()
    cur.close()
    productos = []
    for row in data:
        precio = row[5]
        row = list(row)
        if precio is None or precio == 0:
            row[5] = 0
        elif precio < 0:
            row[5] = abs(precio)
    # Si es válido, no se modifica
        productos.append(Producto(*row))
    return productos

def obtener_producto_por_cat(categoria):
    cur = mysql.connection.cursor()
    cur.execute("SELECT id_prod, nombre, categoria, marca, cod_marca, precio FROM productos WHERE categoria = %s", (categoria,))
    data = cur.fetchall()
    cur.close()
    productos = []
    for row in data:
        precio = row[5]
        row = list(row)
        if precio is None or precio == 0:
            row[5] = 0
        elif precio < 0:
            row[5] = abs(precio)
        productos.append(Producto(*row))
    return productos

def obtener_producto_por_id(id_prod):
    cur = mysql.connection.cursor()
    try:
        cur.execute("SELECT id_prod, nombre, categoria, marca, cod_marca, precio FROM productos WHERE id_prod = %s", (id_prod,))
        data = cur.fetchone()
        cur.close()
        
        if data:
            precio = data[5]
            if precio < 0:
                data = list(data)
                data[5] = abs(precio)
            elif precio is None or precio == 0:
                data = list(data)
                data[5] = 0
            return Producto(*data)
        return None
    except Exception as e:
        cur.close()
        print(f"Error al obtener producto por ID {id_prod}:", e)
        return None

def crear_producto(nombre, categoria, marca, precio):
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            "INSERT INTO productos (nombre, categoria, marca, precio) VALUES (%s, %s, %s, %s)",
            (nombre, categoria, marca, precio)
        )
        mysql.connection.commit()
        nuevo_id = cur.lastrowid
        cur.close()
        # Devuelve el producto creado como objeto Producto
        return Producto(nuevo_id, nombre, categoria, marca, None, precio)
    except Exception as e:
        cur.close()
        print("Error al crear producto:", e)
        return None

