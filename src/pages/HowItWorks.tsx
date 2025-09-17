import { CheckCircle, Search, Users, Briefcase, Star, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            How LocalJobzz Works
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Connecting local talent with opportunities in just 3 simple steps
          </p>
        </div>
      </section>

      {/* For Job Seekers */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              For Job Seekers
            </h2>
            <p className="text-lg text-muted-foreground">
              Find your perfect local job in minutes, not months
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Create Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Set up your professional profile with skills, experience, and location preferences. Our AI learns what you're looking for.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>2. Get Matched</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our intelligent matching system connects you with local opportunities that fit your skills and career goals.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>3. Start Working</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Apply directly through our platform, get instant feedback, and land your dream local job faster than ever.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              For Employers
            </h2>
            <p className="text-lg text-muted-foreground">
              Hire the best local talent with zero hassle
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Post Your Job</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create detailed job listings with our easy-to-use posting system. Set your requirements and let AI do the rest.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>2. Review Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get pre-screened, qualified candidates delivered to your inbox. Our matching algorithm saves you time.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>3. Hire with Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All candidates are verified and background-checked. Hire local talent you can trust to grow your business.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose LocalJobzz?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Badge variant="secondary" className="text-lg p-3 mb-4">AI-Powered</Badge>
              <h3 className="font-semibold mb-2">Smart Matching</h3>
              <p className="text-sm text-muted-foreground">Advanced algorithms ensure perfect job-candidate fits</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg p-3 mb-4">Local Focus</Badge>
              <h3 className="font-semibold mb-2">Community First</h3>
              <p className="text-sm text-muted-foreground">Supporting local economies across India & USA</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg p-3 mb-4">Verified</Badge>
              <h3 className="font-semibold mb-2">Trusted Platform</h3>
              <p className="text-sm text-muted-foreground">All users and opportunities are thoroughly verified</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-lg p-3 mb-4">Fast</Badge>
              <h3 className="font-semibold mb-2">Quick Results</h3>
              <p className="text-sm text-muted-foreground">Get matched and hired in record time</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;