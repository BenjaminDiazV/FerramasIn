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
    
    def confirmar_pago(self,token):
        transaction = WebpayAPI.get_transaction()
        return transaction.commit(token)