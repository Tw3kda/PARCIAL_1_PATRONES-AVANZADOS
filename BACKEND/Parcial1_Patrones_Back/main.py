# main.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel

# ------------------------------
# Configuración de la base de datos
# ------------------------------
# Cargar variables del .env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Modelo de la tabla
class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    item = Column(String, index=True)

# Crear tabla si no existe
Base.metadata.create_all(bind=engine)

# Modelo para recibir datos
class OrderCreate(BaseModel):
    item: str

app = FastAPI()

# Permitir que el frontend haga peticiones
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint GET: obtener todos los pedidos
@app.get("/api/orders")
def get_orders():
    session = SessionLocal()
    orders = session.query(Order).all()
    session.close()
    return [{"id": order.id, "item": order.item} for order in orders]

# Endpoint POST: agregar un nuevo pedido
@app.post("/api/orders")
def create_order(order: OrderCreate):
    session = SessionLocal()
    new_order = Order(item=order.item)
    session.add(new_order)
    session.commit()
    session.refresh(new_order)
    session.close()
    return {"id": new_order.id, "item": new_order.item}
# Endpoint DELETE: eliminar un pedido por id
@app.delete("/api/orders/{order_id}")
def delete_order(order_id: int):
    session = SessionLocal()
    order = session.query(Order).filter(Order.id == order_id).first()
    if not order:
        session.close()
        return {"error": "Pedido no encontrado"}
    session.delete(order)
    session.commit()
    session.close()
    return {"message": f"Pedido {order_id} eliminado"}
