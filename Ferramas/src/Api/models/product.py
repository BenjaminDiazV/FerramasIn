class Product:
    def __init__(self, id, name, price, types):
        self.id = id
        self.name = name
        self.price = price
        self.types = types
    def to_dict(self):
        return {
            'id':self.id,
            'name':self.name,
            'price':self.price,
            'types':self.types
        }