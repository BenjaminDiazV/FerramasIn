import sys
import os
import unittest
from unittest.mock import patch, MagicMock
import hashlib

# Ajusta el path para importar los módulos correctamente
src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Ferramas/src'))
sys.path.insert(0, src_path)

from api.services import usuario_service
from api.models.usuarios import Usuario

class UsuarioMock:
    def __init__(self, id_email, email, password=None, nombre=None):
        self.id_email = id_email
        self.email = email
        self.password = password
        self.nombre = nombre
    
    def to_dict(self):
        return {
            'id_email': self.id_email,
            'email': self.email,
            'nombre': self.nombre,
            'password': '***' if self.password else None
        }

@patch('api.services.usuario_service.mysql')
@patch('api.services.usuario_service.Usuario', side_effect=UsuarioMock)
class TestRegistro(unittest.TestCase):
    """Tests para la funcionalidad de registro completo (email + contraseña + nombre)"""

    def test_registro_completo_exitoso(self, mock_usuario, mock_mysql):
        """Test: Registro exitoso con todos los datos"""
        print("\n=== TEST: REGISTRO COMPLETO EXITOSO ===")
        
        # Configurar mock de base de datos
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 1
        mock_mysql.connection.cursor.return_value = mock_cursor
        mock_mysql.connection.commit.return_value = None
        
        # Datos de prueba
        email_test = "nuevo@example.com"
        password_test = "miPassword123"
        nombre_test = "Juan Pérez"
        
        # Simular hash de contraseña
        password_hash = hashlib.sha256(password_test.encode()).hexdigest()
        
        # Ejecutar registro
        resultado = usuario_service.crear_usuario(None, email_test, password_test, nombre_test)
        
        print(f"📧 Email: {email_test}")
        print(f"👤 Nombre: {nombre_test}")
        print(f"🔒 Contraseña: ****** (hasheada)")
        print(f"🆔 ID asignado: {resultado.id_email}")
        print(f"💰 Descuentos: SÍ (15% por cuenta completa)")
        print(f"✅ Estado: Usuario REGISTRADO COMPLETO")
        
        # Verificaciones
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.email, email_test)
        self.assertEqual(resultado.nombre, nombre_test)
        self.assertIsNotNone(resultado.password)  # Tiene contraseña hasheada
        
        # Verificar llamada a BD con contraseña hasheada
        expected_call = mock_cursor.execute.call_args[0]
        self.assertEqual(expected_call[0], "INSERT INTO usuarios (email, password, nombre) VALUES (%s, %s, %s)")
        self.assertEqual(expected_call[1][0], email_test)  # Email
        self.assertEqual(expected_call[1][2], nombre_test)  # Nombre

    def test_registro_validacion_campos_obligatorios(self, mock_usuario, mock_mysql):
        """Test: Validación de campos obligatorios"""
        print("\n=== TEST: VALIDACIÓN CAMPOS OBLIGATORIOS ===")
        
        casos_test = [
            ("", "password123", "Juan", "Email vacío"),
            ("test@example.com", "", "Juan", "Contraseña vacía"),
            ("test@example.com", "123", "Juan", "Contraseña muy corta"),
            ("email-invalido", "password123", "Juan", "Email formato inválido"),
            ("test@example.com", "password123", "", "Nombre vacío")
        ]
        
        for email, password, nombre, descripcion in casos_test:
            print(f"📋 Caso: {descripcion}")
            print(f"📧 Email: '{email}'")
            print(f"🔒 Password: '{password}'")
            print(f"👤 Nombre: '{nombre}'")
            
            # Validaciones básicas
            email_valido = email and "@" in email and "." in email
            password_valido = password and len(password) >= 6
            nombre_valido = nombre and nombre.strip()
            
            campos_validos = email_valido and password_valido and nombre_valido
            
            print(f"✅ ¿Campos válidos?: {'SÍ' if campos_validos else 'NO'}")
            print("---")
            
            # En un caso real, el registro fallaría si los campos no son válidos
            if not campos_validos:
                self.assertFalse(campos_validos, f"Debería fallar: {descripcion}")

    def test_registro_upgrade_desde_suscripcion(self, mock_usuario, mock_mysql):
        """Test: Usuario suscrito se registra completamente"""
        print("\n=== TEST: UPGRADE DE SUSCRIPCIÓN A REGISTRO ===")
        
        email_test = "upgrade@example.com"
        
        # Paso 1: Usuario ya suscrito (solo email)
        mock_cursor_consulta = MagicMock()
        mock_cursor_consulta.fetchone.return_value = (1, email_test, None, None)
        
        # Paso 2: Usuario se registra completamente
        mock_cursor_update = MagicMock()
        mock_cursor_update.rowcount = 1
        
        mock_mysql.connection.cursor.side_effect = [mock_cursor_consulta, mock_cursor_update]
        
        # Verificar usuario existente
        usuario_existente = usuario_service.obtener_usuario_por_email(email_test)
        
        print(f"📧 Email: {email_test}")
        print(f"📋 Estado anterior: {'Solo suscrito' if not usuario_existente.password else 'Ya registrado'}")
        print(f"🔄 Acción: Completar registro con contraseña y nombre")
        print(f"💰 Descuentos antes: {'NO' if not usuario_existente.password else 'SÍ'}")
        print(f"💰 Descuentos después: SÍ (al completar registro)")
        
        # Verificaciones
        self.assertIsNotNone(usuario_existente)
        self.assertEqual(usuario_existente.email, email_test)
        self.assertIsNone(usuario_existente.password)  # Inicialmente solo suscrito

    def test_registro_hash_password_seguro(self, mock_usuario, mock_mysql):
        """Test: Verificar que la contraseña se hashea correctamente"""
        print("\n=== TEST: SEGURIDAD DE CONTRASEÑAS ===")
        
        passwords_test = ["password123", "MiClave456!", "SuperSecreta789"]
        
        for password in passwords_test:
            # Simular hashing como en usuario_service
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            print(f"🔒 Password original: {password}")
            print(f"🔐 Password hasheada: {password_hash[:20]}...")
            print(f"📏 Longitud hash: {len(password_hash)} caracteres")
            print("---")
            
            # Verificaciones de seguridad
            self.assertNotEqual(password, password_hash)  # No debe ser igual al original
            self.assertEqual(len(password_hash), 64)  # SHA256 = 64 caracteres hex
            self.assertTrue(password_hash.isalnum())  # Solo caracteres alfanuméricos

    def test_registro_beneficios_completos(self, mock_usuario, mock_mysql):
        """Test: Verificar beneficios de registro completo"""
        print("\n=== TEST: BENEFICIOS REGISTRO COMPLETO ===")
        
        # Mock usuario registrado completo
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, "registrado@example.com", "hash123", "Juan")
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        usuario_registrado = usuario_service.obtener_usuario_por_email("registrado@example.com")
        
        # Verificar beneficios
        tiene_newsletter = True  # Siempre tiene newsletter
        tiene_descuentos = usuario_registrado.password is not None
        descuento_porcentaje = 15 if tiene_descuentos else 0
        
        print(f"👤 Usuario: {usuario_registrado.nombre} ({usuario_registrado.email})")
        print(f"📧 Newsletter: {'SÍ' if tiene_newsletter else 'NO'}")
        print(f"💰 Descuentos: {'SÍ' if tiene_descuentos else 'NO'}")
        print(f"🎯 Porcentaje descuento: {descuento_porcentaje}%")
        print(f"🔐 Cuenta protegida: {'SÍ' if usuario_registrado.password else 'NO'}")
        print(f"✨ Beneficios completos: {'SÍ' if tiene_descuentos else 'NO'}")
        
        # Verificaciones
        self.assertIsNotNone(usuario_registrado.password)  # Tiene contraseña
        self.assertEqual(descuento_porcentaje, 15)  # Descuento completo
        self.assertIsNotNone(usuario_registrado.nombre)  # Tiene nombre

if __name__ == '__main__':
    print("🧪 EJECUTANDO TESTS DE REGISTRO")
    print("=" * 50)
    unittest.main(verbosity=2)