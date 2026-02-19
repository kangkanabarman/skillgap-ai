import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension === 'pdf' || fileExtension === 'docx') {
        setFile(selectedFile);
        toast.success(`Selected: ${selectedFile.name}`);
      } else {
        toast.error('Invalid file format. Please upload a PDF (.pdf) or Word document (.docx) file only.');
        e.target.value = null;
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/resume/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSkills(response.data.extracted_skills);
      setUploaded(true);
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen aurora-gradient">
      <nav className="p-6 md:p-12 flex justify-between items-center border-b border-border/50">
        <div
          className="text-2xl font-bold tracking-tight cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          SkillGap <span className="text-primary">AI</span>
        </div>
        <Button
          data-testid="back-dashboard-btn"
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="rounded-md"
        >
          Back to Dashboard
        </Button>
      </nav>

      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">Upload Your Resume</h1>
          <p className="text-muted-foreground mb-12">
            Upload your resume to analyze your skills and identify gaps
          </p>

          {!uploaded ? (
            <div className="glass-card rounded-xl p-12">
              <div
                className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('file-input').click()}
                data-testid="upload-dropzone"
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="file-input"
                />
                <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </h3>
                <p className="text-muted-foreground">
                  PDF or DOCX (Max 10MB)
                </p>
              </div>

              {file && (
                <div className="mt-6">
                  <Button
                    data-testid="upload-submit-btn"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full rounded-md btn-hover glow-primary"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Resume'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-8 text-center" data-testid="upload-success">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-semibold mb-2">Resume Uploaded Successfully!</h3>
                <p className="text-muted-foreground mb-6">
                  We've extracted {skills.length} skills from your resume
                </p>
              </div>

              <div className="glass-card rounded-xl p-8">
                <h3 className="text-xl font-semibold mb-4">Extracted Skills</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {skills.map((skill, idx) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm"
                      data-testid={`skill-tag-${idx}`}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  data-testid="analyze-skills-btn"
                  onClick={() => navigate('/skill-analysis')}
                  className="flex-1 rounded-md btn-hover glow-primary"
                >
                  Analyze Skill Gap
                </Button>
                <Button
                  data-testid="upload-another-btn"
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setUploaded(false);
                    setSkills([]);
                  }}
                  className="flex-1 rounded-md"
                >
                  Upload Another
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
