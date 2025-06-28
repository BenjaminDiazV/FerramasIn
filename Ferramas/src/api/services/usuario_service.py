from api.db.database import mysql
from api.models.usuarios import Usuario
import hashlib

def obtener_todos_usuarios():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id_email, email, nombre FROM usuarios")
    data = cur.fetchall()
    cur.close()
    usuarios = []
    for row in data:
        usuarios.append(Usuario(*row))
    return usuarios

def obtener_usuario_por_email(email):
    cur = mysql.connection.cursor()
    try:
        cur.execute("SELECT id_email, email, password, nombre FROM usuarios WHERE email = %s", (email,))
        data = cur.fetchone()
        cur.close()
        if data:
            return Usuario(*data)
        return None
    except Exception as e:
        cur.close()
        print("Error al buscar usuario:", e)
        return None

def crear_suscripcion(email):
    """Crea una suscripción simple con solo email (sin contraseña)"""
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            "INSERT INTO usuarios (email) VALUES (%s)",
            (email,)
        )
        mysql.connection.commit()
        id_email = cur.lastrowid
        cur.close()
        return Usuario(id_email, email)
    except Exception as e:
        cur.close()
        print("Error al crear suscripción:", e)
        return None

def crear_usuario(id_email, email, password=None, nombre=None):
    cur = mysql.connection.cursor()
    try:
        # Hash de la contraseña si se proporciona
        hashed_password = None
        if password:
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        cur.execute(
            "INSERT INTO usuarios (email, password, nombre) VALUES (%s, %s, %s)",
            (email, hashed_password, nombre)
        )
        mysql.connection.commit()
        id_email = cur.lastrowid
        cur.close()
        # Devuelve el usuario creado como objeto Usuario
        return Usuario(id_email, email, nombre=nombre)
    except Exception as e:
        cur.close()
        print("Error al registrar usuario:", e)
        return None

def verificar_credenciales(email, password):
    """Verifica las credenciales de un usuario"""
    cur = mysql.connection.cursor()
    try:
        cur.execute("SELECT id_email, email, password, nombre FROM usuarios WHERE email = %s", (email,))
        data = cur.fetchone()
        cur.close()
        
        if data and data[2]:  # Si existe el usuario y tiene contraseña
            stored_password = data[2]
            hashed_input = hashlib.sha256(password.encode()).hexdigest()
            if hashed_input == stored_password:
                return Usuario(data[0], data[1], nombre=data[3])
        return None
    except Exception as e:
        cur.close()
        print("Error al verificar credenciales:", e)
        return None
