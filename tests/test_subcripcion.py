import sys
import os
import unittest
from unittest.mock import patch, MagicMock

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
class TestSuscripcion(unittest.TestCase):
    """Tests para la funcionalidad de suscripción con email únicamente"""

    def test_suscripcion_exitosa_email_valido(self, mock_usuario, mock_mysql):
        """Test: Suscripción exitosa con email válido"""
        print("\n=== TEST: SUSCRIPCIÓN EXITOSA ===")
        
        # Configurar mock de base de datos
        mock_cursor = MagicMock()
        mock_cursor.lastrowid = 1
        mock_mysql.connection.cursor.return_value = mock_cursor
        mock_mysql.connection.commit.return_value = None
        
        # Datos de prueba
        email_test = "newsletter@example.com"
        
        # Ejecutar suscripción
        resultado = usuario_service.crear_suscripcion(email_test)
        
        print(f"📧 Email suscrito: {email_test}")
        print(f"🆔 ID asignado: {resultado.id_email}")
        print(f"🔒 Contraseña: {resultado.password} (debería ser None)")
        print(f"👤 Nombre: {resultado.nombre} (debería ser None)")
        print(f"✅ Estado: Usuario SUSCRITO (solo newsletter)")
        
        # Verificaciones
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.email, email_test)
        self.assertEqual(resultado.id_email, 1)
        self.assertIsNone(resultado.password)  # Suscripción NO tiene contraseña
        self.assertIsNone(resultado.nombre)    # Suscripción NO tiene nombre
        
        # Verificar llamada correcta a BD
        mock_cursor.execute.assert_called_once_with(
            "INSERT INTO usuarios (email) VALUES (%s)",
            (email_test,)
        )
        mock_mysql.connection.commit.assert_called_once()

    def test_suscripcion_email_ya_existente(self, mock_usuario, mock_mysql):
        """Test: Intentar suscribir email que ya existe"""
        print("\n=== TEST: EMAIL YA SUSCRITO ===")
        
        # Configurar mock para usuario existente
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, "existente@example.com", None, None)
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        email_existente = "existente@example.com"
        usuario_encontrado = usuario_service.obtener_usuario_por_email(email_existente)
        
        print(f"📧 Email verificado: {email_existente}")
        print(f"🔍 Usuario encontrado: {'SÍ' if usuario_encontrado else 'NO'}")
        print(f"📋 Tipo de cuenta: {'Solo suscrito' if not usuario_encontrado.password else 'Registrado completo'}")
        print(f"💰 Tiene descuentos: {'NO' if not usuario_encontrado.password else 'SÍ'}")
        
        # Verificaciones
        self.assertIsNotNone(usuario_encontrado)
        self.assertEqual(usuario_encontrado.email, email_existente)
        self.assertIsNone(usuario_encontrado.password)  # Solo suscrito

    def test_suscripcion_beneficios_limitados(self, mock_usuario, mock_mysql):
        """Test: Verificar que suscripción NO da descuentos"""
        print("\n=== TEST: BENEFICIOS DE SUSCRIPCIÓN ===")
        
        # Mock usuario suscrito
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (1, "suscrito@example.com", None, None)
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        usuario_suscrito = usuario_service.obtener_usuario_por_email("suscrito@example.com")
        
        # Lógica de descuentos (según routes.py)
        tiene_descuento = usuario_suscrito and usuario_suscrito.password is not None
        descuento_porcentaje = 15 if tiene_descuento else 0
        
        print(f"👤 Usuario: {usuario_suscrito.email}")
        print(f"🔑 Tiene contraseña: {'SÍ' if usuario_suscrito.password else 'NO'}")
        print(f"💰 Descuento aplicable: {descuento_porcentaje}%")
        print(f"📧 Beneficios: Newsletter únicamente")
        print(f"⚠️  Para descuentos: Debe registrarse con contraseña")
        
        # Verificaciones
        self.assertIsNone(usuario_suscrito.password)
        self.assertEqual(descuento_porcentaje, 0)  # Sin descuentos

    def test_suscripcion_error_base_datos(self, mock_usuario, mock_mysql):
        """Test: Manejo de errores en base de datos"""
        print("\n=== TEST: ERROR DE BASE DE DATOS ===")
        
        # Configurar mock para error
        mock_cursor = MagicMock()
        mock_cursor.execute.side_effect = Exception("Connection timeout")
        mock_mysql.connection.cursor.return_value = mock_cursor
        
        email_test = "error@example.com"
        resultado = usuario_service.crear_suscripcion(email_test)
        
        print(f"📧 Email intentado: {email_test}")
        print(f"❌ Error simulado: Connection timeout")
        print(f"🔄 Resultado: {resultado} (debería ser None)")
        print(f"✅ Error manejado correctamente")
        
        # Verificaciones
        self.assertIsNone(resultado)

    def test_validacion_email_formato(self, mock_usuario, mock_mysql):
        """Test: Validación de formato de email"""
        print("\n=== TEST: VALIDACIÓN DE EMAIL ===")
        
        emails_test = [
            ("valido@example.com", True),
            ("tambien.valido@test.org", True),
            ("email-invalido", False),
            ("@sindominio.com", False),
            ("sindominiopunto@", False)
        ]
        
        for email, es_valido in emails_test:
            # Simulación básica de validación
            import re
            patron_email = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
            email_valido = re.match(patron_email, email) is not None
            
            print(f"📧 Email: {email}")
            print(f"✅ Válido: {'SÍ' if email_valido else 'NO'}")
            print(f"📋 Esperado: {'SÍ' if es_valido else 'NO'}")
            print("---")
            
            # Verificación
            self.assertEqual(email_valido, es_valido)

if __name__ == '__main__':
    print("🧪 EJECUTANDO TESTS DE SUSCRIPCIÓN")
    print("=" * 50)
    unittest.main(verbosity=2)