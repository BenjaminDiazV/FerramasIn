from flask_mysqldb import MySQL
from flask import Flask

mysql = MySQL()

def init_db(app: Flask):
    app.config['MYSQL_HOST'] = 'localhost'
    app.config['MYSQL_USER'] = 'root'
    app.config['MYSQL_PASSWORD'] = ''
    app.config['MYSQL_DB'] = 'ferramas'
    mysql.init_app(app)