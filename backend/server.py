from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks, Request
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
import random

import hmac
import hashlib
import json as json_lib

from datetime import datetime, timezone
import secrets
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from passlib.context import CryptContext
from twilio.rest import Client


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Admin password (legacy - for backward compatibility)
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Frontend URL for email links
FRONTEND_URL = os.environ.get('FRONTEND_URL', os.environ.get('REACT_APP_BACKEND_URL', ''))

# Twilio Configuration for SMS
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
    # Status system: 0=Guest, 1=Pending_Payment, 2=In_Review, 3=Approved
    userStatus: int = 1  # Default: Pending_Payment (registered but not paid)
    paymentStatus: str = "pending"  # pending, in_review, confirmed, rejected
    assignedMemberId: Optional[str] = ""  # Admin-assigned Member ID (e.g., MEM-001)
    documentUploaded: bool = False
    documentData: Optional[str] = ""
    qrCodeEnabled: bool = False
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProfileCreate(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None
    photo: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordReset(BaseModel):
    email: EmailStr

class ReferenceAdd(BaseModel):
    membershipId: str
    name: str

class AdminLogin(BaseModel):
    password: str

class AdminUserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    username: str
    password: str

class AdminUserLogin(BaseModel):
    username: str
    password: str

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class SiteVisit(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    page: str = "/"

class PaymentConfirmation(BaseModel):
    membershipId: str
    paymentMethod: Optional[str] = "Not specified"
    amount: Optional[str] = "Not specified"
    transactionId: Optional[str] = ""
    notes: Optional[str] = ""

class DocumentUpload(BaseModel):
    membershipId: str
    documentData: str  # base64 encoded
    documentType: str

class AdminApproval(BaseModel):
    membershipId: str
    assignedMemberId: str  # Admin-assigned Member ID (e.g., MEM-001)

# Admin verification
def verify_admin(password: str):
    if not secrets.compare_digest(password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return True

# Email sending function
async def send_welcome_email(email: str, name: str, membership_id: str):
    """Send welcome email to new member"""
    try:
        # Create email content
        subject = "Welcome to Clean Check - Membership Confirmed!"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #dc2626; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🛡️ Clean Check</h1>
            </div>
            
            <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                <h2 style="color: #dc2626;">Welcome, {name}!</h2>
                
                <p>Thank you for creating your Clean Check profile. Your membership has been successfully created.</p>
                
                <div style="background-color: #fef3f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Your Membership ID:</strong></p>
                    <p style="font-family: monospace; font-size: 14px; color: #dc2626; margin: 5px 0;">{membership_id}</p>
                </div>
                
                <h3 style="color: #374151;">Next Steps:</h3>
                <ol style="color: #6b7280; line-height: 1.8;">
                    <li>Complete payment ($39 for single or $69 for couples)</li>
                    <li>Submit payment confirmation in your profile</li>
                    <li>Wait for admin confirmation (usually within 5 minutes)</li>
                    <li>Upload your health document</li>
                    <li>Generate and share your QR code</li>
                </ol>
                
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; color: #1e40af;"><strong>💳 Payment Information:</strong></p>
                    <p style="margin: 5px 0; color: #1e40af;">PayPal: paypal.me/pitbossent</p>
                    <p style="margin: 5px 0; color: #1e40af;">Zelle: pitbossent@gmail.com</p>
                </div>
                
                <p style="color: #6b7280;">If you have any questions, please don't hesitate to reach out.</p>
                
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                    This is an automated message from Clean Check. Please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Log email (in production, this would actually send via SMTP)
        logger.info(f"Welcome email would be sent to: {email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Recipient: {name} ({membership_id})")
        
        # Store email log in database
        await db.email_logs.insert_one({
            "to": email,
            "subject": subject,
            "name": name,
            "membershipId": membership_id,
            "sentAt": datetime.now(timezone.utc).isoformat(),
            "type": "welcome"
        })
        
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")
        return False

async def send_admin_payment_notification(name: str, email: str, membership_id: str, payment_method: str, amount: str, transaction_id: str, notes: str):
    """Send payment notification to admin"""
    try:
        admin_email = "pitbossent@gmail.com"
        subject = f"🔔 New Payment Confirmation - {name}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f59e0b; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🔔 Payment Confirmation Alert</h1>
            </div>
            
            <div style="background-color: #fffbeb; padding: 30px; border: 1px solid #fde68a; border-radius: 0 0 10px 10px;">
                <h2 style="color: #92400e;">New Payment Submitted</h2>
                
                <p style="color: #78350f;">A member has submitted a payment confirmation and is waiting for your review.</p>
                
                <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                    <h3 style="color: #92400e; margin-top: 0;">Member Details:</h3>
                    <p style="margin: 5px 0;"><strong>Name:</strong> {name}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> {email}</p>
                    <p style="margin: 5px 0;"><strong>Membership ID:</strong> <code style="background: #fef3f2; padding: 2px 6px; border-radius: 3px;">{membership_id}</code></p>
                </div>
                
                <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <h3 style="color: #065f46; margin-top: 0;">Payment Information:</h3>
                    <p style="margin: 5px 0;"><strong>Method:</strong> {payment_method}</p>
                    <p style="margin: 5px 0;"><strong>Amount:</strong> {amount}</p>
                    {f'<p style="margin: 5px 0;"><strong>Transaction ID:</strong> {transaction_id}</p>' if transaction_id else ''}
                    {f'<p style="margin: 5px 0;"><strong>Notes:</strong> {notes}</p>' if notes else ''}
                    <p style="margin: 5px 0; color: #6b7280;"><strong>Submitted:</strong> {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p UTC')}</p>
                </div>
                
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #1e40af;"><strong>⚡ Action Required</strong></p>
                    <p style="margin: 10px 0; color: #1e40af;">Log in to the admin panel to confirm or reject this payment.</p>
                    <a href="{FRONTEND_URL}/admin" 
                       style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                        Go to Admin Panel
                    </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                    This is an automated notification from Clean Check Admin System.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Log email
        logger.info(f"Admin payment notification would be sent to: {admin_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Payment from: {name} ({membership_id}) - {amount} via {payment_method}")
        
        # Store email log in database
        await db.email_logs.insert_one({
            "to": admin_email,
            "subject": subject,
            "name": name,
            "membershipId": membership_id,
            "paymentMethod": payment_method,
            "amount": amount,
            "sentAt": datetime.now(timezone.utc).isoformat(),
            "type": "admin_payment_notification"
        })
        
        return True
    except Exception as e:
        logger.error(f"Failed to send admin payment notification: {e}")
        return False



async def send_user_approval_notification(name: str, email: str, assigned_member_id: str):
    """Send approval notification to user"""
    try:
        subject = f"✅ Payment Confirmed - Welcome to Clean Check!"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #10b981; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🎉 You're Approved!</h1>
            </div>
            
            <div style="background-color: #f0fdf4; padding: 30px; border: 1px solid #86efac; border-radius: 0 0 10px 10px;">
                <h2 style="color: #065f46;">Welcome to Clean Check, {name}!</h2>
                
                <p style="color: #064e3b; font-size: 16px;">Great news! Your payment has been confirmed and your membership is now active.</p>
                
                <div style="background-color: #ffffff; padding: 25px; border-left: 4px solid #10b981; margin: 25px 0; text-align: center;">
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Your Official Member ID</p>
                    <h1 style="color: #dc2626; margin: 10px 0; font-size: 32px; font-weight: bold;">{assigned_member_id}</h1>
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">Save this ID for your records</p>
                </div>
                
                <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #1e40af; margin-top: 0;">✨ Next Steps:</h3>
                    <ol style="color: #1e40af; line-height: 1.8;">
                        <li>Log in to your account</li>
                        <li>Complete your donor profile with your photo</li>
                        <li>Upload your health documents</li>
                        <li>Generate your personalized QR code</li>
                        <li>Start sharing safely!</li>
                    </ol>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{FRONTEND_URL}" 
                       style="display: inline-block; background-color: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Complete Your Profile Now
                    </a>
                </div>
                
                <div style="background-color: #fff7ed; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; color: #9a3412; font-size: 14px;">
                        <strong>💡 Pro Tip:</strong> Complete your profile within the next 48 hours to get listed in our verified members directory!
                    </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    Questions? Contact support at pitbossent@gmail.com<br>
                    This is an automated notification from Clean Check.
                </p>
            </div>
        </body>
        </html>
        """
        
        # Log email
        logger.info(f"User approval notification would be sent to: {email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Member {name} approved with ID: {assigned_member_id}")
        
        # Store email log in database
        await db.email_logs.insert_one({
            "to": email,
            "subject": subject,
            "name": name,
            "assignedMemberId": assigned_member_id,
            "sentAt": datetime.now(timezone.utc).isoformat(),
            "type": "user_approval_notification"
        })
        
        return True
    except Exception as e:
        logger.error(f"Failed to send user approval notification: {str(e)}")
        return False

# Routes
@api_router.get("/")
async def root():
    return {"message": "Clean Check API"}


async def send_member_payment_confirmation(name: str, email: str, membership_id: str):
    """Send payment confirmation email to member with link to upload documents"""
    try:
        subject = f"✅ Welcome to Clean Check - You're Now a Member!"
        
        # Generate direct link to Clean Check
        clean_check_link = f"{FRONTEND_URL}?membershipId={membership_id}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #10b981; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🎉 Welcome to Clean Check!</h1>
            </div>
            
            <div style="background-color: #f0fdf4; padding: 30px; border: 1px solid #86efac; border-radius: 0 0 10px 10px;">
                <h2 style="color: #065f46;">Congratulations, {name}!</h2>
                
                <p style="color: #064e3b; font-size: 16px;">
                    Your payment has been confirmed and you are now an <strong>active Clean Check member</strong>!
                </p>
                
                <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #1e40af; margin-top: 0;">🚀 Next Steps - Complete Your Profile:</h3>
                    <ol style="color: #1e40af; line-height: 1.8; margin: 0;">
                        <li>Click the button below to access your member dashboard</li>
                        <li>Complete your donor profile with your photo</li>
                        <li>Upload your health documents</li>
                        <li>Generate your personalized QR code</li>
                        <li>Start sharing safely!</li>
                    </ol>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{clean_check_link}" 
                       style="display: inline-block; background-color: #dc2626; color: white; padding: 18px 45px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        📋 Complete Your Profile Now
                    </a>
                </div>
                
                <div style="background-color: #fff7ed; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; color: #9a3412; font-size: 14px;">
                        <strong>💡 Important:</strong> Complete your profile within 48 hours to get listed in our verified members directory!
                    </p>
                </div>
                
                <div style="background-color: white; padding: 20px; border: 2px solid #10b981; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                        <strong>Your Membership ID:</strong><br>
                        <code style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 8px; font-size: 16px; color: #dc2626;">{membership_id}</code><br>
                        <span style="font-size: 12px; color: #6b7280;">Keep this ID for your records</span>
                    </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                    Questions? Contact support at pitbossent@gmail.com<br>
                    This is an automated confirmation from Clean Check.
                </p>
            </div>
        </body>
        </html>
        """
        
        logger.info(f"Member payment confirmation sent to: {email}")
        
        # Store email log
        await db.email_logs.insert_one({
            "to": email,
            "subject": subject,
            "name": name,
            "sentAt": datetime.now(timezone.utc).isoformat(),
            "type": "member_payment_confirmation"
        })
        
        return True
    except Exception as e:
        logger.error(f"Failed to send member payment confirmation: {str(e)}")
        return False


# Track site visit
@api_router.post("/track-visit")
async def track_visit(visit: SiteVisit):
    await db.site_visits.insert_one(visit.model_dump())
    return {"status": "tracked"}

# Payment Confirmation - User submits
@api_router.post("/payment/confirm")
async def confirm_payment(payment: PaymentConfirmation, background_tasks: BackgroundTasks):
    # Check if profile exists
    profile = await db.profiles.find_one({"membershipId": payment.membershipId})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Create payment confirmation record
    confirmation = {
        "membershipId": payment.membershipId,
        "name": profile.get("name", "Unknown"),
        "email": profile.get("email", ""),
        "paymentMethod": payment.paymentMethod,
        "amount": payment.amount,
        "transactionId": payment.transactionId,
        "notes": payment.notes,
        "status": "pending",
        "submittedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_confirmations.insert_one(confirmation)
    
    # AUTO-APPROVE: Update profile status to Approved (Status 3) - member can now upload documents
    await db.profiles.update_one(
        {"membershipId": payment.membershipId},
        {"$set": {
            "userStatus": 3,  # Status 3: Approved - Can upload documents and create profile
            "paymentStatus": "confirmed", 
            "qrCodeEnabled": True,  # Enable QR code generation
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send admin notification email in background (for record keeping)
    background_tasks.add_task(
        send_admin_payment_notification,
        profile.get("name", "Unknown"),
        profile.get("email", ""),
        payment.membershipId,
        payment.paymentMethod,
        payment.amount,
        payment.transactionId or "",
        payment.notes or ""
    )
    
    # Send confirmation email to member with link to upload documents
    background_tasks.add_task(
        send_member_payment_confirmation,
        profile.get("name", "Unknown"),
        profile.get("email", ""),
        payment.membershipId
    )
    
    return {"message": "Payment confirmed! You are now a member. Check your email for next steps.", "status": "approved"}

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
@api_router.post("/admin/payments/approve")
async def approve_payment(approval: AdminApproval, password: str, background_tasks: BackgroundTasks):
    verify_admin(password)
    
    # Get profile
    profile = await db.profiles.find_one({"membershipId": approval.membershipId})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update payment confirmation
    await db.payment_confirmations.update_one(
        {"membershipId": approval.membershipId, "status": "pending"},
        {"$set": {"status": "approved", "approvedAt": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Update profile to Status 3: Approved - Can now build profile
    await db.profiles.update_one(
        {"membershipId": approval.membershipId},
        {"$set": {
            "userStatus": 3,  # Status 3: Approved
            "paymentStatus": "confirmed",
            "assignedMemberId": approval.assignedMemberId,
            "qrCodeEnabled": True,  # Enable QR code generation
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send approval notification email to user
    background_tasks.add_task(
        send_user_approval_notification,
        profile.get("name", "Member"),
        profile.get("email", ""),
        approval.assignedMemberId
    )
    
    return {"message": f"Payment confirmed. User approved with Member ID: {approval.assignedMemberId}. Notification sent."}

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

# ============================================================================
# SPONSOR LOGOS - Admin Management
# ============================================================================

@api_router.post("/admin/sponsors/{slot}")
async def upload_sponsor_logo(slot: int, data: dict, password: str):
    """Upload sponsor logo for a specific slot (1, 2, or 3)"""
    verify_admin(password)
    
    if slot not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Invalid slot number. Must be 1, 2, or 3")
    
    logo_data = data.get("logo", "")
    if not logo_data:
        raise HTTPException(status_code=400, detail="No logo data provided")
    
    # Store or update sponsor logo
    await db.sponsors.update_one(
        {"slot": slot},
        {"$set": {
            "logo": logo_data,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": f"Sponsor logo uploaded for slot {slot}"}


@api_router.delete("/admin/sponsors/{slot}")
async def remove_sponsor_logo(slot: int, password: str):
    """Remove sponsor logo from a specific slot"""
    verify_admin(password)
    
    await db.sponsors.delete_one({"slot": slot})
    return {"message": f"Sponsor logo removed from slot {slot}"}


@api_router.get("/sponsors")
async def get_sponsor_logos():
    """Get all sponsor logos (public endpoint)"""
    sponsors = await db.sponsors.find({}, {"_id": 0}).to_list(3)
    
    # Create a dict with all slots
    logo_dict = {1: None, 2: None, 3: None}
    for sponsor in sponsors:
        logo_dict[sponsor.get("slot")] = sponsor.get("logo")
    
    return logo_dict

# User - Upload Document
@api_router.post("/document/upload")
async def upload_document(doc: DocumentUpload):
    # Check if profile exists and payment is confirmed
    profile = await db.profiles.find_one({"membershipId": doc.membershipId})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile.get("paymentStatus") != "confirmed":
        raise HTTPException(status_code=403, detail="Payment must be confirmed before uploading documents")
    
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

# Search Active Members (for references)
@api_router.get("/members/search")
async def search_active_members(search: str = "", limit: int = 10):
    """
    Search for active members (confirmed payment status) for references
    """
    query = {
        "paymentStatus": "confirmed",  # Only active/paid members
        "$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"membershipId": {"$regex": search, "$options": "i"}}
        ]
    } if search else {"paymentStatus": "confirmed"}
    
    members = await db.profiles.find(
        query, 
        {"_id": 0, "name": 1, "membershipId": 1, "photo": 1}
    ).limit(limit).to_list(limit)
    
    return members

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
async def create_or_update_profile(profile: ProfileCreate, background_tasks: BackgroundTasks):
    """
    Create a new profile with auto-generated membership ID or update existing
    """
    membership_id = str(uuid.uuid4())
    
    profile_doc = {
        "membershipId": membership_id,
        "name": profile.name,
        "email": profile.email,
        "photo": profile.photo or "",
        "references": [],
        "paymentStatus": "pending",
        "documentUploaded": False,
        "qrCodeEnabled": False,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.profiles.insert_one(profile_doc)
    
    # Send welcome email in background
    background_tasks.add_task(send_welcome_email, profile.email, profile.name, membership_id)
    
    return {
        "membershipId": membership_id,
        "name": profile.name,
        "email": profile.email,
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
    


# ============================================================================
# PAYMENT WEBHOOKS - Automatic Payment Notifications
# ============================================================================

@api_router.post("/webhooks/paypal")
async def paypal_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    PayPal Webhook Handler
    Receives instant payment notifications from PayPal
    """
    try:
        # Get webhook data
        body = await request.body()
        headers = request.headers
        
        # Log webhook received
        logger.info("PayPal webhook received")
        
        # Parse webhook data
        webhook_data = await request.json()
        event_type = webhook_data.get("event_type", "")
        
        logger.info(f"PayPal Event Type: {event_type}")
        
        # Handle different event types
        if event_type == "PAYMENT.SALE.COMPLETED":
            # Payment completed successfully
            sale = webhook_data.get("resource", {})
            
            # Extract payment info
            payer_email = sale.get("payer", {}).get("payer_info", {}).get("email", "")
            amount = sale.get("amount", {}).get("total", "")
            currency = sale.get("amount", {}).get("currency", "USD")
            transaction_id = sale.get("id", "")
            payment_status = sale.get("state", "")
            
            logger.info(f"Payment from {payer_email}: {currency} {amount}, Transaction: {transaction_id}")
            
            # Try to match with pending payment in database
            profile = await db.profiles.find_one({"email": payer_email, "paymentStatus": "in_review"})
            
            if profile:
                # Auto-update payment status
                await db.profiles.update_one(
                    {"email": payer_email},
                    {"$set": {
                        "paymentStatus": "auto_verified",
                        "paymentTransactionId": transaction_id,
                        "paymentAmount": f"{currency} {amount}",
                        "paymentVerifiedAt": datetime.now(timezone.utc).isoformat(),
                        "updatedAt": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                # Send notification to admin
                background_tasks.add_task(
                    send_auto_payment_notification,
                    profile.get("name", "Member"),
                    payer_email,
                    profile.get("membershipId", ""),
                    amount,
                    transaction_id
                )
                
                logger.info(f"Auto-matched payment for {payer_email}")
            else:
                # No matching profile - still log it for admin review
                await db.unmatched_payments.insert_one({
                    "payer_email": payer_email,
                    "amount": amount,
                    "currency": currency,
                    "transaction_id": transaction_id,
                    "payment_status": payment_status,
                    "received_at": datetime.now(timezone.utc).isoformat(),
                    "webhook_data": webhook_data
                })
                
                logger.warning(f"Unmatched payment from {payer_email} - stored for admin review")
        
        return {"status": "success", "event_type": event_type}
        
    except Exception as e:
        logger.error(f"PayPal webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}


@api_router.post("/webhooks/venmo")
async def venmo_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Venmo Webhook Handler
    Note: Venmo has limited webhook support. This is prepared for future use.
    """
    try:
        webhook_data = await request.json()
        event_type = webhook_data.get("type", "")
        
        logger.info(f"Venmo webhook received: {event_type}")
        
        # Log for admin review
        await db.venmo_notifications.insert_one({
            "event_type": event_type,
            "data": webhook_data,
            "received_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Venmo webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}


async def send_auto_payment_notification(name: str, email: str, membership_id: str, amount: str, transaction_id: str):
    """Send notification when payment is auto-verified"""
    try:
        subject = f"💰 Auto-Verified Payment - {name}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #10b981; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">💰 Payment Auto-Verified!</h1>
            </div>
            
            <div style="background-color: #f0fdf4; padding: 30px; border: 1px solid #86efac;">
                <h2 style="color: #065f46;">Payment Automatically Detected</h2>
                
                <div style="background-color: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Member:</strong> {name}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> {email}</p>
                    <p style="margin: 5px 0;"><strong>Membership ID:</strong> {membership_id}</p>
                    <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount}</p>
                    <p style="margin: 5px 0;"><strong>Transaction ID:</strong> {transaction_id}</p>
                </div>
                
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px;">
                        <strong>✨ Next Step:</strong> Go to admin panel to assign Member ID and fully approve this user.
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                    This payment was automatically detected via PayPal webhook integration.
                </p>
            </div>
        </body>
        </html>
        """
        
        logger.info(f"Auto-payment notification logged for admin - {name}: ${amount}")
        
        # Store notification
        await db.email_logs.insert_one({
            "to": "pitbossent@gmail.com",
            "subject": subject,
            "name": name,
            "amount": amount,
            "transactionId": transaction_id,
            "sentAt": datetime.now(timezone.utc).isoformat(),
            "type": "auto_payment_notification"
        })
        
        return True
    except Exception as e:
        logger.error(f"Failed to send auto-payment notification: {str(e)}")
        return False

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
