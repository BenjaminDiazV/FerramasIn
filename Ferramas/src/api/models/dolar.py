class Dolar:
    def __init__(self, fecha, valor):
        self.fecha = fecha
        self.valor = valor
        
    def to_dict(self):
        return {
            'fecha': self.fecha,
            'valor': self.valor
        } 

    