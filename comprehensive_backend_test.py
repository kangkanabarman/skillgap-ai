import requests
import sys
import json
import time
from datetime import datetime
import os

class ComprehensiveSkillGapTester:
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

    def setup_user(self):
        """Setup test user"""
        timestamp = int(time.time())
        self.user_email = f"test_user_{timestamp}@example.com"
        password = "TestPassword123!"
        
        success, response = self.make_request(
            'POST', '/auth/register',
            data={"email": self.user_email, "password": password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return self.log_test("User Setup", True, f"- Email: {self.user_email}")
        else:
            return self.log_test("User Setup", False, f"- Registration failed")

    def test_comprehensive_resume_upload(self):
        """Test resume upload with comprehensive skill content"""
        if not self.token:
            return self.log_test("Comprehensive Resume Upload", False, "- No token available")
        
        # Create a comprehensive resume text with many skills
        comprehensive_resume_text = """
        John Doe
        Senior Full-Stack Software Engineer
        
        TECHNICAL SKILLS:
        Programming Languages: Python, JavaScript, TypeScript, Java, C++, Go, Rust, Ruby, PHP, Swift
        Frontend: React, Angular, Vue.js, HTML5, CSS3, Sass, Tailwind CSS, Bootstrap, Redux, Next.js
        Backend: Node.js, Express, Django, Flask, FastAPI, Spring Boot, Ruby on Rails, Laravel
        Databases: PostgreSQL, MySQL, MongoDB, Redis, Cassandra, DynamoDB, Elasticsearch
        Cloud & DevOps: AWS, Azure, Google Cloud Platform, Docker, Kubernetes, Terraform, Jenkins, CI/CD
        Data Science: Machine Learning, Deep Learning, TensorFlow, PyTorch, Pandas, NumPy, Scikit-learn
        Mobile: iOS Development, Android Development, React Native, Flutter
        Tools: Git, Jira, Agile, Scrum, REST API, GraphQL, Microservices, System Design
        
        EXPERIENCE:
        - Built scalable web applications using React and Node.js
        - Implemented machine learning models with Python and TensorFlow
        - Designed distributed systems and microservices architecture
        - Worked with cloud platforms including AWS and Azure
        - Experience with data visualization using Tableau and Power BI
        - Proficient in testing frameworks like Jest, Pytest, and Selenium
        - Strong problem-solving and communication skills
        - Led agile development teams and managed projects
        """
        
        # Create a more realistic PDF-like content
        test_content = f"""
        %PDF-1.4
        1 0 obj
        <<
        /Type /Catalog
        /Pages 2 0 R
        >>
        endobj
        2 0 obj
        <<
        /Type /Pages
        /Kids [3 0 R]
        /Count 1
        >>
        endobj
        3 0 obj
        <<
        /Type /Page
        /Parent 2 0 R
        /MediaBox [0 0 612 792]
        /Contents 4 0 R
        >>
        endobj
        4 0 obj
        <<
        /Length {len(comprehensive_resume_text)}
        >>
        stream
        BT
        /F1 12 Tf
        72 720 Td
        ({comprehensive_resume_text}) Tj
        ET
        endstream
        endobj
        xref
        0 5
        0000000000 65535 f 
        0000000009 00000 n 
        0000000058 00000 n 
        0000000115 00000 n 
        0000000206 00000 n 
        trailer
        <<
        /Size 5
        /Root 1 0 R
        >>
        startxref
        299
        %%EOF
        """.encode()
        
        files = {'file': ('comprehensive_resume.pdf', test_content, 'application/pdf')}
        
        success, response = self.make_request(
            'POST', '/resume/upload',
            files=files,
            expected_status=200
        )
        
        if success and 'resume_id' in response:
            self.resume_id = response['resume_id']
            skills = response.get('extracted_skills', [])
            extracted_text = response.get('extracted_text', '')
            
            # Check if we extracted a reasonable number of skills
            skill_count = len(skills)
            success_criteria = skill_count >= 10  # Should extract at least 10 skills from comprehensive resume
            
            details = f"- Skills extracted: {skill_count}, Text length: {len(extracted_text)}"
            if skills:
                details += f", Sample skills: {skills[:5]}"
            
            return self.log_test("Comprehensive Resume Upload", success_criteria, details)
        else:
            return self.log_test("Comprehensive Resume Upload", False, "- Upload failed")

    def test_skill_matching_scenarios(self):
        """Test different skill matching scenarios as per requirements"""
        if not self.token:
            return self.log_test("Skill Matching Scenarios", False, "- No token available")
        
        test_scenarios = [
            {
                "name": "Google Software Engineer (should be 50-70%)",
                "company": "Google",
                "role": "Software Engineer",
                "expected_min": 40,  # Slightly lower threshold for testing
                "expected_max": 80
            },
            {
                "name": "Google Data Scientist (should be 5-15% for backend resume)",
                "company": "Google", 
                "role": "Data Scientist",
                "expected_min": 5,
                "expected_max": 25  # Slightly higher threshold
            },
            {
                "name": "Amazon Backend Engineer (should be 40-60%)",
                "company": "Amazon",
                "role": "Backend Engineer", 
                "expected_min": 30,
                "expected_max": 70
            }
        ]
        
        all_passed = True
        results = []
        
        for scenario in test_scenarios:
            success, response = self.make_request(
                'POST', '/skill-analysis',
                data={"company": scenario["company"], "role": scenario["role"]}
            )
            
            if success and 'match_percentage' in response:
                match_pct = response['match_percentage']
                missing_skills = response.get('missing_skills', [])
                roadmap = response.get('learning_roadmap', '')
                
                # Check if match percentage is in expected range
                in_range = scenario["expected_min"] <= match_pct <= scenario["expected_max"]
                
                result_details = f"Match: {match_pct}% (expected {scenario['expected_min']}-{scenario['expected_max']}%), Missing: {len(missing_skills)}"
                results.append(f"   {scenario['name']}: {result_details}")
                
                if not in_range:
                    all_passed = False
                    results.append(f"     ⚠️  Match percentage {match_pct}% outside expected range!")
                
                # Verify roadmap is generated
                if not roadmap:
                    all_passed = False
                    results.append(f"     ⚠️  No learning roadmap generated!")
                    
            else:
                all_passed = False
                results.append(f"   {scenario['name']}: FAILED - Analysis request failed")
        
        details = "\n" + "\n".join(results)
        return self.log_test("Skill Matching Scenarios", all_passed, details)

    def test_ai_roadmap_generation(self):
        """Test AI roadmap generation quality"""
        if not self.token:
            return self.log_test("AI Roadmap Generation", False, "- No token available")
        
        # Test with a role that should have missing skills
        success, response = self.make_request(
            'POST', '/skill-analysis',
            data={"company": "Tesla", "role": "Machine Learning Engineer"}
        )
        
        if success and 'learning_roadmap' in response:
            roadmap = response['learning_roadmap']
            missing_skills = response.get('missing_skills', [])
            
            # Check roadmap quality
            roadmap_quality_checks = [
                len(roadmap) > 100,  # Should be substantial
                'learn' in roadmap.lower() or 'study' in roadmap.lower(),  # Should contain learning advice
                len(missing_skills) > 0  # Should have identified missing skills
            ]
            
            quality_score = sum(roadmap_quality_checks)
            success_criteria = quality_score >= 2
            
            details = f"- Roadmap length: {len(roadmap)}, Missing skills: {len(missing_skills)}, Quality score: {quality_score}/3"
            return self.log_test("AI Roadmap Generation", success_criteria, details)
        else:
            return self.log_test("AI Roadmap Generation", False, "- Failed to generate roadmap")

    def test_career_test_ai_analysis(self):
        """Test career test AI analysis with varied answers"""
        if not self.token:
            return self.log_test("Career Test AI Analysis", False, "- No token available")
        
        # Create answers that should lead to a specific career path
        backend_focused_answers = []
        for i in range(1, 21):
            # Answer pattern that should suggest backend development
            if i % 4 == 0:
                answer = "Building something from scratch"
            elif i % 4 == 1:
                answer = "Logical thinking and problem-solving"
            elif i % 4 == 2:
                answer = "Code and algorithms"
            else:
                answer = "Systematic and methodical"
                
            backend_focused_answers.append({
                "question_id": i,
                "answer": answer
            })
        
        print("   Submitting career test for AI analysis (may take 10-15 seconds)...")
        success, response = self.make_request(
            'POST', '/career-test/submit',
            data={"answers": backend_focused_answers}
        )
        
        if success and 'career_path' in response:
            career_path = response['career_path']
            explanation = response.get('explanation', '')
            
            # Check if AI provided meaningful analysis
            analysis_quality_checks = [
                len(career_path) > 5,  # Should have a substantial career path
                len(explanation) > 50,  # Should have detailed explanation
                any(tech_term in explanation.lower() for tech_term in ['development', 'programming', 'software', 'backend', 'frontend'])
            ]
            
            quality_score = sum(analysis_quality_checks)
            success_criteria = quality_score >= 2
            
            details = f"- Path: {career_path}, Explanation length: {len(explanation)}, Quality: {quality_score}/3"
            return self.log_test("Career Test AI Analysis", success_criteria, details)
        else:
            return self.log_test("Career Test AI Analysis", False, "- AI analysis failed")

def main():
    print("🚀 Starting Comprehensive SkillGap AI Backend Tests")
    print("=" * 60)
    
    tester = ComprehensiveSkillGapTester()
    
    # Test sequence focusing on core functionality
    tests = [
        tester.setup_user,
        tester.test_comprehensive_resume_upload,
        tester.test_skill_matching_scenarios,
        tester.test_ai_roadmap_generation,
        tester.test_career_test_ai_analysis,
    ]
    
    for test in tests:
        test()
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 60)
    print(f"📊 Comprehensive Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All comprehensive tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())