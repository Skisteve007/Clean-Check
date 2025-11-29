#!/usr/bin/env python3
"""
Focused test for Sponsor Logo Management System
Tests the specific endpoints requested in the review
"""

import requests
import json
import base64

class SponsorLogoTester:
    def __init__(self, base_url="https://healthqr-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_password = "admin123"  # From backend/.env
        self.test_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

    def test_get_sponsors(self):
        """Test GET /api/sponsors - Retrieve all sponsor logos"""
        print("🔍 Testing GET /api/sponsors...")
        response = requests.get(f"{self.api_url}/sponsors")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200, response.json()

    def test_upload_sponsor_logo(self, slot, logo_data=None):
        """Test POST /api/admin/sponsors/{slot} - Upload sponsor logo"""
        if logo_data is None:
            logo_data = self.test_logo
        
        print(f"📤 Testing POST /api/admin/sponsors/{slot}...")
        response = requests.post(
            f"{self.api_url}/admin/sponsors/{slot}",
            params={"password": self.admin_password},
            json={"logo": logo_data}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200, response.json()

    def test_delete_sponsor_logo(self, slot):
        """Test DELETE /api/admin/sponsors/{slot} - Remove sponsor logo"""
        print(f"🗑️ Testing DELETE /api/admin/sponsors/{slot}...")
        response = requests.delete(
            f"{self.api_url}/admin/sponsors/{slot}",
            params={"password": self.admin_password}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200, response.json()

    def test_error_cases(self):
        """Test error cases"""
        print("\n❌ Testing Error Cases...")
        
        # Test invalid slot
        print("Testing invalid slot (4)...")
        response = requests.post(
            f"{self.api_url}/admin/sponsors/4",
            params={"password": self.admin_password},
            json={"logo": self.test_logo}
        )
        print(f"Invalid slot - Status: {response.status_code} (expected 400)")
        
        # Test missing logo data
        print("Testing missing logo data...")
        response = requests.post(
            f"{self.api_url}/admin/sponsors/1",
            params={"password": self.admin_password},
            json={}
        )
        print(f"Missing logo - Status: {response.status_code} (expected 400)")
        
        # Test wrong password
        print("Testing wrong password...")
        response = requests.post(
            f"{self.api_url}/admin/sponsors/1",
            params={"password": "wrongpassword"},
            json={"logo": self.test_logo}
        )
        print(f"Wrong password - Status: {response.status_code} (expected 401)")

    def run_full_test_flow(self):
        """Run the complete test flow as specified in the review request"""
        print("🚀 Starting Sponsor Logo Management System Tests")
        print("=" * 60)
        
        # Step 1: GET /api/sponsors to verify initial state
        print("\n1️⃣ GET /api/sponsors - Initial State")
        success, initial_state = self.test_get_sponsors()
        
        # Step 2: Upload a base64 image to slot 1
        print("\n2️⃣ Upload logo to slot 1")
        success, upload_result = self.test_upload_sponsor_logo(1)
        
        # Step 3: GET /api/sponsors to verify the logo was saved
        print("\n3️⃣ GET /api/sponsors - Verify slot 1 upload")
        success, after_slot1 = self.test_get_sponsors()
        
        # Step 4: Upload to slot 2 and 3
        print("\n4️⃣ Upload logo to slot 2")
        self.test_upload_sponsor_logo(2)
        
        print("\n5️⃣ Upload logo to slot 3")
        self.test_upload_sponsor_logo(3)
        
        # Step 6: GET /api/sponsors to verify all three logos
        print("\n6️⃣ GET /api/sponsors - Verify all three slots")
        success, all_slots = self.test_get_sponsors()
        
        # Step 7: DELETE slot 2
        print("\n7️⃣ DELETE slot 2")
        self.test_delete_sponsor_logo(2)
        
        # Step 8: GET /api/sponsors to verify slot 2 is now null/removed
        print("\n8️⃣ GET /api/sponsors - Verify slot 2 removed")
        success, after_delete = self.test_get_sponsors()
        
        # Step 9: Test error cases
        print("\n9️⃣ Error Cases")
        self.test_error_cases()
        
        print("\n" + "=" * 60)
        print("✅ Sponsor Logo Management System Test Complete!")
        print("=" * 60)

if __name__ == "__main__":
    tester = SponsorLogoTester()
    tester.run_full_test_flow()