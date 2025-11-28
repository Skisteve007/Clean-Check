# 👤 Donor Profile Page - Complete Overview

## 📋 Page Structure

The **Donor Profile Page** is accessible after a user completes payment and their account is activated. It's located in the **"Profile" tab** of the main application.

---

## 🎯 What's On the Profile Page

### 1. **Header Section**
- **Clean Check** logo and branding
- Tagline: "Elevating Intimacy through Verified Transparency and Mutual Trust"
- Two tabs: **QR Code** | **Profile**

### 2. **Membership Information Box**
```
📝 Profile & Membership

Your Unique Membership ID (UID): [6-digit Member ID]
Example: MEM-123456

"Use this ID to be verified by other members"
```

### 3. **Reference Lookup Box**
```
1. Reference Lookup Box

Enter a member's **Membership ID** to verify their profile 
and save it as a permanent reference.

[Input Field: Enter Member's Unique ID]  [Look Up ID Button]
```

### 4. **Saved References Section**
```
2. Your Saved References (0)

No permanent references saved yet. Use the lookup box above to add one.
```

---

## 📝 Profile Creation Form

Once the user's account is activated (after payment), they can create their profile with the following fields:

### **Personal Information**

#### **Full Name** *
- Text input
- Required field

#### **Profile Photo**
- File upload button
- Accepts image files
- Optional

#### **Birthday** *
- Three dropdowns:
  - **Day:** 1-31
  - **Month:** January-December
  - **Year:** 1923-2006 (18+ years old)
- Required

---

### **Identity & Orientation**

#### **I Identify As** *
Three button options:
- 🔵 **Male**
- 🔵 **Female**
- 🔵 **Transgender**

Required field

#### **Sexual Orientation** *
Five button options:
- 🔵 **Gay**
- 🔵 **Bi**
- 🔵 **Straight**
- 🔵 **Pansexual**
- 🔵 **Asexual**

Required field

---

### **Relationship Information**

#### **Relationship Status** *
Dropdown menu:
- Single
- Married
- Separated
- Open
- Poly

Required field

#### **I Prefer** (Select all that apply)
Three checkboxes:
- ☐ **Couples**
- ☐ **Females**
- ☐ **Males**

Multiple selections allowed

---

### **Health Information**

#### **COVID Vaccination Status**
Checkbox with special styling (red background box):
- ☐ **COVID Vaccination Status: Yes/No**

Toggles between Yes and No when clicked

#### **Health Document Upload** *
```
📋 Upload Health Document

Upload your health verification document (test results, 
vaccination records, etc.)

[Choose File Button]

Supported formats: PDF, JPG, PNG, JPEG
Max size: 5MB
```

Required field - Users must upload a health document

---

### **Status Color Selection** *

Choose a color to represent your health status:

```
🔴 Red      [Button]
🟡 Yellow   [Button]  
🟢 Green    [Button]
```

**Color Meanings:**
- **🔴 Red:** High risk/caution
- **🟡 Yellow:** Moderate/requires discussion
- **🟢 Green:** Clear/verified

Required field

---

### **Save Profile Button**

```
💾 Save Profile
```

Large button at the bottom of the form

---

## 🎨 Visual Design

### **Color Scheme:**
- Primary: Red (#DC2626)
- Secondary: Gray backgrounds
- Accents: Green for success, Yellow for warnings

### **Layout:**
- Clean, card-based design
- Ample white space
- Clear section separators
- Mobile-responsive (works on all devices)

### **Typography:**
- Headers: Bold, large text
- Labels: Clear, readable font
- Placeholders: Light gray text

---

## 🔒 Security Features

### **Private Information:**
- Profile data is encrypted
- Only visible to verified members
- QR code required for access

### **Document Storage:**
- Health documents stored securely
- Base64 encoded in database
- Only accessible by member and authorized viewers

---

## ✅ After Profile Creation

Once the profile is saved:

1. **Success message** appears: "Profile saved successfully!"
2. **QR Code is generated** automatically
3. User can now:
   - View their QR code (QR Code tab)
   - Download their QR code
   - Share with partners
   - Update profile anytime
   - Add references to their network

---

## 📱 QR Code Generation

After profile creation, the system generates a unique QR code that contains:
- Member's unique ID
- Link to their profile
- Verification status

**QR Code Features:**
- High-quality PNG format
- Scannable by any QR code reader
- Downloadable
- Printable
- Contains encrypted member information

---

## 🎯 Profile Page Flow

```
1. User completes payment
   ↓
2. Account activated automatically
   ↓
3. Profile page becomes accessible
   ↓
4. User fills out profile form
   ↓
5. Uploads health document
   ↓
6. Selects status color
   ↓
7. Clicks "Save Profile"
   ↓
8. QR Code generated automatically
   ↓
9. User can download and share QR code
```

---

## 📋 Form Validation

**Required Fields (marked with *):**
- Full Name
- Birthday (Day, Month, Year)
- Gender Identity
- Sexual Orientation
- Relationship Status
- Health Document Upload
- Status Color

**Optional Fields:**
- Profile Photo
- Partner Preferences
- COVID Vaccination Status

**Validation Rules:**
- All required fields must be filled
- Age must be 18 or older
- Health document must be valid file type
- File size must be under 5MB

---

## 🌟 Special Features

### **1. Reference System**
- Members can look up other members by ID
- Save verified profiles as references
- Build a trusted network

### **2. Status Color System**
Unique color-coded health status:
- Visual indicator of health verification
- Easy to understand at a glance
- Appears on profile and QR code

### **3. Health Document Verification**
- Required for all members
- Stored securely
- Can be updated anytime
- Provides transparency

### **4. Privacy Controls**
- Profile only visible via QR code scan
- No public directory
- Member controls who sees their info

---

## 📍 Where to Find Profile Page

**URL Path:** `/` (main application)
**Tab:** Click "Profile" tab at the top
**Requirement:** Must be logged in with activated account

---

## 🎨 Sample Profile Page Sections

### **Top Section:**
```
┌─────────────────────────────────────┐
│  ✅ Clean Check                     │
│  Elevating Intimacy through         │
│  Verified Transparency and          │
│  Mutual Trust                       │
└─────────────────────────────────────┘

┌──────────────┬──────────────┐
│  QR Code     │  Profile ✓   │
└──────────────┴──────────────┘
```

### **Membership Info:**
```
┌─────────────────────────────────────┐
│  📝 Profile & Membership            │
│                                     │
│  Your Unique Membership ID (UID)    │
│  MEM-123456                         │
│                                     │
│  Use this ID to be verified by      │
│  other members                      │
└─────────────────────────────────────┘
```

### **Profile Form Sample:**
```
┌─────────────────────────────────────┐
│  Full Name *                        │
│  [___________________________]      │
│                                     │
│  Profile Photo                      │
│  [Choose File]                      │
│                                     │
│  Birthday *                         │
│  [Day ▼] [Month ▼] [Year ▼]        │
│                                     │
│  I Identify As *                    │
│  [Male] [Female] [Transgender]      │
│                                     │
│  Sexual Orientation *               │
│  [Gay] [Bi] [Straight]              │
│  [Pansexual] [Asexual]              │
│                                     │
│  ...                                │
│                                     │
│  [💾 Save Profile]                  │
└─────────────────────────────────────┘
```

---

## 🚀 Key Benefits

✅ **Complete Profile Management** - All information in one place
✅ **Easy to Use** - Intuitive form design
✅ **Secure** - Private and encrypted
✅ **Verified** - Health document required
✅ **Transparent** - Color-coded status system
✅ **Connected** - Reference lookup system
✅ **Shareable** - QR code generation

---

## 📝 Summary

The **Donor Profile Page** is a comprehensive member profile management system that includes:

- Personal information collection
- Identity and orientation selection
- Relationship status and preferences
- Health document verification
- COVID vaccination tracking
- Status color selection
- Reference lookup system
- QR code generation
- Secure data storage

**Purpose:** Create verified, transparent health status profiles for safe, informed intimate connections.

---

_Last Updated: 2025-11-28_
_System Status: Fully Operational_
