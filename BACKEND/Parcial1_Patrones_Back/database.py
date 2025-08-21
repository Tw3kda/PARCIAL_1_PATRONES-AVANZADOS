import os
from psycopg2 import connect
from dotenv import load_dotenv

load_dotenv()  # carga variables del .env

def get_connection():
    conn = connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    return conn
