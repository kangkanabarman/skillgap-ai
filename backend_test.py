import requests
import sys
import json
import time
from datetime import datetime
import os

class SkillGapAPITester:
    def __init__(self, base_url="https://resumeanalyst.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_email = None
        self.tests_run = 0
        self.tests_passed = 0
        self.resume_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method, endpoint, data=None, files=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        if files:
            # Remove Content-Type for file uploads
            headers.pop('Content-Type', None)

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"   Status: {response.status_code}, Expected: {expected_status}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"   Error: {str(e)}")
            return False, {}

    def test_api_health(self):
        """Test API health endpoint"""
        success, response = self.make_request('GET', '/')
        return self.log_test("API Health Check", success, f"- {response.get('message', '')}")

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        self.user_email = f"test_user_{timestamp}@example.com"
        password = "TestPassword123!"
        
        success, response = self.make_request(
            'POST', '/auth/register',
            data={"email": self.user_email, "password": password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return self.log_test("User Registration", True, f"- Email: {self.user_email}")
        else:
            return self.log_test("User Registration", False, f"- No token received")

    def test_user_login(self):
        """Test user login with existing credentials"""
        # Try login with admin/admin as mentioned in requirements
        success, response = self.make_request(
            'POST', '/auth/login',
            data={"email": "admin@admin.com", "password": "admin"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_email = response['email']
            return self.log_test("User Login (admin)", True, f"- Email: {self.user_email}")
        else:
            # Try with registered user
            if self.user_email:
                success, response = self.make_request(
                    'POST', '/auth/login',
                    data={"email": self.user_email, "password": "TestPassword123!"}
                )
                if success and 'token' in response:
                    self.token = response['token']
                    return self.log_test("User Login (registered)", True)
            
            return self.log_test("User Login", False, "- Login failed")

    def test_profile_access(self):
        """Test profile endpoint"""
        if not self.token:
            return self.log_test("Profile Access", False, "- No token available")
        
        success, response = self.make_request('GET', '/profile')
        return self.log_test("Profile Access", success, f"- Email: {response.get('email', '')}")

    def test_resume_upload(self):
        """Test resume upload with a sample PDF"""
        if not self.token:
            return self.log_test("Resume Upload", False, "- No token available")
        
        # Create a simple test PDF content (mock)
        test_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Python JavaScript React) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
        
        files = {'file': ('test_resume.pdf', test_content, 'application/pdf')}
        
        success, response = self.make_request(
            'POST', '/resume/upload',
            files=files,
            expected_status=200
        )
        
        if success and 'resume_id' in response:
            self.resume_id = response['resume_id']
            skills = response.get('extracted_skills', [])
            return self.log_test("Resume Upload", True, f"- Skills found: {len(skills)}")
        else:
            return self.log_test("Resume Upload", False, "- Upload failed")

    def test_career_test_questions(self):
        """Test career test questions endpoint"""
        if not self.token:
            return self.log_test("Career Test Questions", False, "- No token available")
        
        success, response = self.make_request('GET', '/career-test/questions')
        
        if success and isinstance(response, list) and len(response) > 0:
            return self.log_test("Career Test Questions", True, f"- {len(response)} questions loaded")
        else:
            return self.log_test("Career Test Questions", False, "- No questions received")

    def test_skill_gap_analysis(self):
        """Test skill gap analysis"""
        if not self.token:
            return self.log_test("Skill Gap Analysis", False, "- No token available")
        
        # Test with mocked job data
        success, response = self.make_request(
            'POST', '/skill-analysis',
            data={"company": "Google", "role": "Software Engineer"}
        )
        
        if success and 'match_percentage' in response:
            match_pct = response['match_percentage']
            missing_skills = response.get('missing_skills', [])
            roadmap = response.get('learning_roadmap', '')
            
            details = f"- Match: {match_pct}%, Missing: {len(missing_skills)}, Roadmap: {'Yes' if roadmap else 'No'}"
            return self.log_test("Skill Gap Analysis", True, details)
        else:
            return self.log_test("Skill Gap Analysis", False, "- Analysis failed")

    def test_career_test_submission(self):
        """Test career test submission with AI analysis"""
        if not self.token:
            return self.log_test("Career Test Submission", False, "- No token available")
        
        # Create sample answers
        sample_answers = []
        for i in range(1, 21):  # 20 questions
            sample_answers.append({
                "question_id": i,
                "answer": "Building something from scratch" if i % 2 == 0 else "Analyzing data and patterns"
            })
        
        print("   Submitting career test (AI analysis may take 10-15 seconds)...")
        success, response = self.make_request(
            'POST', '/career-test/submit',
            data={"answers": sample_answers}
        )
        
        if success and 'career_path' in response:
            career_path = response['career_path']
            explanation = response.get('explanation', '')
            details = f"- Path: {career_path}, Explanation: {'Yes' if explanation else 'No'}"
            return self.log_test("Career Test Submission", True, details)
        else:
            return self.log_test("Career Test Submission", False, "- Submission failed")

    def test_get_skill_analyses(self):
        """Test retrieving skill analyses"""
        if not self.token:
            return self.log_test("Get Skill Analyses", False, "- No token available")
        
        success, response = self.make_request('GET', '/skill-analyses')
        
        if success and isinstance(response, list):
            return self.log_test("Get Skill Analyses", True, f"- {len(response)} analyses found")
        else:
            return self.log_test("Get Skill Analyses", False, "- Failed to get analyses")

    def test_get_career_results(self):
        """Test retrieving career test results"""
        if not self.token:
            return self.log_test("Get Career Results", False, "- No token available")
        
        success, response = self.make_request('GET', '/career-test/results')
        
        if success and isinstance(response, list):
            return self.log_test("Get Career Results", True, f"- {len(response)} results found")
        else:
            return self.log_test("Get Career Results", False, "- Failed to get results")

def main():
    print("🚀 Starting SkillGap AI Backend API Tests")
    print("=" * 50)
    
    tester = SkillGapAPITester()
    
    # Test sequence
    tests = [
        tester.test_api_health,
        tester.test_user_registration,
        tester.test_user_login,
        tester.test_profile_access,
        tester.test_resume_upload,
        tester.test_career_test_questions,
        tester.test_skill_gap_analysis,
        tester.test_career_test_submission,
        tester.test_get_skill_analyses,
        tester.test_get_career_results,
    ]
    
    for test in tests:
        test()
        time.sleep(0.5)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())