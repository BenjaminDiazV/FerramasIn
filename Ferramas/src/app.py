# app.py
from flask import Flask
from api.db import database
from api.routes.routes import producto_bp
from flask_cors import CORS  # Importa CORS

app = Flask(__name__)
CORS(app) # Habilita CORS para permitir peticiones desde Ionic (en desarrollo)
database.init_db(app)
app.register_blueprint(producto_bp)

if __name__ == '__main__':
    app.run(debug=True)