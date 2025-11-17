import requests
import sys
import json
from datetime import datetime

class CleanCheckAPITester:
    def __init__(self, base_url="https://healthshare-5.preview.emergentagent.com"):
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

    def test_create_profile(self, name="Test User", photo=""):
        """Test profile creation"""
        success, response = self.run_test(
            "Create Profile",
            "POST",
            "profiles",
            200,
            data={"name": name, "photo": photo}
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

    def test_update_profile(self, membership_id, name="Updated User", photo="updated_photo.jpg"):
        """Test profile update"""
        success, response = self.run_test(
            "Update Profile",
            "PUT",
            f"profiles/{membership_id}",
            200,
            data={"name": name, "photo": photo}
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

    def test_remove_reference(self, membership_id, ref_id):
        """Test removing reference"""
        success, response = self.run_test(
            "Remove Reference",
            "DELETE",
            f"profiles/{membership_id}/references/{ref_id}",
            200
        )
        return success

    def run_comprehensive_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Clean Check Backend API Tests")
        print("=" * 50)

        # Test 1: Root endpoint
        self.test_root_endpoint()

        # Test 2: Create first profile
        profile1_id = self.test_create_profile("Alice Johnson", "alice.jpg")
        if not profile1_id:
            print("❌ Cannot continue tests - profile creation failed")
            return False

        # Test 3: Create second profile for reference testing
        profile2_id = self.test_create_profile("Bob Smith", "bob.jpg")
        if not profile2_id:
            print("❌ Cannot continue reference tests - second profile creation failed")

        # Test 4: Get profile by ID
        self.test_get_profile(profile1_id)

        # Test 5: Get non-existent profile
        self.test_get_nonexistent_profile()

        # Test 6: Update profile
        self.test_update_profile(profile1_id, "Alice Johnson Updated", "alice_updated.jpg")

        # Test 7: Verify profile was updated
        success, updated_profile = self.test_get_profile(profile1_id)
        if success and updated_profile.get('name') == "Alice Johnson Updated":
            self.log_test("Profile Update Verification", True, "Profile name updated correctly")
        else:
            self.log_test("Profile Update Verification", False, "Profile name not updated correctly")

        if profile2_id:
            # Test 8: Add reference
            self.test_add_reference(profile1_id, profile2_id, "Bob Smith")

            # Test 9: Verify reference was added
            success, profile_with_ref = self.test_get_profile(profile1_id)
            if success and profile_with_ref.get('references') and len(profile_with_ref['references']) > 0:
                self.log_test("Reference Addition Verification", True, f"Reference added: {profile_with_ref['references'][0]['name']}")
            else:
                self.log_test("Reference Addition Verification", False, "Reference not found in profile")

            # Test 10: Try to add duplicate reference (should fail)
            self.test_add_duplicate_reference(profile1_id, profile2_id, "Bob Smith")

            # Test 11: Remove reference
            self.test_remove_reference(profile1_id, profile2_id)

            # Test 12: Verify reference was removed
            success, profile_after_removal = self.test_get_profile(profile1_id)
            if success and (not profile_after_removal.get('references') or len(profile_after_removal['references']) == 0):
                self.log_test("Reference Removal Verification", True, "Reference removed successfully")
            else:
                self.log_test("Reference Removal Verification", False, "Reference still exists after removal")

        # Test 13: Add reference to non-existent profile
        self.test_add_reference_to_nonexistent_profile()

        # Test 14: Try to add reference to non-existent referenced profile
        if profile1_id:
            success, response = self.run_test(
                "Add Reference to Non-existent Referenced Profile",
                "POST",
                f"profiles/{profile1_id}/references",
                404,
                data={"membershipId": "non-existent-ref-id", "name": "Non-existent User"}
            )

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