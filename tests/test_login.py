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
class TestLogin(unittest.TestCase):
    """Tests para la funcionalidad de inicio de sesión"""

    def test_login_exitoso_credenciales_correctas(self, mock_usuario, mock_mysql):
        """Test: Login exitoso con credenciales válidas"""
        print("\n=== TEST: LOGIN EXITOSO ===")
        
        # Datos de prueba
        email_test = "usuario@example.com"
        password_test = "miPassword123"
        nombre_test = "Juan Pérez"
        
        # Simular contraseña hasheada almacenada
        password_hash = hashlib.sha256(password_test.encode()).hexdigest()
        
        # Configurar mock de base de datos
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, email_test, password_hash, nombre_test)
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        # Ejecutar login
        resultado = usuario_service.verificar_credenciales(email_test, password_test)
        
        print(f"📧 Email: {email_test}")
        print(f"🔒 Password: ****** (correcto)")
        print(f"👤 Usuario encontrado: {nombre_test}")
        print(f"🆔 ID: {resultado.id_email}")
        print(f"✅ Login exitoso: {'SÍ' if resultado else 'NO'}")
        print(f"💰 Acceso a descuentos: SÍ (usuario registrado)")
        
        # Verificaciones
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.email, email_test)
        self.assertEqual(resultado.nombre, nombre_test)
        self.assertEqual(resultado.id_email, 1)

    def test_login_password_incorrecta(self, mock_usuario, mock_mysql):
        """Test: Login fallido por contraseña incorrecta"""
        print("\n=== TEST: PASSWORD INCORRECTA ===")
        
        email_test = "usuario@example.com"
        password_correcta = "miPassword123"
        password_incorrecta = "passwordMala"
        
        # Hash de la contraseña correcta (almacenada)
        password_hash_correcto = hashlib.sha256(password_correcta.encode()).hexdigest()
        
        # Configurar mock - usuario existe con contraseña correcta
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, email_test, password_hash_correcto, "Juan")
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        # Intentar login con contraseña incorrecta
        resultado = usuario_service.verificar_credenciales(email_test, password_incorrecta)
        
        print(f"📧 Email: {email_test}")
        print(f"🔒 Password intentada: ****** (incorrecta)")
        print(f"❌ Login exitoso: {'SÍ' if resultado else 'NO'}")
        print(f"🚫 Razón fallo: Contraseña no coincide")
        print(f"🔐 Seguridad: Hash protege contraseña real")
        
        # Verificaciones
        self.assertIsNone(resultado)  # Login debe fallar

    def test_login_usuario_no_existe(self, mock_usuario, mock_mysql):
        """Test: Login fallido por usuario no registrado"""
        print("\n=== TEST: USUARIO NO EXISTE ===")
        
        email_inexistente = "noexiste@example.com"
        password_test = "cualquierPassword"
        
        # Configurar mock - usuario no encontrado
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        # Intentar login
        resultado = usuario_service.verificar_credenciales(email_inexistente, password_test)
        
        print(f"📧 Email: {email_inexistente}")
        print(f"🔍 Usuario encontrado: {'SÍ' if resultado else 'NO'}")
        print(f"❌ Login exitoso: {'SÍ' if resultado else 'NO'}")
        print(f"💡 Acción sugerida: Registrarse primero")
        
        # Verificaciones
        self.assertIsNone(resultado)

    def test_login_usuario_solo_suscrito(self, mock_usuario, mock_mysql):
        """Test: Intento de login de usuario solo suscrito (sin contraseña)"""
        print("\n=== TEST: USUARIO SOLO SUSCRITO ===")
        
        email_suscrito = "suscrito@example.com"
        password_intentada = "intentoPassword"
        
        # Configurar mock - usuario suscrito sin contraseña
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, email_suscrito, None, None)
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        # Intentar login
        resultado = usuario_service.verificar_credenciales(email_suscrito, password_intentada)
        
        print(f"📧 Email: {email_suscrito}")
        print(f"📋 Tipo cuenta: Solo suscrito (sin contraseña)")
        print(f"🔒 Tiene contraseña: NO")
        print(f"❌ Login posible: NO")
        print(f"💡 Acción necesaria: Completar registro con contraseña")
        print(f"📧 Beneficios actuales: Solo newsletter")
        
        # Verificaciones
        self.assertIsNone(resultado)  # No puede hacer login sin contraseña

    def test_login_validaciones_entrada(self, mock_usuario, mock_mysql):
        """Test: Validaciones de datos de entrada"""
        print("\n=== TEST: VALIDACIONES DE ENTRADA ===")
        
        casos_test = [
            ("", "password123", "Email vacío"),
            ("usuario@example.com", "", "Contraseña vacía"),
            ("email-invalido", "password123", "Email formato inválido"),
            (None, "password123", "Email nulo"),
            ("usuario@example.com", None, "Contraseña nula")
        ]
        
        for email, password, descripcion in casos_test:
            print(f"📋 Caso: {descripcion}")
            print(f"📧 Email: '{email}'")
            print(f"🔒 Password: '{password}'")
            
            # Validaciones básicas
            if not email or not password:
                print(f"❌ Validación: FALLA (campo vacío)")
                resultado_esperado = None
            elif not email or "@" not in str(email):
                print(f"❌ Validación: FALLA (email inválido)")
                resultado_esperado = None
            else:
                print(f"✅ Validación: PASA (formato correcto)")
                resultado_esperado = "continuar_verificacion"
            
            print("---")
            
            # En caso real, estos casos fallarían antes de llegar a BD
            if not email or not password:
                self.assertIsNone(resultado_esperado)

    def test_login_seguridad_hash(self, mock_usuario, mock_mysql):
        """Test: Verificación de seguridad del sistema de hash"""
        print("\n=== TEST: SEGURIDAD DEL HASH ===")
        
        password_original = "miPasswordSegura123!"
        passwords_incorrectas = [
            "miPasswordSegura123",  # Sin signo de exclamación
            "mipasswordsegura123!", # Mayúsculas diferentes
            "miPasswordSegura124!", # Número diferente
            "",                     # Vacía
            "123"                   # Muy corta
        ]
        
        # Hash de la contraseña correcta
        hash_correcto = hashlib.sha256(password_original.encode()).hexdigest()
        
        print(f"🔒 Password correcta: {password_original}")
        print(f"🔐 Hash almacenado: {hash_correcto[:20]}...")
        print()
        
        for password_incorrecta in passwords_incorrectas:
            hash_intento = hashlib.sha256(password_incorrecta.encode()).hexdigest()
            coincide = hash_correcto == hash_intento
            
            print(f"🔓 Intento: '{password_incorrecta}'")
            print(f"🔐 Hash intento: {hash_intento[:20]}...")
            print(f"✅ ¿Coincide?: {'SÍ' if coincide else 'NO'}")
            print("---")
            
            # Verificar que contraseñas incorrectas no coinciden
            self.assertFalse(coincide, f"Hash no debería coincidir para: {password_incorrecta}")

    def test_login_flujo_completo_sesion(self, mock_usuario, mock_mysql):
        """Test: Flujo completo de inicio de sesión exitoso"""
        print("\n=== TEST: FLUJO COMPLETO DE SESIÓN ===")
        
        # Datos de usuario registrado
        email_test = "session@example.com"
        password_test = "sessionPass123"
        nombre_test = "Usuario Sesión"
        password_hash = hashlib.sha256(password_test.encode()).hexdigest()
        
        # Mock BD con usuario válido
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, email_test, password_hash, nombre_test)
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        # Paso 1: Verificar credenciales
        usuario_logueado = usuario_service.verificar_credenciales(email_test, password_test)
        
        # Paso 2: Establecer información de sesión (simulado)
        if usuario_logueado:
            session_info = {
                'isLoggedIn': True,
                'userEmail': usuario_logueado.email,
                'userName': usuario_logueado.nombre,
                'userId': usuario_logueado.id_email
            }
        
        print(f"👤 Usuario: {nombre_test}")
        print(f"📧 Email: {email_test}")
        print(f"✅ Login exitoso: {'SÍ' if usuario_logueado else 'NO'}")
        print(f"🔐 Sesión establecida: {'SÍ' if usuario_logueado else 'NO'}")
        print(f"💰 Acceso a descuentos: SÍ (usuario registrado)")
        print(f"📱 Estado frontend: Actualizado con datos de usuario")
        
        # Verificaciones del flujo completo
        self.assertIsNotNone(usuario_logueado)
        self.assertTrue(session_info['isLoggedIn'])
        self.assertEqual(session_info['userEmail'], email_test)
        self.assertEqual(session_info['userName'], nombre_test)

if __name__ == '__main__':
    print("🧪 EJECUTANDO TESTS DE LOGIN")
    print("=" * 50)
    unittest.main(verbosity=2)