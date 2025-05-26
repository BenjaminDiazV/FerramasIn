from flask import Flask
from api.db import database
from api.routes.routes import producto_bp, webpay_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
database.init_db(app)
app.register_blueprint(producto_bp)
app.register_blueprint(webpay_bp)

if __name__ == '__main__':
    app.run(debug=True)