class Producto:
    def __init__(self, id_prod, nombre, categoria, marca, cod_marca, precio):
        self.id_prod = id_prod
        self.nombre = nombre
        self.categoria = categoria
        self.marca = marca
        self.cod_marca = cod_marca
        self.precio = precio

    def to_json(self):
        return {
            'id_prod': self.id_prod,
            'nombre': self.nombre,
            'categoria': self.categoria,
            'marca': self.marca,
            'cod_marca': self.cod_marca,
            'precio': self.precio
        }