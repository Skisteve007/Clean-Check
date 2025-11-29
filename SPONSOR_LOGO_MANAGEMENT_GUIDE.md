# 🏢 Sponsor Logo Management Guide

## Overview

Your Clean Check application has a **Sponsor Logo Management System** that allows you (the admin) to add, update, and remove sponsor logos that are displayed throughout the website.

---

## 📍 Where Sponsor Logos Appear

Sponsor logos are displayed in the **"Trusted By Community Sponsors"** section, which appears:
- On the main page (QR Code tab)
- In the Profile tab
- Throughout the application

The section shows **3 sponsor slots** with distinct colored backgrounds:
- **Slot 1:** Yellow background
- **Slot 2:** Green background  
- **Slot 3:** Blue background

When no logo is uploaded, each slot shows placeholder text: "Sponsor 1", "Sponsor 2", "Sponsor 3"

---

## 🎯 How to Manage Sponsor Logos

### Step 1: Access the Admin Panel

1. Navigate to: `https://healthqr-3.preview.emergentagent.com/admin`
2. Enter admin password: `admin123`
3. Click "Login"

### Step 2: Navigate to Sponsor Logos Tab

1. Click on the **"Sponsor Logos"** tab in the admin panel
2. You'll see 3 sponsor logo slots

### Step 3: Upload a Sponsor Logo

**For any empty slot (showing "No logo"):**

1. Click the **"Choose File"** button in the slot you want to fill
2. Select an image file from your computer
   - Supported formats: PNG, JPG, JPEG, GIF, SVG
   - Recommended: Square or rectangular logo with transparent background
   - Optimal size: 200x100 pixels or similar aspect ratio
3. The logo will upload automatically
4. You'll see a success message: "Sponsor Logo [X] uploaded!"
5. The logo will appear in the preview box

**Important Notes:**
- Logos are stored as base64 data in the database
- Logos persist across the entire website
- Changes are immediate - no page refresh needed

### Step 4: Update an Existing Logo

1. Click the **"Remove Logo"** button on the slot you want to update
2. Confirm the removal
3. The slot will return to "No logo" state
4. Click **"Choose File"** to upload a new logo
5. Success! The new logo is now displayed

### Step 5: Remove a Sponsor Logo

1. Click the **"Remove Logo"** button on the slot you want to clear
2. Confirm the removal with "OK" in the popup
3. You'll see: "Sponsor Logo [X] removed"
4. The slot returns to showing "No logo"
5. The main page will now show the placeholder text again

---

## 🔍 Verifying Sponsor Logos

### On the Main Page:

1. Visit: `https://healthqr-3.preview.emergentagent.com`
2. Complete age consent
3. Click "Enter Clean Check"
4. Scroll down to find the **"🔒 Trusted By Community Sponsors"** section
5. Your uploaded logos should appear in their respective colored boxes

### In the Admin Panel:

1. Go to `/admin` → "Sponsor Logos" tab
2. All uploaded logos are visible in their preview boxes
3. Empty slots show "No logo"

---

## 🎨 Best Practices for Sponsor Logos

### Image Guidelines:

**Size:**
- Recommended: 200x100 to 300x150 pixels
- Max display size: Logos will be scaled to fit within 100px height box
- Aspect ratio: Horizontal logos work best

**Format:**
- **Best:** PNG with transparent background
- **Good:** SVG (vector graphics)
- **Acceptable:** JPG/JPEG (white background recommended)

**Quality:**
- Use high-resolution images
- Ensure logos are clear and readable when small
- Avoid overly detailed logos that become unclear at small sizes

### Design Tips:

1. **Simple is Better:** Logos with simple shapes and bold text work best
2. **Contrast:** Ensure good contrast with the colored backgrounds
3. **Consistency:** Try to maintain similar style/size across all 3 sponsors
4. **Professional:** Use official sponsor logos (don't create custom ones without permission)

---

## 🔐 Security & Permissions

### Admin Only:
- **Only admins can:**
  - Upload sponsor logos
  - Remove sponsor logos
  - View the admin panel
  
- **Regular users:**
  - Can only VIEW sponsor logos on the main page
  - Cannot edit or remove logos
  - Cannot access the admin panel

### Logo Storage:
- Logos are stored in MongoDB database
- Stored as base64-encoded strings
- Persist across server restarts
- Only admin password can modify them

---

## 🛠️ Technical Details

### Backend Endpoints:

**Upload/Update Logo:**
```
POST /api/admin/sponsors/{slot}?password=admin123
Body: { "logo": "data:image/png;base64,..." }
```

**Remove Logo:**
```
DELETE /api/admin/sponsors/{slot}?password=admin123
```

**Get All Logos (Public):**
```
GET /api/sponsors
Response: {
  "1": "data:image/png;base64,..." or null,
  "2": "data:image/png;base64,..." or null,
  "3": "data:image/png;base64,..." or null
}
```

### Database Collection:
- Collection: `sponsors`
- Documents:
  ```json
  {
    "slot": 1,  // 1, 2, or 3
    "logo": "data:image/png;base64,...",
    "updatedAt": "2025-11-28T12:00:00Z"
  }
  ```

---

## ❓ Troubleshooting

### "Failed to upload sponsor logo"
**Possible Causes:**
- File is too large (try compressing the image)
- Unsupported file format (use PNG/JPG/SVG)
- Not logged in to admin panel
- Incorrect admin password

**Solutions:**
1. Ensure you're logged in to admin panel
2. Try a smaller image file (under 1MB)
3. Convert image to PNG format
4. Clear browser cache and try again

### Logo doesn't appear on main page
**Possible Causes:**
- Browser cache showing old version
- Logo upload didn't complete
- Logo was removed after upload

**Solutions:**
1. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. Check admin panel to verify logo is still uploaded
3. Re-upload the logo
4. Clear browser cache

### Logo appears stretched or distorted
**Possible Causes:**
- Image has unusual aspect ratio
- Image is very large or very small

**Solutions:**
1. Resize image to recommended dimensions (200x100px)
2. Use a horizontal logo format
3. Ensure image has appropriate aspect ratio (2:1 or 3:1)

### Can't remove a logo
**Possible Causes:**
- Not logged in as admin
- Network error

**Solutions:**
1. Ensure you're logged in with correct admin password
2. Check browser console for errors (F12 → Console)
3. Try refreshing the admin panel page

---

## 📊 Current Status

✅ **Sponsor Logo System Active**
- 3 sponsor slots available
- Currently all slots are empty (showing placeholders)
- Admin can upload logos at any time
- Logos will display immediately after upload

---

## 📝 Quick Reference

### Admin Panel Access:
- **URL:** `/admin`
- **Password:** `admin123`
- **Tab:** "Sponsor Logos"

### Slots:
- **Slot 1:** Yellow background
- **Slot 2:** Green background
- **Slot 3:** Blue background

### Actions:
- **Upload:** Click "Choose File" → Select image
- **Remove:** Click "Remove Logo" → Confirm
- **Update:** Remove old logo → Upload new logo

---

## 🎉 Summary

Your sponsor logo management system is **fully functional and ready to use**!

**What you can do:**
- ✅ Upload logos for all 3 sponsor slots
- ✅ Remove logos at any time
- ✅ Update logos by removing and re-uploading
- ✅ Logos persist in database and display site-wide
- ✅ Only admin can modify logos (secure)

**Next step:** Go to `/admin` → "Sponsor Logos" tab and start uploading your sponsor logos!

---

_Last Updated: 2025-11-28_
_System Status: Fully Operational_
