import { Shield, Lock, Eye, FileText, Users, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Your privacy is our priority. Learn how we protect and use your information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: January 1, 2025
          </p>
        </div>
      </section>

      {/* Privacy Overview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Data Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We use industry-leading security measures to protect your personal information from unauthorized access.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Secure Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All data is encrypted at rest and in transit using advanced encryption standards (AES-256).
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We're transparent about what data we collect, how we use it, and who we share it with.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Privacy Policy */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto space-y-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <p className="text-muted-foreground mb-4">
                  When you create an account, we collect information such as your name, email address, phone number, location, and professional information including your resume, work experience, and skills.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Usage Information</h4>
                <p className="text-muted-foreground mb-4">
                  We automatically collect information about how you use our platform, including pages visited, features used, search queries, and interaction patterns to improve our services.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Device Information</h4>
                <p className="text-muted-foreground">
                  We collect device information such as IP address, browser type, operating system, and device identifiers to ensure platform security and optimal performance.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Provision</h4>
                <p className="text-muted-foreground mb-4">
                  We use your information to provide our job matching services, facilitate communication between job seekers and employers, and process applications.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Personalization</h4>
                <p className="text-muted-foreground mb-4">
                  Your data helps us personalize job recommendations, improve our AI matching algorithms, and customize your platform experience.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Communication</h4>
                <p className="text-muted-foreground mb-4">
                  We use your contact information to send important updates, job alerts, and promotional communications (which you can opt out of at any time).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Safety & Security</h4>
                <p className="text-muted-foreground">
                  We use your information to verify identities, prevent fraud, ensure platform safety, and comply with legal requirements.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-primary" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">With Employers</h4>
                <p className="text-muted-foreground mb-4">
                  When you apply for jobs, we share your profile information and application materials with relevant employers. You control what information is visible in your profile.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Service Providers</h4>
                <p className="text-muted-foreground mb-4">
                  We work with trusted third-party service providers for hosting, analytics, customer support, and payment processing. These providers are bound by strict confidentiality agreements.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Legal Requirements</h4>
                <p className="text-muted-foreground mb-4">
                  We may disclose your information when required by law, to protect our rights, or to ensure user safety and platform integrity.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Business Transfers</h4>
                <p className="text-muted-foreground">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, with continued protection under this privacy policy.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-primary" />
                Data Security & Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Security Measures</h4>
                <p className="text-muted-foreground mb-4">
                  We implement comprehensive security measures including encryption, secure servers, regular security audits, and access controls to protect your data.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Data Retention</h4>
                <p className="text-muted-foreground mb-4">
                  We retain your personal information for as long as your account is active or as needed to provide services. You can request account deletion at any time.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">International Transfers</h4>
                <p className="text-muted-foreground">
                  As we operate in India and the USA, your data may be transferred between these regions. We ensure appropriate safeguards are in place for all international transfers.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                Your Rights & Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Access & Control</h4>
                <p className="text-muted-foreground mb-4">
                  You can access, update, or delete your personal information through your account settings. You also have the right to download your data.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Communication Preferences</h4>
                <p className="text-muted-foreground mb-4">
                  You can opt out of promotional emails and adjust notification settings in your account preferences. Essential service communications cannot be disabled.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Cookie Management</h4>
                <p className="text-muted-foreground mb-4">
                  You can control cookie preferences through your browser settings. Note that disabling certain cookies may limit platform functionality.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Account Deletion</h4>
                <p className="text-muted-foreground">
                  You can request account deletion by contacting us at connect@localjobzz.com. We'll delete your data within 30 days, subject to legal retention requirements.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> connect@localjobzz.com</p>
                <p><strong>Subject Line:</strong> Privacy Policy Inquiry</p>
                <p><strong>Response Time:</strong> Within 48 hours</p>
              </div>
              <p className="text-muted-foreground mt-4">
                We reserve the right to update this Privacy Policy. Users will be notified of significant changes via email and platform notifications.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;