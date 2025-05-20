class Product:
    def __init__(self, id, name, type, brand, brand_id, price):
        self.id = id
        self.name = name
        self.type = type
        self.brand = brand
        self.brand_id = brand_id
        self.price = price
    def to_dict(self):
        return {
            'id':self.id,
            'name':self.name,
            'type':self.type,
            'brand':self.brand,
            'brand_id':self.brand_id,
            'price':self.price
        }