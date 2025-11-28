import requests
import sys
import json
import base64
from datetime import datetime

class CleanCheckAPITester:
    def __init__(self, base_url="https://safe-share-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_profiles = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = {
            "test": name,
            "status": status,
            "success": success,
            "details": details
        }
        self.test_results.append(result)
        print(f"{status} - {name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    details = f"Status: {response.status_code}, Response: {json.dumps(response_data, indent=2)[:200]}..."
                except:
                    details = f"Status: {response.status_code}, Response: {response.text[:200]}..."
            else:
                details = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}..."

            self.log_test(name, success, details)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_create_profile(self, name="Test User", email=None, password="testpass123", photo=""):
        """Test profile creation"""
        if email is None:
            # Generate unique email based on name
            email = f"{name.lower().replace(' ', '.')}@test.com"
        
        success, response = self.run_test(
            f"Create Profile ({name})",
            "POST",
            "profiles",
            200,
            data={
                "name": name, 
                "email": email,
                "password": password,
                "photo": photo
            }
        )
        if success and 'membershipId' in response:
            self.created_profiles.append(response['membershipId'])
            return response['membershipId']
        return None

    def test_get_profile(self, membership_id):
        """Test getting profile by ID"""
        success, response = self.run_test(
            "Get Profile by ID",
            "GET",
            f"profiles/{membership_id}",
            200
        )
        return success, response

    def test_get_nonexistent_profile(self):
        """Test getting non-existent profile"""
        fake_id = "non-existent-id-12345"
        success, response = self.run_test(
            "Get Non-existent Profile",
            "GET",
            f"profiles/{fake_id}",
            404
        )
        return success

    def test_update_profile(self, membership_id, name="Updated User", email="updated@test.com", password="newpass123", photo="updated_photo.jpg"):
        """Test profile update"""
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            f"profiles/{membership_id}",
            200,
            data={
                "name": name, 
                "email": email,
                "password": password,
                "photo": photo
            }
        )
        return success

    def test_add_reference(self, membership_id, ref_id, ref_name):
        """Test adding reference"""
        success, response = self.run_test(
            "Add Reference",
            "POST",
            f"profiles/{membership_id}/references",
            200,
            data={"membershipId": ref_id, "name": ref_name}
        )
        return success

    def test_add_duplicate_reference(self, membership_id, ref_id, ref_name):
        """Test adding duplicate reference (should fail)"""
        success, response = self.run_test(
            "Add Duplicate Reference",
            "POST",
            f"profiles/{membership_id}/references",
            400,
            data={"membershipId": ref_id, "name": ref_name}
        )
        return success

    def test_add_reference_to_nonexistent_profile(self):
        """Test adding reference to non-existent profile"""
        fake_id = "non-existent-id-12345"
        success, response = self.run_test(
            "Add Reference to Non-existent Profile",
            "POST",
            f"profiles/{fake_id}/references",
            404,
            data={"membershipId": "some-ref-id", "name": "Some Name"}
        )
        return success

    # ============================================================================
    # SPONSOR LOGO MANAGEMENT TESTS
    # ============================================================================

    def test_get_sponsor_logos_initial(self):
        """Test getting sponsor logos - initial state (should return empty slots)"""
        success, response = self.run_test(
            "Get Sponsor Logos (Initial State)",
            "GET",
            "sponsors",
            200
        )
        return success, response

    def test_upload_sponsor_logo(self, slot, password="admin123"):
        """Test uploading sponsor logo to a specific slot"""
        # Create a simple base64 test image (1x1 pixel PNG)
        test_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        success, response = self.run_test(
            f"Upload Sponsor Logo to Slot {slot}",
            "POST",
            f"admin/sponsors/{slot}?password={password}",
            200,
            data={"logo": test_logo}
        )
        return success, response

    def test_upload_sponsor_logo_invalid_slot(self, password="admin123"):
        """Test uploading sponsor logo to invalid slot (should fail)"""
        test_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        success, response = self.run_test(
            "Upload Sponsor Logo to Invalid Slot (4)",
            "POST",
            f"admin/sponsors/4?password={password}",
            400,
            data={"logo": test_logo}
        )
        return success

    def test_upload_sponsor_logo_no_data(self, slot=1, password="admin123"):
        """Test uploading sponsor logo without logo data (should fail)"""
        success, response = self.run_test(
            "Upload Sponsor Logo Without Data",
            "POST",
            f"admin/sponsors/{slot}?password={password}",
            400,
            data={}
        )
        return success

    def test_upload_sponsor_logo_wrong_password(self, slot=1):
        """Test uploading sponsor logo with wrong password (should fail)"""
        test_logo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        
        success, response = self.run_test(
            "Upload Sponsor Logo with Wrong Password",
            "POST",
            f"admin/sponsors/{slot}?password=wrongpassword",
            401,
            data={"logo": test_logo}
        )
        return success

    def test_delete_sponsor_logo(self, slot, password="admin123"):
        """Test deleting sponsor logo from a specific slot"""
        success, response = self.run_test(
            f"Delete Sponsor Logo from Slot {slot}",
            "DELETE",
            f"admin/sponsors/{slot}?password={password}",
            200
        )
        return success, response

    def test_delete_sponsor_logo_wrong_password(self, slot=1):
        """Test deleting sponsor logo with wrong password (should fail)"""
        success, response = self.run_test(
            "Delete Sponsor Logo with Wrong Password",
            "DELETE",
            f"admin/sponsors/{slot}?password=wrongpassword",
            401
        )
        return success

    def test_remove_reference(self, membership_id, ref_id):
        """Test removing reference"""
        success, response = self.run_test(
            "Remove Reference",
            "DELETE",
            f"profiles/{membership_id}/references/{ref_id}",
            200
        )
        return success

    def test_search_members(self, search_query="", expected_status=200):
        """Test searching for active members"""
        endpoint = f"members/search?search={search_query}&limit=10"
        success, response = self.run_test(
            f"Search Members (query: '{search_query}')",
            "GET",
            endpoint,
            expected_status
        )
        return success, response

    def test_profile_status(self, membership_id):
        """Test getting profile status"""
        success, response = self.run_test(
            "Get Profile Status",
            "GET",
            f"profile/status/{membership_id}",
            200
        )
        return success, response

    def test_payment_confirmation(self, membership_id, payment_method="PayPal", amount="$39"):
        """Test payment confirmation submission"""
        success, response = self.run_test(
            "Submit Payment Confirmation",
            "POST",
            "payment/confirm",
            200,
            data={
                "membershipId": membership_id,
                "paymentMethod": payment_method,
                "amount": amount,
                "transactionId": "TEST123456",
                "notes": "Test payment confirmation"
            }
        )
        return success, response

    def test_admin_login(self, password="admin123"):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"password": password}
        )
        return success, response

    def test_admin_pending_payments(self, password="admin123"):
        """Test getting pending payments (admin)"""
        success, response = self.run_test(
            "Get Pending Payments (Admin)",
            "GET",
            f"admin/payments/pending?password={password}",
            200
        )
        return success, response

    def test_admin_approve_payment(self, membership_id, password="admin123"):
        """Test admin payment approval"""
        success, response = self.run_test(
            "Approve Payment (Admin)",
            "POST",
            f"admin/payments/approve/{membership_id}?password={password}",
            200
        )
        return success, response

    def test_document_upload(self, membership_id, document_type="health_certificate"):
        """Test document upload"""
        # Create a simple base64 encoded test document
        test_document = base64.b64encode(b"Test health document content").decode('utf-8')
        
        success, response = self.run_test(
            "Upload Document",
            "POST",
            "document/upload",
            200,
            data={
                "membershipId": membership_id,
                "documentData": test_document,
                "documentType": document_type
            }
        )
        return success, response

    def test_document_upload_without_payment(self, membership_id):
        """Test document upload without confirmed payment (should fail)"""
        test_document = base64.b64encode(b"Test health document content").decode('utf-8')
        
        success, response = self.run_test(
            "Upload Document Without Payment (Should Fail)",
            "POST",
            "document/upload",
            403,
            data={
                "membershipId": membership_id,
                "documentData": test_document,
                "documentType": "health_certificate"
            }
        )
        return success

    def run_comprehensive_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Clean Check Backend API Tests")
        print("=" * 50)

        # Test 1: Root endpoint
        self.test_root_endpoint()

        # Test 2: Create first profile
        profile1_id = self.test_create_profile("Alice Johnson", "alice.johnson@test.com", "testpass123", "alice.jpg")
        if not profile1_id:
            print("❌ Cannot continue tests - profile creation failed")
            return False

        # Test 3: Create second profile for reference testing
        profile2_id = self.test_create_profile("Bob Smith", "bob.smith@test.com", "testpass123", "bob.jpg")
        if not profile2_id:
            print("❌ Cannot continue reference tests - second profile creation failed")

        # Test 4: Get profile by ID
        self.test_get_profile(profile1_id)

        # Test 5: Get non-existent profile
        self.test_get_nonexistent_profile()

        # Test 6: Update profile
        self.test_update_profile(profile1_id, "Alice Johnson Updated", "alice.updated@test.com", "newpass123", "alice_updated.jpg")

        # Test 7: Verify profile was updated
        success, updated_profile = self.test_get_profile(profile1_id)
        if success and updated_profile.get('name') == "Alice Johnson Updated":
            self.log_test("Profile Update Verification", True, "Profile name updated correctly")
        else:
            self.log_test("Profile Update Verification", False, "Profile name not updated correctly")

        # === PAYMENT CONFIRMATION ACCESS CONTROL TESTS (HIGHEST PRIORITY) ===
        print("\n🔒 Testing Payment Confirmation Access Control...")
        
        # Test 8: Check initial profile status (should be pending)
        success, status = self.test_profile_status(profile1_id)
        if success and status.get('paymentStatus') == 'pending':
            self.log_test("Initial Payment Status Check", True, "Payment status is pending as expected")
        else:
            self.log_test("Initial Payment Status Check", False, f"Expected pending, got {status.get('paymentStatus') if success else 'error'}")

        # Test 9: Try to upload document without payment (should fail)
        self.test_document_upload_without_payment(profile1_id)

        # Test 10: Submit payment confirmation
        success, payment_response = self.test_payment_confirmation(profile1_id)
        
        # Test 11: Check status after payment submission (should be pending_approval)
        success, status_after_payment = self.test_profile_status(profile1_id)
        if success and status_after_payment.get('paymentStatus') == 'pending_approval':
            self.log_test("Payment Status After Submission", True, "Status changed to pending_approval")
        else:
            self.log_test("Payment Status After Submission", False, f"Expected pending_approval, got {status_after_payment.get('paymentStatus') if success else 'error'}")

        # Test 12: Admin login
        admin_success, admin_response = self.test_admin_login()
        
        # Test 13: Get pending payments (admin)
        if admin_success:
            self.test_admin_pending_payments()

        # Test 14: Admin approve payment
        if admin_success:
            approve_success, approve_response = self.test_admin_approve_payment(profile1_id)
            
            # Test 15: Check status after admin approval (should be confirmed)
            success, status_after_approval = self.test_profile_status(profile1_id)
            if success and status_after_approval.get('paymentStatus') == 'confirmed':
                self.log_test("Payment Status After Admin Approval", True, "Status changed to confirmed")
            else:
                self.log_test("Payment Status After Admin Approval", False, f"Expected confirmed, got {status_after_approval.get('paymentStatus') if success else 'error'}")

            # Test 16: Upload document after payment confirmation (should succeed)
            if success and status_after_approval.get('paymentStatus') == 'confirmed':
                doc_success, doc_response = self.test_document_upload(profile1_id)
                
                # Test 17: Check QR code enabled after document upload
                success, final_status = self.test_profile_status(profile1_id)
                if success and final_status.get('qrCodeEnabled'):
                    self.log_test("QR Code Enabled After Document Upload", True, "QR code enabled successfully")
                else:
                    self.log_test("QR Code Enabled After Document Upload", False, "QR code not enabled after document upload")

        # === SEARCHABLE MEMBER REFERENCE SYSTEM TESTS ===
        print("\n🔍 Testing Searchable Member Reference System...")
        
        # Create a third profile with confirmed payment for search testing
        profile3_id = self.test_create_profile("Charlie Wilson", "charlie.wilson@test.com", "testpass123", "charlie.jpg")
        if profile3_id:
            # Simulate payment confirmation for profile3 to make it searchable
            self.test_payment_confirmation(profile3_id)
            if admin_success:
                self.test_admin_approve_payment(profile3_id)

        # Test 18: Search members with empty query
        success, empty_search = self.test_search_members("")
        
        # Test 19: Search members with specific name
        success, name_search = self.test_search_members("Alice")
        
        # Test 20: Search members with membership ID
        if profile2_id:
            success, id_search = self.test_search_members(profile2_id[:8])  # Search with partial ID

        # === REFERENCE SYSTEM TESTS ===
        if profile2_id:
            # First, make profile2 searchable by confirming payment
            self.test_payment_confirmation(profile2_id)
            if admin_success:
                self.test_admin_approve_payment(profile2_id)

            # Test 21: Add reference
            self.test_add_reference(profile1_id, profile2_id, "Bob Smith")

            # Test 22: Verify reference was added
            success, profile_with_ref = self.test_get_profile(profile1_id)
            if success and profile_with_ref.get('references') and len(profile_with_ref['references']) > 0:
                self.log_test("Reference Addition Verification", True, f"Reference added: {profile_with_ref['references'][0]['name']}")
            else:
                self.log_test("Reference Addition Verification", False, "Reference not found in profile")

            # Test 23: Try to add duplicate reference (should fail)
            self.test_add_duplicate_reference(profile1_id, profile2_id, "Bob Smith")

            # Test 24: Remove reference
            self.test_remove_reference(profile1_id, profile2_id)

            # Test 25: Verify reference was removed
            success, profile_after_removal = self.test_get_profile(profile1_id)
            if success and (not profile_after_removal.get('references') or len(profile_after_removal['references']) == 0):
                self.log_test("Reference Removal Verification", True, "Reference removed successfully")
            else:
                self.log_test("Reference Removal Verification", False, "Reference still exists after removal")

        # Test 26: Add reference to non-existent profile
        self.test_add_reference_to_nonexistent_profile()

        # Test 27: Try to add reference to non-existent referenced profile
        if profile1_id:
            success, response = self.run_test(
                "Add Reference to Non-existent Referenced Profile",
                "POST",
                f"profiles/{profile1_id}/references",
                404,
                data={"membershipId": "non-existent-ref-id", "name": "Non-existent User"}
            )

        # === SPONSOR LOGO MANAGEMENT TESTS ===
        print("\n🖼️ Testing Sponsor Logo Management System...")
        
        # Test 28: Get initial sponsor logos state
        success, initial_logos = self.test_get_sponsor_logos_initial()
        if success:
            expected_structure = {1: None, 2: None, 3: None}
            if initial_logos == expected_structure:
                self.log_test("Initial Sponsor Logos Structure", True, "All slots initialized to None")
            else:
                self.log_test("Initial Sponsor Logos Structure", False, f"Expected {expected_structure}, got {initial_logos}")

        # Test 29: Upload sponsor logo to slot 1
        success, upload_response = self.test_upload_sponsor_logo(1)
        
        # Test 30: Verify logo was uploaded to slot 1
        success, logos_after_upload = self.test_get_sponsor_logos_initial()
        if success and logos_after_upload.get(1) is not None:
            self.log_test("Sponsor Logo Upload Verification (Slot 1)", True, "Logo successfully uploaded to slot 1")
        else:
            self.log_test("Sponsor Logo Upload Verification (Slot 1)", False, "Logo not found in slot 1 after upload")

        # Test 31: Upload sponsor logo to slot 2
        self.test_upload_sponsor_logo(2)
        
        # Test 32: Upload sponsor logo to slot 3
        self.test_upload_sponsor_logo(3)
        
        # Test 33: Verify all three logos are present
        success, all_logos = self.test_get_sponsor_logos_initial()
        if success:
            filled_slots = sum(1 for slot in [1, 2, 3] if all_logos.get(slot) is not None)
            if filled_slots == 3:
                self.log_test("All Sponsor Slots Filled", True, "All 3 sponsor slots have logos")
            else:
                self.log_test("All Sponsor Slots Filled", False, f"Only {filled_slots}/3 slots filled")

        # Test 34: Delete sponsor logo from slot 2
        success, delete_response = self.test_delete_sponsor_logo(2)
        
        # Test 35: Verify slot 2 is now empty
        success, logos_after_delete = self.test_get_sponsor_logos_initial()
        if success and logos_after_delete.get(2) is None:
            self.log_test("Sponsor Logo Deletion Verification", True, "Slot 2 successfully cleared")
        else:
            self.log_test("Sponsor Logo Deletion Verification", False, "Slot 2 still contains logo after deletion")

        # Test 36: Test error cases - Invalid slot number
        self.test_upload_sponsor_logo_invalid_slot()
        
        # Test 37: Test error cases - No logo data
        self.test_upload_sponsor_logo_no_data()
        
        # Test 38: Test error cases - Wrong password for upload
        self.test_upload_sponsor_logo_wrong_password()
        
        # Test 39: Test error cases - Wrong password for delete
        self.test_delete_sponsor_logo_wrong_password()

        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        print(f"\n🗂️ Created Profiles: {len(self.created_profiles)}")
        for profile_id in self.created_profiles:
            print(f"  - {profile_id}")

        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = CleanCheckAPITester()
    
    try:
        success = tester.run_comprehensive_tests()
        tester.print_summary()
        
        return 0 if success and tester.tests_passed == tester.tests_run else 1
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())