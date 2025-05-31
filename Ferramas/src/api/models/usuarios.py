class Usuario:
    def __init__(self, id_email, email):
        self.id_email = id_email
        self.email = email
       
        
    def to_dict(self):
        return {
            'id_email': self.id_email,
            'email': self.email
        } 

    