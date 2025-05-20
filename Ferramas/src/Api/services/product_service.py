from Ferramas.src.Api.models.products import Product

class ProductService:
    def __init__(self, mysql):
        self.mysql = mysql

    def get_all_products(self):
        cursor = self.mysql.connection.cursor()
        cursor.execute("SELECT id_prod, nombre, categoria, marca, cod_marca, precio FROM productos")
        results = cursor.fetchall()
        products = [Product(id=row[0], name=row[1], type=row[2], brand=row[3], brand_id=row[4], price=row[5]).to_dict() for row in results]
        return products