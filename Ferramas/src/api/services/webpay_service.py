from api.db.webpay_api import WebpayAPI
import time

class webpayService:
    def iniciar_pago(self, amount):  # Recibe el monto como parámetro
        transaction = WebpayAPI.get_transaction()
        response = transaction.create(
            buy_order="order_" + str(int(time.time())),  # Genera una orden única
            session_id="session_" + str(int(time.time())), # Genera una sesión única
            amount=amount,
            return_url="http://localhost:5000/webpay/confirmar_pago"
        )
        return {'url': response['url'], 'token': response['token']}
    
    def confirmar_pago(self, token):
        try:
            transaction = WebpayAPI.get_transaction()
            response = transaction.commit(token)
            
            # Log para debugging
            print(f"DEBUG: Respuesta de Webpay commit: {response}")
            
            return response
        except Exception as e:
            print(f"ERROR en confirmar_pago: {e}")
            return None