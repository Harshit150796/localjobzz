import { Search, HelpCircle, MessageCircle, Book, Users, Briefcase } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Help Center
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Find answers to your questions and get the help you need
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search for help articles..." 
              className="pl-12 pr-4 py-6 text-lg"
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Help Topics
            </h2>
            <p className="text-lg text-muted-foreground">
              Quick access to the most requested information
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="hover:text-primary cursor-pointer">How to create an account</li>
                  <li className="hover:text-primary cursor-pointer">Setting up your profile</li>
                  <li className="hover:text-primary cursor-pointer">Understanding our platform</li>
                  <li className="hover:text-primary cursor-pointer">First steps for job seekers</li>
                  <li className="hover:text-primary cursor-pointer">Getting started as an employer</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Job Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="hover:text-primary cursor-pointer">How to apply for jobs</li>
                  <li className="hover:text-primary cursor-pointer">Tracking application status</li>
                  <li className="hover:text-primary cursor-pointer">Writing effective applications</li>
                  <li className="hover:text-primary cursor-pointer">Interview preparation tips</li>
                  <li className="hover:text-primary cursor-pointer">Following up after interviews</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Account & Billing</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="hover:text-primary cursor-pointer">Managing your account</li>
                  <li className="hover:text-primary cursor-pointer">Payment and billing issues</li>
                  <li className="hover:text-primary cursor-pointer">Upgrading your plan</li>
                  <li className="hover:text-primary cursor-pointer">Canceling subscriptions</li>
                  <li className="hover:text-primary cursor-pointer">Data privacy and security</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Answers to the most common questions about LocalJobzz
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">How do I create a job seeker profile?</h3>
                  <p className="text-muted-foreground text-sm">
                    Click "Sign Up" and choose "Job Seeker." Fill in your basic information, upload your resume, and add your skills and experience. Our AI will help optimize your profile for better matches.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Is LocalJobzz really free for job seekers?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes! Job seekers can use all basic features of LocalJobzz completely free. We offer premium features for advanced users, but the core platform is always free.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">How does the AI matching work?</h3>
                  <p className="text-muted-foreground text-sm">
                    Our AI analyzes your skills, experience, location preferences, and career goals to match you with relevant job opportunities. The more complete your profile, the better the matches.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Can I edit my application after submitting?</h3>
                  <p className="text-muted-foreground text-sm">
                    Once submitted, applications cannot be edited. However, you can send additional information to employers through our messaging system or reapply if the position is still open.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">How do I post a job as an employer?</h3>
                  <p className="text-muted-foreground text-sm">
                    Sign up as an employer, choose your plan, and click "Post Job." Fill in the job details, requirements, and budget. Our team reviews all postings within 24 hours.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">What payment methods do you accept?</h3>
                  <p className="text-muted-foreground text-sm">
                    We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our certified payment providers.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">How do I report a suspicious job posting?</h3>
                  <p className="text-muted-foreground text-sm">
                    Click the "Report" button on any job listing, or email us at connect@localjobzz.com with details. We investigate all reports within 24 hours and take appropriate action.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Can I get help with my resume?</h3>
                  <p className="text-muted-foreground text-sm">
                    Premium members get access to resume optimization tools and career coaching. Free users can access our resume tips and guidelines in the Help Center.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Still Need Help?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our support team is here to help you succeed. Choose the best way to reach us.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant help from our support team
              </p>
              <Button variant="outline" className="w-full">Start Chat</Button>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send us a detailed message
              </p>
              <Button variant="outline" className="w-full">Send Email</Button>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Book className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Knowledge Base</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our comprehensive guides
              </p>
              <Button variant="outline" className="w-full">Browse Articles</Button>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;