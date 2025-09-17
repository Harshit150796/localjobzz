import { Shield, AlertTriangle, Eye, CheckCircle, Phone, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SafetyTips = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Stay Safe While Job Hunting
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Your safety is our priority. Learn how to protect yourself during your job search.
          </p>
        </div>
      </section>

      {/* General Safety */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              General Safety Guidelines
            </h2>
            <p className="text-lg text-muted-foreground">
              Essential tips every job seeker should know
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <CardTitle>Verify Employers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Always research companies before applying. Check their website, reviews, and social media presence.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Look for verified company badges on LocalJobzz
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Check company registration and business licenses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Read reviews from current and former employees
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 text-primary" />
                  <CardTitle>Protect Personal Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Never share sensitive personal information until you've verified the employer.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Don't share bank details or SSN in initial applications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Use a professional email for job searching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Be cautious with addresses and phone numbers
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Red Flags */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Red Flags to Watch Out For
            </h2>
            <p className="text-lg text-muted-foreground">
              Warning signs that indicate potential scams or unsafe situations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <Badge variant="destructive">High Risk</Badge>
                </div>
                <CardTitle className="text-lg">Money Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Asking for upfront payments</li>
                  <li>• "Training fees" or "equipment costs"</li>
                  <li>• Requesting bank account access</li>
                  <li>• Payment for background checks</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <Badge variant="destructive">High Risk</Badge>
                </div>
                <CardTitle className="text-lg">Too Good to Be True</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Unrealistic high salaries</li>
                  <li>• No experience required for high-paying roles</li>
                  <li>• Immediate hiring without interview</li>
                  <li>• Work from home with minimal effort</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <Badge variant="destructive">High Risk</Badge>
                </div>
                <CardTitle className="text-lg">Poor Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Generic email addresses (gmail, yahoo)</li>
                  <li>• Poor grammar and spelling</li>
                  <li>• Urgent pressure to respond quickly</li>
                  <li>• Vague job descriptions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interview Safety */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Interview Safety Tips
            </h2>
            <p className="text-lg text-muted-foreground">
              Stay safe during in-person and virtual interviews
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  In-Person Interviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Meet in professional, public locations (office buildings)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Inform someone about your interview location and time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Research the company's physical address beforehand</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Trust your instincts if something feels wrong</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-primary" />
                  Virtual Interviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Use reputable platforms (Zoom, Teams, Google Meet)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Don't download unknown software for interviews</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Keep your background professional and private</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>Record the session if legally allowed in your area</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Report Suspicious Activity */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Report Suspicious Activity
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Help us keep LocalJobzz safe for everyone. If you encounter suspicious behavior, report it immediately.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">What to Report</h3>
              <ul className="text-left space-y-2 text-sm">
                <li>• Fake job postings</li>
                <li>• Requests for money or personal information</li>
                <li>• Inappropriate behavior during interviews</li>
                <li>• Suspected scam activities</li>
                <li>• Identity theft attempts</li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-4">How to Report</h3>
              <ul className="text-left space-y-2 text-sm">
                <li>• Use the "Report" button on job listings</li>
                <li>• Email us at connect@localjobzz.com</li>
                <li>• Contact our support team via chat</li>
                <li>• Include screenshots and details</li>
                <li>• We investigate all reports within 24 hours</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SafetyTips;