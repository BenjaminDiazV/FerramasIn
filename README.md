# FerramasIn

## Integración

Este proyecto requiere node.js y Python, ademas de otros servicios. Porfavor seguir los pasos indicados para la instalación.

---

## Prerequisistos

Porfavor asegurarse de instalar los servicios:

- [Node.js](https://nodejs.org/) (Recommended: LTS version)
- [Python](https://www.python.org/) (Recommended: Python 3.x)
- [XAMPP](https://www.apachefriends.org/download.html) (for MySQL and Apache)
- [Transbank SDK](https://www.transbankdevelopers.cl) (for payment integration)

---

## Configuracion de Backend (Python/Flask)

1. **Instalar dependencias de Python**  

   ```bash
   pip install flask 
   ```
   ```bash
   pip install flask-mysqldb
   ```
   ```bash
   pip install flask-cors
   ```

3. **Instalar Transbank SDK**

   ```bash
   pip install transbank-sdk
   ```
---

## Configurar base de datos

1. Instalar y configurar XAMPP.
2. iniciar Apache y MySQL desde el panel de control de XAMPP.
3. crear o importar una base de datos MySQL usando phpMyAdmin.

---

## Configuracion Frontend (Node.js)

1. Instalar las dependencias de Node.js (inciar en el direcitorio frontend):

   ```bash
   npm install -g npm
   ```
2. Instalar iconos de ionic en command promt

   ```bash
   npm install @ionic/react ionicons
   ```
---

##  Notas adicionales

- asegurarse de que el backend (Flask app) esté apropiadamente configurado para conectarlo a tu base de datos MySQL en XAMPP.
---

## Inciando el Proyecto

- **Backend:**
- en el directorio /FerramasIn/Ferramas/src
- en el powershell
  ```bash
  py app.py
  ```
- **Frontend:**
- en el directorio /FerramasIn/Ferramas/
- en el  command prompt
  ```bash
  ionic serve
  ```

---

## Links utiles

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Flask-MySQLdb Documentation](https://flask-mysqldb.readthedocs.io/)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)
- [Transbank Developers](https://www.transbankdevelopers.cl/)
- [XAMPP Download](https://www.apachefriends.org/download.html)
