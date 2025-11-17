from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Reference(BaseModel):
    membershipId: str
    name: str
    addedOn: str

class DonorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    membershipId: str
    name: str
    photo: Optional[str] = ""
    references: List[Reference] = []
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProfileCreate(BaseModel):
    name: str
    photo: Optional[str] = ""

class ReferenceAdd(BaseModel):
    membershipId: str
    name: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Clean Check API"}

@api_router.post("/profiles")
async def create_or_update_profile(profile: ProfileCreate):
    """
    Create a new profile with auto-generated membership ID or update existing
    """
    membership_id = str(uuid.uuid4())
    
    profile_doc = {
        "membershipId": membership_id,
        "name": profile.name,
        "photo": profile.photo or "",
        "references": [],
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.profiles.insert_one(profile_doc)
    
    return {
        "membershipId": membership_id,
        "name": profile.name,
        "photo": profile.photo
    }

@api_router.get("/profiles/{membership_id}")
async def get_profile(membership_id: str):
    """
    Get profile by membership ID
    """
    profile = await db.profiles.find_one({"membershipId": membership_id}, {"_id": 0})
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile

@api_router.put("/profiles/{membership_id}")
async def update_profile(membership_id: str, profile: ProfileCreate):
    """
    Update profile name and photo
    """
    existing = await db.profiles.find_one({"membershipId": membership_id})
    
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = {
        "name": profile.name,
        "photo": profile.photo or "",
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.profiles.update_one(
        {"membershipId": membership_id},
        {"$set": update_data}
    )
    
    return {"message": "Profile updated", "membershipId": membership_id}

@api_router.post("/profiles/{membership_id}/references")
async def add_reference(membership_id: str, reference: ReferenceAdd):
    """
    Add a reference to user's profile
    """
    profile = await db.profiles.find_one({"membershipId": membership_id})
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Check if reference exists
    ref_profile = await db.profiles.find_one({"membershipId": reference.membershipId})
    if not ref_profile:
        raise HTTPException(status_code=404, detail="Referenced profile not found")
    
    # Check if already added
    existing_refs = profile.get('references', [])
    if any(ref['membershipId'] == reference.membershipId for ref in existing_refs):
        raise HTTPException(status_code=400, detail="Reference already exists")
    
    new_reference = {
        "membershipId": reference.membershipId,
        "name": reference.name,
        "addedOn": datetime.now(timezone.utc).isoformat()
    }
    
    await db.profiles.update_one(
        {"membershipId": membership_id},
        {"$push": {"references": new_reference}}
    )
    
    return {"message": "Reference added", "reference": new_reference}

@api_router.delete("/profiles/{membership_id}/references/{ref_id}")
async def remove_reference(membership_id: str, ref_id: str):
    """
    Remove a reference from user's profile
    """
    profile = await db.profiles.find_one({"membershipId": membership_id})
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    await db.profiles.update_one(
        {"membershipId": membership_id},
        {"$pull": {"references": {"membershipId": ref_id}}}
    )
    
    return {"message": "Reference removed"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
