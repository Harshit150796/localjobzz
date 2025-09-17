import { Scale, Users, Shield, AlertTriangle, FileText, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Terms of Service
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            The legal terms and conditions governing your use of LocalJobzz platform.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: January 1, 2025 • Effective Date: January 1, 2025
          </p>
        </div>
      </section>

      {/* Terms Overview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Scale className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Fair Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our terms ensure fair and respectful use of the platform for all users.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>User Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Clear guidelines on your rights and responsibilities as a LocalJobzz user.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Platform Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Terms designed to maintain a safe and professional environment for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Terms */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto space-y-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By accessing or using LocalJobzz ("the Platform"), you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of these terms, you may not access the Platform.
              </p>
              <p className="text-muted-foreground">
                These terms apply to all users of the Platform, including job seekers, employers, and visitors. LocalJobzz is operated by LocalJobzz Inc., a company incorporated in India and the United States.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                2. User Accounts & Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Creation</h4>
                <p className="text-muted-foreground mb-4">
                  You must create an account to access certain features. You agree to provide accurate, current, and complete information and to update it as necessary to maintain accuracy.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Eligibility Requirements</h4>
                <p className="text-muted-foreground mb-4">
                  You must be at least 18 years old and legally capable of entering into binding contracts. You represent that all information you provide is truthful and accurate.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Account Security</h4>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                3. Platform Usage & Conduct
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Acceptable Use</h4>
                <p className="text-muted-foreground mb-4">
                  You may use the Platform only for lawful purposes and in accordance with these Terms. You agree not to use the Platform for any fraudulent, harmful, or illegal activities.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Prohibited Activities</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                  <li>Posting false, misleading, or discriminatory job listings or profiles</li>
                  <li>Harassing, threatening, or discriminating against other users</li>
                  <li>Attempting to gain unauthorized access to the Platform or other users' accounts</li>
                  <li>Using automated tools or bots to access or scrape the Platform</li>
                  <li>Posting spam, irrelevant content, or excessive promotional material</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Content Guidelines</h4>
                <p className="text-muted-foreground">
                  All content posted on the Platform must be professional, respectful, and relevant to employment. We reserve the right to remove content that violates these guidelines.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-primary" />
                4. Services & Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Services</h4>
                <p className="text-muted-foreground mb-4">
                  LocalJobzz provides a platform for connecting job seekers with employers. We offer job matching, application tracking, communication tools, and related employment services.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Service Availability</h4>
                <p className="text-muted-foreground mb-4">
                  We strive to maintain continuous service availability but do not guarantee uninterrupted access. We may temporarily suspend services for maintenance or improvements.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Third-Party Services</h4>
                <p className="text-muted-foreground">
                  Our Platform may integrate with third-party services. We are not responsible for the availability, accuracy, or functionality of third-party services.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                5. Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Free Services</h4>
                <p className="text-muted-foreground mb-4">
                  Basic services for job seekers are provided free of charge. Premium features may require paid subscriptions as outlined in our pricing page.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Employer Services</h4>
                <p className="text-muted-foreground mb-4">
                  Employers pay for job postings and premium features according to published pricing. All payments are processed securely through our payment partners.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Refunds & Cancellations</h4>
                <p className="text-muted-foreground">
                  Subscriptions can be canceled at any time. Refunds are provided according to our refund policy, typically within 30 days of payment for unused services.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-primary" />
                6. Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Disclaimers</h4>
                <p className="text-muted-foreground mb-4">
                  LocalJobzz is an intermediary platform. We do not guarantee job placements, employment outcomes, or the accuracy of information provided by users.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">User Verification</h4>
                <p className="text-muted-foreground mb-4">
                  While we implement verification measures, we cannot guarantee the accuracy of all user-provided information. Users should conduct their own due diligence.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p className="text-muted-foreground">
                  LocalJobzz's liability is limited to the amount paid for services in the preceding 12 months. We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-primary" />
                7. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Content</h4>
                <p className="text-muted-foreground mb-4">
                  All Platform content, including design, text, graphics, and software, is owned by LocalJobzz and protected by intellectual property laws.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">User Content</h4>
                <p className="text-muted-foreground mb-4">
                  You retain ownership of content you post but grant LocalJobzz a license to use, display, and distribute it for Platform operations and improvement.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Copyright Compliance</h4>
                <p className="text-muted-foreground">
                  We respect intellectual property rights. If you believe your content has been used without permission, contact us at connect@localjobzz.com.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>8. Contact & Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <p className="text-muted-foreground mb-4">
                  For questions about these Terms, contact us at connect@localjobzz.com with "Terms of Service" in the subject line.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Governing Law</h4>
                <p className="text-muted-foreground mb-4">
                  These Terms are governed by the laws of India and the United States, depending on your location and the nature of the dispute.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Changes to Terms</h4>
                <p className="text-muted-foreground">
                  We may update these Terms periodically. Significant changes will be communicated via email and Platform notifications. Continued use constitutes acceptance of updated Terms.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;