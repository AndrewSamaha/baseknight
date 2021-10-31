# https://flask.palletsprojects.com/en/2.0.x/quickstart/
# https://github.com/mysql/mysql-connector-python
from flask import Flask, render_template, request, send_file, send_from_directory
from flask import jsonify

import mysql.connector
from src.db import DB
from src.generator import TerrainGenerator
from src.world import WorldServer


app = Flask(__name__,
            static_url_path='', 
            static_folder='./static')
db = DB()
tg = TerrainGenerator(db)
ws = WorldServer(db, tg)

@app.route("/")
def index():
    print("hello world2")
    return app.send_static_file('index.html')

@app.route("/getstate", methods=["POST","GET"])
def getstate():
    if "x" in request.args.keys() and "y" in request.args.keys():
        chunk = ws.getChunk(int(request.args["x"]),
                            int(request.args["y"]))
    return jsonify( 
            args=request.args,
            chunk=chunk
        )

@app.route("/getparam", methods=["POST","GET"])
def getparam():
    ret = dict()
    for key in request.args.keys():
        if key == 'tile_types':
            ret[key] = db.query("select id, name, data from tile_types;")
        else:
            try:
                ret[key] = db.getParameter(key)
            except:
                ret[key] = "undefined"
    return jsonify(
        params=ret
    )

@app.route("/favicon.ico")
def favicon():
    print("hello world")
    return app.send_static_file('favicon.ico')


@app.route("/test/")
def test():
    print("hello test")
    return "<p>Hello, TEST! 554466</p>"


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)

print("executed")