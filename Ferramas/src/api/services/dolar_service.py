from api.models.dolar import Dolar
from api.db.external_api import ExternalAPI




class DolarService:
    def get_dolar_hoy(self):
        try:
            data = ExternalAPI.get_dolar_data()
            serie = data['serie'][0]
            return Dolar(fecha=serie['fecha'], valor=serie['valor'])
        except Exception as e:
            return {'error obtencion dolar : -> ' + str(e)}