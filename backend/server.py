from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

import auth
import enquiries
import studio

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

auth.init(db)
enquiries.init(db)


@api_router.get("/")
async def root():
    return {"message": "Rekha Krishnamurthy API", "ok": True}


api_router.include_router(auth.router)
api_router.include_router(enquiries.router)
api_router.include_router(studio.router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await auth.seed_admin()
    await db.enquiries.create_index("created_at")
    await db.enquiries.create_index("status")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
