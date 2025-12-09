from fastapi import APIRouter
from app.api.v1 import routes_products, routes_offers, routes_billing, routes_stock

api_router = APIRouter()

api_router.include_router(routes_products.router)
api_router.include_router(routes_offers.router)
api_router.include_router(routes_billing.router)
api_router.include_router(routes_stock.router)