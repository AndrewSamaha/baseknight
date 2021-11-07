import mysql.connector
from mysql.connector import errorcode

class DB():
    def __init__(self):
        self.DB_NAME = 'knights'
        self.config = {
            'user':'root',
            'password':'root',
            'host':'db',
            'port':'3306',
            'database':self.DB_NAME
        }
        self.config_nodb = {
            'user': self.config['user'],
            'password': self.config['password'],
            'host': self.config['host'],
            'port': self.config['port']
        }

        try:
            self.connection = mysql.connector.connect(**self.config)
            self.cursor = self.connection.cursor()
        except mysql.connector.Error as err:
            print("error connecting to database")
            if err.errno == errorcode.ER_BAD_DB_ERROR:
                print("Database {} does not exists. Creating...".format(self.DB_NAME))
                self.connection = self.create_database()
                print("Database {} created successfully.".format(self.DB_NAME))
                self.connection.database = self.DB_NAME
                self.cursor = self.connection.cursor()    
            else:
                print(err)
                exit(1)

    def create_database(self):
        connection = mysql.connector.connect(**self.config_nodb)
        cursor = connection.cursor()
        try:
            cursor.execute(
            "CREATE DATABASE {} DEFAULT CHARACTER SET 'utf8'".format(self.DB_NAME))
        except mysql.connector.Error as err:
            print("Failed creating database: {}".format(err))
            exit(1)
        return connection

    def exec(self, query):
        try:
            self.cursor.execute(query)
            self.connection.commit()
        except mysql.connector.Error as err:
            print(err)
           
    
    def query(self, query):
        try:
            self.cursor.execute(query)
            rows = self.cursor.fetchall()
            return rows
        except mysql.connector.Error as err:
            print(err)
           
    

    def close(self):
        self.cursor.close()
        self.connection.close()   
    
    def setParameter(self, name, value):
        table='params'
        return self.exec(f"insert into {table} (name,value) values ('{name}','{value}') ON DUPLICATE KEY UPDATE value='{value}';")
    
    def getParameter(self, name):
        value = None
        table='params'
        try:
            value = self.query(f"select value from {table} where name = '{name}';")
            value = value[0][0]
        except mysql.connector.Error as err:
            print(err)
        return value
    
    def setWorldState(self, name, value):
        table='world_state'
        return self.exec(f"insert into {table} (name,value) values ('{name}','{value}') ON DUPLICATE KEY UPDATE value='{value}';")
    
    def getWorldState(self, name):
        value = None
        table='world_state'
        try:
            value = self.query(f"select value from {table} where name = '{name}';")
            value = value[0][0]
        except mysql.connector.Error as err:
            print(err)
        return value

    