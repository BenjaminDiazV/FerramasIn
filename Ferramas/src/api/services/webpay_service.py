from api.db.webpay_api import WebpayAPI

class webpayService:
    def iniciar_pago(self):
        transaction = WebpayAPI.get_transaction()
        response = transaction.create(
            buy_order="order 123",
            session_id="session123",
            amount=15000,
            return_url="http://localhost:5000/webpay/confirmar_pago"
        )

        return response['url'] + "?token_ws=" + response['token']
    
    def confirmar_pago(self,token):
        transaction = WebpayAPI.get_transaction()
        return transaction.commit(token)