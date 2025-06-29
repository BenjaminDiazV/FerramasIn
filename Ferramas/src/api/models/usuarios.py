class Usuario:
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

    