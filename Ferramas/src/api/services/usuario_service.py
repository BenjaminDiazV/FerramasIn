from api.db.database import mysql
from api.models.usuarios import Usuario
def obtener_todos_usuarios():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id_email, email FROM usuarios")
    data = cur.fetchall()
    cur.close()
    usuarios = []
    for row in data:
        usuarios.append(Usuario(*row))
    return usuarios

def crear_usuario(id_email, email):
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            "INSERT INTO usuarios (email) VALUES (%s)",
            (email,)
        )
        mysql.connection.commit()
        id_email = cur.lastrowid
        cur.close()
        # Devuelve el usuario creado como objeto Usuario
        return Usuario(id_email, email)
    except Exception as e:
        cur.close()
        print("Error al registrar email:", e)
        return None
