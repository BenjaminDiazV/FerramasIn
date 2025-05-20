from flaskext.mysql import MySQL

mysql = MySQL()

def init_db(app):
    mysql.init_app(app)
    return mysql