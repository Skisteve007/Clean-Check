from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBasic, HTTPBasicCredentials
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
import secrets
import base64


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Admin password
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBasic()

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
    paymentStatus: str = "pending"  # pending, confirmed, rejected
    documentUploaded: bool = False
    documentData: Optional[str] = ""
    qrCodeEnabled: bool = False
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProfileCreate(BaseModel):
    name: str
    photo: Optional[str] = ""

class ReferenceAdd(BaseModel):
    membershipId: str
    name: str

class AdminLogin(BaseModel):
    password: str

class SiteVisit(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    page: str = "/"

class PaymentConfirmation(BaseModel):
    membershipId: str
    paymentMethod: str
    amount: str
    transactionId: Optional[str] = ""
    notes: Optional[str] = ""

class DocumentUpload(BaseModel):
    membershipId: str
    documentData: str  # base64 encoded
    documentType: str

# Admin verification
def verify_admin(password: str):
    if not secrets.compare_digest(password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return True

# Routes
@api_router.get("/")
async def root():
    return {"message": "Clean Check API"}

# Track site visit
@api_router.post("/track-visit")
async def track_visit(visit: SiteVisit):
    await db.site_visits.insert_one(visit.model_dump())
    return {"status": "tracked"}

# Payment Confirmation - User submits
@api_router.post("/payment/confirm")
async def confirm_payment(payment: PaymentConfirmation):
    # Check if profile exists
    profile = await db.profiles.find_one({"membershipId": payment.membershipId})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Create payment confirmation record
    confirmation = {
        "membershipId": payment.membershipId,
        "name": profile.get("name", "Unknown"),
        "paymentMethod": payment.paymentMethod,
        "amount": payment.amount,
        "transactionId": payment.transactionId,
        "notes": payment.notes,
        "status": "pending",
        "submittedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_confirmations.insert_one(confirmation)
    
    # Update profile status to waiting for admin confirmation
    await db.profiles.update_one(
        {"membershipId": payment.membershipId},
        {"$set": {"paymentStatus": "pending_approval", "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Payment confirmation submitted. Waiting for admin confirmation.", "status": "pending_approval"}

# Admin - Get Pending Payment Confirmations
@api_router.get("/admin/payments/pending")
async def get_pending_payments(password: str):
    verify_admin(password)
    
    pending = await db.payment_confirmations.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("submittedAt", -1).to_list(100)
    
    return pending

# Admin - Approve Payment
@api_router.post("/admin/payments/approve/{membership_id}")
async def approve_payment(membership_id: str, password: str):
    verify_admin(password)
    
    # Update payment confirmation
    await db.payment_confirmations.update_one(
        {"membershipId": membership_id, "status": "pending"},
        {"$set": {"status": "approved", "approvedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Update profile to confirmed
    await db.profiles.update_one(
        {"membershipId": membership_id},
        {"$set": {
            "paymentStatus": "confirmed",
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Payment confirmed. User can now upload documents."}

# Admin - Reject Payment
@api_router.post("/admin/payments/reject/{membership_id}")
async def reject_payment(membership_id: str, password: str, reason: str = ""):
    verify_admin(password)
    
    # Update payment confirmation
    await db.payment_confirmations.update_one(
        {"membershipId": membership_id, "status": "pending"},
        {"$set": {
            "status": "rejected",
            "rejectedAt": datetime.now(timezone.utc).isoformat(),
            "rejectionReason": reason
        }}
    )
    
    # Update profile to rejected
    await db.profiles.update_one(
        {"membershipId": membership_id},
        {"$set": {
            "paymentStatus": "rejected",
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Payment rejected."}

# User - Upload Document
@api_router.post("/document/upload")
async def upload_document(doc: DocumentUpload):
    # Check if profile exists and payment is confirmed
    profile = await db.profiles.find_one({"membershipId": doc.membershipId})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile.get("paymentStatus") != "confirmed":
        raise HTTPException(status_code=403, detail="Payment must be approved before uploading documents")
    
    # Update profile with document
    await db.profiles.update_one(
        {"membershipId": doc.membershipId},
        {"$set": {
            "documentUploaded": True,
            "documentData": doc.documentData,
            "documentType": doc.documentType,
            "qrCodeEnabled": True,  # Enable QR code after document upload
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Document uploaded successfully. QR code is now available.", "qrCodeEnabled": True}

# User - Get Profile Status
@api_router.get("/profile/status/{membership_id}")
async def get_profile_status(membership_id: str):
    profile = await db.profiles.find_one({"membershipId": membership_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {
        "paymentStatus": profile.get("paymentStatus", "pending"),
        "documentUploaded": profile.get("documentUploaded", False),
        "qrCodeEnabled": profile.get("qrCodeEnabled", False)
    }

# Admin Login
@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    try:
        verify_admin(credentials.password)
        return {"success": True, "message": "Login successful"}
    except HTTPException:
        return {"success": False, "message": "Invalid password"}

# Admin Stats
@api_router.get("/admin/stats")
async def get_admin_stats(password: str):
    verify_admin(password)
    
    total_users = await db.profiles.count_documents({})
    
    # Count only actual references (optimized)
    total_references_result = await db.profiles.aggregate([
        {"$match": {"references": {"$exists": True, "$ne": []}}},
        {"$unwind": "$references"},
        {"$count": "total"}
    ]).to_list(1)
    
    total_visits = await db.site_visits.count_documents({})
    pending_payments = await db.payment_confirmations.count_documents({"status": "pending"})
    
    ref_count = total_references_result[0]['total'] if total_references_result else 0
    
    return {
        "totalUsers": total_users,
        "totalReferences": ref_count,
        "totalVisits": total_visits,
        "qrCodesGenerated": total_users,
        "pendingPayments": pending_payments
    }

# Admin - Get All Profiles
@api_router.get("/admin/profiles")
async def get_all_profiles(password: str, search: str = "", limit: int = 100, skip: int = 0):
    verify_admin(password)
    
    query = {}
    if search:
        query = {"$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"membershipId": {"$regex": search, "$options": "i"}}
        ]}
    
    # Add pagination for better performance
    profiles = await db.profiles.find(query, {"_id": 0}).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    return profiles

# Admin - Delete Profile
@api_router.delete("/admin/profiles/{membership_id}")
async def delete_profile(membership_id: str, password: str):
    verify_admin(password)
    
    result = await db.profiles.delete_one({"membershipId": membership_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile deleted successfully"}

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
        "paymentStatus": "pending",
        "documentUploaded": False,
        "qrCodeEnabled": False,
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

@app.on_event("startup")
async def create_indexes():
    """Create database indexes for optimal performance"""
    try:
        # Index on createdAt for sorting
        await db.profiles.create_index([("createdAt", -1)])
        # Index on membershipId for fast lookups
        await db.profiles.create_index([("membershipId", 1)], unique=True)
        # Index on name for search
        await db.profiles.create_index([("name", 1)])
        # Index on payment status
        await db.profiles.create_index([("paymentStatus", 1)])
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning (may already exist): {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
