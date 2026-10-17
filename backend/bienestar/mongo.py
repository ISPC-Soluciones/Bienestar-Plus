import os
from pymongo import MongoClient
import gridfs

_client = None


def obtener_cliente():
    """Devuelve un cliente Mongo reutilizable (se crea una sola vez)."""
    global _client
    if _client is None:
        mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/bienestar_archivos')
        _client = MongoClient(mongo_uri)
    return _client


def obtener_gridfs():
    """Devuelve el manejador de GridFS para guardar y leer archivos."""
    cliente = obtener_cliente()
    db = cliente.get_default_database()
    return gridfs.GridFS(db)