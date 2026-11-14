from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from fastapi import FastAPI, APIRouter
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

import auth
import enquiries
import studio
import content
import availability
import brochure
import blog
from storage import init_storage

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

auth.init(db)
enquiries.init(db)
content.init(db)
studio.init(db)
availability.init(db)
brochure.init(db)
blog.init(db)


@api_router.get("/")
async def root():
    return {"message": "Rekha Krishnamurthy API", "ok": True}


@api_router.get("/sitemap.xml", response_class=Response)
async def sitemap_endpoint():
    """Dynamic sitemap — always includes latest blog posts (production-safe)."""
    xml = await blog.get_sitemap_xml()
    return Response(content=xml, media_type="application/xml")


api_router.include_router(auth.router)
api_router.include_router(enquiries.router)
api_router.include_router(studio.router)
api_router.include_router(content.router)
api_router.include_router(availability.router)
api_router.include_router(brochure.router)
api_router.include_router(blog.router)
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
    await content.seed_content()
    await content.seed_services()
    await blog.seed_blog()
    await blog.regenerate_sitemap()
    await db.bookings.create_index("date")
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error("Storage init failed: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
