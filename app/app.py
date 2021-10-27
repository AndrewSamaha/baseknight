# https://flask.palletsprojects.com/en/2.0.x/quickstart/
# https://github.com/mysql/mysql-connector-python
from flask import Flask, render_template, request, send_file, send_from_directory
from flask import jsonify

import mysql.connector
from src.db import DB

app = Flask(__name__)


@app.route("/get")

@app.route("/")
def index():
    print("hello world")
    return app.send_static_file('index.html')

@app.route("/favicon.ico")
def favicon():
    print("hello world")
    return app.send_static_file('favicon.ico')


@app.route("/test/")
def test():
    print("hello test")
    return "<p>Hello, TEST!</p>"


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

print("executed")