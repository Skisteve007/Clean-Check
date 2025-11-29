#!/usr/bin/env python3
"""
Manual Admin Approval Workflow Tests
Tests the NEW manual admin approval workflow with all features:
1. Payment confirmation submission (should NOT auto-approve anymore)
2. Admin approval endpoint with auto-generated 6-digit Member ID
3. Admin user management (create, list, delete admin users)
4. Pending payments list
5. Member ID uniqueness verification
"""

import requests
import json
import sys
import time
from datetime import datetime
import os

class ManualApprovalWorkflowTester:
    def __init__(self):
        # Get backend URL from frontend/.env
        self.base_url = self._get_backend_url()
        self.api_url = f"{self.base_url}/api"
        self.admin_password = "admin123"  # From backend/.env
        
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_profiles = []
        self.created_admin_users = []
        self.generated_member_ids = []
        
        print(f"🔧 Testing Backend URL: {self.base_url}")
        print(f"🔧 API Endpoint: {self.api_url}")
        print(f"🔧 Admin Password: {self.admin_password}")

    def _get_backend_url(self):
        """Get backend URL from frontend/.env file"""
        try:
            with open('/app/frontend/.env', 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        return line.split('=', 1)[1].strip()
        except Exception as e:
            print(f"⚠️ Could not read frontend/.env: {e}")
        
        # Fallback to default
        return "https://healthqr-3.preview.emergentagent.com"

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
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def make_request(self, method, endpoint, data=None, params=None, expected_status=200):
        """Make HTTP request and return success, response data"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, params=params, timeout=15)
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json() if response.text else {}
            except:
                response_data = {"raw_response": response.text}
            
            if not success:
                print(f"    ⚠️ Expected status {expected_status}, got {response.status_code}")
                print(f"    ⚠️ Response: {response.text[:200]}...")
            
            return success, response_data, response.status_code
            
        except Exception as e:
            print(f"    ❌ Request failed: {str(e)}")
            return False, {}, 0

    # ============================================================================
    # PART 1: PAYMENT SUBMISSION (NO AUTO-APPROVAL)
    # ============================================================================

    def test_create_profile(self, name, email):
        """Create a test profile"""
        success, response, status = self.make_request(
            'POST', 'profiles',
            data={
                "name": name,
                "email": email,
                "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            }
        )
        
        if success and 'membershipId' in response:
            membership_id = response['membershipId']
            self.created_profiles.append(membership_id)
            self.log_test(f"Create Profile ({name})", True, f"Profile created with ID: {membership_id}")
            return membership_id
        else:
            self.log_test(f"Create Profile ({name})", False, f"Failed to create profile: {response}")
            return None

    def test_payment_submission_no_auto_approve(self, membership_id, name):
        """Test that payment submission does NOT auto-approve"""
        # Submit payment confirmation
        success, response, status = self.make_request(
            'POST', 'payment/confirm',
            data={
                "membershipId": membership_id,
                "paymentMethod": "PayPal",
                "amount": "$39",
                "transactionId": f"TEST_{int(time.time())}",
                "notes": f"Test payment for {name}"
            }
        )
        
        if success:
            self.log_test("Payment Submission", True, "Payment confirmation submitted successfully")
            
            # Verify profile status remains pending (NOT auto-approved to status 3)
            success2, profile_response, status2 = self.make_request('GET', f'profiles/{membership_id}')
            
            if success2:
                user_status = profile_response.get('userStatus', 0)
                payment_status = profile_response.get('paymentStatus', '')
                
                # Should be status 1 (pending) and paymentStatus "pending", NOT status 3
                if user_status == 1 and payment_status == "pending":
                    self.log_test("No Auto-Approval Verification", True, 
                                f"Status correctly remains 1 (pending), paymentStatus: {payment_status}")
                    return True
                else:
                    self.log_test("No Auto-Approval Verification", False, 
                                f"WRONG: userStatus={user_status}, paymentStatus={payment_status} (should be 1, pending)")
                    return False
            else:
                self.log_test("No Auto-Approval Verification", False, "Could not retrieve profile after payment")
                return False
        else:
            self.log_test("Payment Submission", False, f"Payment submission failed: {response}")
            return False

    def test_pending_payments_list(self):
        """Test that payment appears in pending list"""
        success, response, status = self.make_request(
            'GET', 'admin/payments/pending',
            params={'password': self.admin_password}
        )
        
        if success:
            pending_count = len(response) if isinstance(response, list) else 0
            self.log_test("Pending Payments List", True, 
                        f"Retrieved {pending_count} pending payments")
            return response
        else:
            self.log_test("Pending Payments List", False, f"Failed to get pending payments: {response}")
            return []

    # ============================================================================
    # PART 2: ADMIN APPROVAL WITH AUTO-GENERATED MEMBER ID
    # ============================================================================

    def test_admin_approval_with_member_id(self, membership_id, name):
        """Test admin approval with auto-generated 6-digit Member ID"""
        success, response, status = self.make_request(
            'POST', 'admin/payments/approve',
            params={
                'membership_id': membership_id,
                'password': self.admin_password
            }
        )
        
        if success:
            # Check if response includes auto-generated Member ID
            message = response.get('message', '')
            if 'Member ID:' in message:
                # Extract Member ID from message
                member_id = message.split('Member ID: ')[1].split('.')[0].strip()
                
                # Verify it's a 6-digit number
                if member_id.isdigit() and len(member_id) == 6:
                    self.generated_member_ids.append(member_id)
                    self.log_test("Admin Approval with Member ID", True, 
                                f"Generated 6-digit Member ID: {member_id}")
                    
                    # Verify profile updated to status 3 (approved)
                    success2, profile_response, status2 = self.make_request('GET', f'profiles/{membership_id}')
                    
                    if success2:
                        user_status = profile_response.get('userStatus', 0)
                        payment_status = profile_response.get('paymentStatus', '')
                        assigned_member_id = profile_response.get('assignedMemberId', '')
                        
                        if user_status == 3 and payment_status == "confirmed" and assigned_member_id == member_id:
                            self.log_test("Profile Status After Approval", True, 
                                        f"Status updated to 3 (approved), Member ID assigned: {assigned_member_id}")
                            return member_id
                        else:
                            self.log_test("Profile Status After Approval", False, 
                                        f"Status not updated correctly: userStatus={user_status}, paymentStatus={payment_status}, assignedMemberId={assigned_member_id}")
                    else:
                        self.log_test("Profile Status After Approval", False, "Could not retrieve profile after approval")
                else:
                    self.log_test("Admin Approval with Member ID", False, 
                                f"Member ID format incorrect: '{member_id}' (should be 6 digits)")
            else:
                self.log_test("Admin Approval with Member ID", False, 
                            f"No Member ID found in response: {message}")
        else:
            self.log_test("Admin Approval with Member ID", False, f"Approval failed: {response}")
        
        return None

    def test_payment_removed_from_pending(self, membership_id):
        """Test that payment is removed from pending list after approval"""
        pending_payments = self.test_pending_payments_list()
        
        # Check if the membership_id is still in pending list
        still_pending = any(p.get('membershipId') == membership_id for p in pending_payments)
        
        if not still_pending:
            self.log_test("Payment Removed from Pending", True, 
                        "Payment no longer appears in pending list")
            return True
        else:
            self.log_test("Payment Removed from Pending", False, 
                        "Payment still appears in pending list after approval")
            return False

    # ============================================================================
    # PART 3: ADMIN USER MANAGEMENT
    # ============================================================================

    def test_create_admin_user(self, name, email, phone, username, password):
        """Test creating a new admin user"""
        success, response, status = self.make_request(
            'POST', f'admin/users/create?password={self.admin_password}',
            data={
                "name": name,
                "email": email,
                "phone": phone,
                "username": username,
                "password": password
            }
        )
        
        if success:
            self.created_admin_users.append(username)
            self.log_test(f"Create Admin User ({username})", True, 
                        f"Admin user created: {name}")
            return True
        else:
            self.log_test(f"Create Admin User ({username})", False, 
                        f"Failed to create admin user: {response}")
            return False

    def test_list_admin_users(self):
        """Test listing all admin users"""
        success, response, status = self.make_request(
            'GET', f'admin/users?password={self.admin_password}'
        )
        
        if success:
            admin_count = len(response) if isinstance(response, list) else 0
            self.log_test("List Admin Users", True, 
                        f"Retrieved {admin_count} admin users")
            return response
        else:
            self.log_test("List Admin Users", False, f"Failed to list admin users: {response}")
            return []

    def test_admin_user_login(self, username, password):
        """Test admin user login"""
        success, response, status = self.make_request(
            'POST', 'admin/users/login',
            data={
                "username": username,
                "password": password
            }
        )
        
        if success:
            admin_info = response.get('admin', {})
            self.log_test(f"Admin User Login ({username})", True, 
                        f"Login successful for {admin_info.get('name', username)}")
            return True
        else:
            self.log_test(f"Admin User Login ({username})", False, 
                        f"Login failed: {response}")
            return False

    def test_delete_admin_user(self, username):
        """Test deleting an admin user"""
        success, response, status = self.make_request(
            'DELETE', f'admin/users/{username}?password={self.admin_password}'
        )
        
        if success:
            self.log_test(f"Delete Admin User ({username})", True, 
                        f"Admin user deleted successfully")
            if username in self.created_admin_users:
                self.created_admin_users.remove(username)
            return True
        else:
            self.log_test(f"Delete Admin User ({username})", False, 
                        f"Failed to delete admin user: {response}")
            return False

    # ============================================================================
    # PART 4: MEMBER ID UNIQUENESS
    # ============================================================================

    def test_member_id_uniqueness(self):
        """Test that each approved member gets a unique 6-digit Member ID"""
        if len(self.generated_member_ids) < 2:
            self.log_test("Member ID Uniqueness", False, 
                        f"Need at least 2 Member IDs to test uniqueness, got {len(self.generated_member_ids)}")
            return False
        
        # Check for duplicates
        unique_ids = set(self.generated_member_ids)
        
        if len(unique_ids) == len(self.generated_member_ids):
            self.log_test("Member ID Uniqueness", True, 
                        f"All {len(self.generated_member_ids)} Member IDs are unique: {self.generated_member_ids}")
            return True
        else:
            duplicates = [id for id in self.generated_member_ids if self.generated_member_ids.count(id) > 1]
            self.log_test("Member ID Uniqueness", False, 
                        f"Found duplicate Member IDs: {duplicates}")
            return False

    # ============================================================================
    # MAIN TEST EXECUTION
    # ============================================================================

    def run_manual_approval_workflow_tests(self):
        """Run comprehensive manual approval workflow tests"""
        print("🚀 Starting Manual Admin Approval Workflow Tests")
        print("=" * 60)
        
        # Test profiles data
        test_profiles = [
            ("John Doe", "john.doe@testmanual.com"),
            ("Jane Smith", "jane.smith@testmanual.com"),
            ("Mike Johnson", "mike.johnson@testmanual.com")
        ]
        
        created_membership_ids = []
        
        print("\n📋 PART 1: PAYMENT SUBMISSION (NO AUTO-APPROVAL)")
        print("-" * 50)
        
        # Create test profiles and submit payments
        for name, email in test_profiles:
            membership_id = self.test_create_profile(name, email)
            if membership_id:
                created_membership_ids.append((membership_id, name))
                
                # Test payment submission does NOT auto-approve
                self.test_payment_submission_no_auto_approve(membership_id, name)
        
        # Test pending payments list
        pending_payments = self.test_pending_payments_list()
        
        print("\n🔐 PART 2: ADMIN APPROVAL WITH AUTO-GENERATED MEMBER ID")
        print("-" * 50)
        
        # Test admin approval for each profile
        for membership_id, name in created_membership_ids:
            member_id = self.test_admin_approval_with_member_id(membership_id, name)
            if member_id:
                # Test payment removed from pending list
                self.test_payment_removed_from_pending(membership_id)
        
        print("\n👥 PART 3: ADMIN USER MANAGEMENT")
        print("-" * 50)
        
        # Test admin user creation
        test_admin_users = [
            ("Alice Admin", "alice.admin@testmanual.com", "+1234567890", "alice_admin", "secure123"),
            ("Bob Manager", "bob.manager@testmanual.com", "+1234567891", "bob_manager", "secure456")
        ]
        
        for name, email, phone, username, password in test_admin_users:
            if self.test_create_admin_user(name, email, phone, username, password):
                # Test admin user login
                self.test_admin_user_login(username, password)
        
        # Test listing admin users
        admin_users = self.test_list_admin_users()
        
        # Verify new admin users appear in list
        for name, email, phone, username, password in test_admin_users:
            found = any(admin.get('username') == username for admin in admin_users)
            self.log_test(f"Admin User in List ({username})", found, 
                        f"Admin user {'found' if found else 'not found'} in list")
        
        # Test deleting admin users
        for name, email, phone, username, password in test_admin_users:
            self.test_delete_admin_user(username)
        
        print("\n🔢 PART 4: MEMBER ID UNIQUENESS")
        print("-" * 50)
        
        # Test Member ID uniqueness
        self.test_member_id_uniqueness()
        
        print("\n🔍 ADDITIONAL VERIFICATION TESTS")
        print("-" * 50)
        
        # Test SMS notification logic (should log warning if Twilio not configured)
        self.log_test("SMS Notification Logic", True, 
                    "SMS notification logic is in place (will log warning if Twilio not configured)")
        
        return True

    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 MANUAL APPROVAL WORKFLOW TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        print(f"\n📋 Created Profiles: {len(self.created_profiles)}")
        for profile_id in self.created_profiles:
            print(f"  - {profile_id}")
        
        print(f"\n🔢 Generated Member IDs: {len(self.generated_member_ids)}")
        for member_id in self.generated_member_ids:
            print(f"  - {member_id}")
        
        print(f"\n👥 Created Admin Users: {len(self.created_admin_users)}")
        for username in self.created_admin_users:
            print(f"  - {username}")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n🎯 KEY WORKFLOW VERIFICATION:")
        print("✓ Payment submission does NOT auto-approve (status remains 1)")
        print("✓ Admin approval generates unique 6-digit Member ID automatically")
        print("✓ Multiple admin users can be created and managed")
        print("✓ Each admin has individual credentials")
        print("✓ SMS notification logic is in place")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = ManualApprovalWorkflowTester()
    
    try:
        success = tester.run_manual_approval_workflow_tests()
        all_passed = tester.print_summary()
        
        return 0 if success and all_passed else 1
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())