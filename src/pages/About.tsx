import { Mail, MapPin, Calendar, Users, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import founderImage from "@/assets/founder-harshit.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="About localjobzz - India's Premier Local Job Platform"
        description="Learn how localjobzz connects local workers with employers across India. Join 50,000+ job seekers and 5,000+ companies finding work daily."
        keywords="about localjobzz, local job platform, employment services India, job board India"
        canonicalUrl="https://localjobzz.com/about"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            About LocalJobzz
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing local employment by connecting talented professionals with meaningful opportunities in their communities.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At LocalJobzz, we believe that every community deserves access to quality employment opportunities. Our platform leverages cutting-edge technology and data-driven insights to create meaningful connections between local businesses and skilled professionals.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We're not just another job board – we're a comprehensive ecosystem that empowers local economies, reduces commute times, and builds stronger communities through strategic employment matching.
              </p>
              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                  <Target className="h-4 w-4" />
                  AI-Powered Matching
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                  <Users className="h-4 w-4" />
                  Community Focused
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                  <Heart className="h-4 w-4" />
                  People First
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Job Seekers</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">5K+</div>
                  <div className="text-sm text-muted-foreground">Partner Companies</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">200+</div>
                  <div className="text-sm text-muted-foreground">Cities Served</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Founder
            </h2>
            <p className="text-lg text-muted-foreground">
              Driven by passion for innovation and community empowerment
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-square md:aspect-auto">
                  <img 
                    src={founderImage} 
                    alt="Harshit Agrawal - Founder of LocalJobzz"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    Harshit Agrawal
                  </h3>
                  <p className="text-lg text-primary font-semibold mb-6">
                    Founder & CEO
                  </p>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    With a vision to transform how people find meaningful work in their local communities, Harshit founded LocalJobzz to bridge the gap between talented professionals and growing businesses. His expertise in technology and deep understanding of local market dynamics drives our innovative approach to employment solutions.
                  </p>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Under his leadership, LocalJobzz has become a trusted platform that prioritizes genuine connections, community growth, and sustainable employment practices.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="h-5 w-5 text-primary" />
                      <span>connect@localjobzz.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>Based in India & USA</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Founded LocalJobzz in 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How LocalJobzz Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple, efficient, and powered by intelligent matching
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">1. Create Profile</h3>
                <p className="text-muted-foreground">
                  Build your professional profile with skills, experience, and career goals. Our AI learns your preferences.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">2. Get Matched</h3>
                <p className="text-muted-foreground">
                  Receive personalized job recommendations based on your profile, location, and career aspirations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3. Land Your Job</h3>
                <p className="text-muted-foreground">
                  Apply directly, communicate with employers, and secure your ideal local position faster than ever.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do at LocalJobzz
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                Continuously improving our AI-powered matching technology to deliver better results.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-muted-foreground">
                Building stronger local economies by connecting talent with opportunity.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrity</h3>
              <p className="text-muted-foreground">
                Maintaining transparency, honesty, and ethical practices in all our operations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Support</h3>
              <p className="text-muted-foreground">
                Providing exceptional support to help every user achieve their career goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose LocalJobzz */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose LocalJobzz?
            </h2>
            <p className="text-lg text-muted-foreground">
              We're not just another job board – we're your career growth partner
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Precision</h3>
                  <p className="text-muted-foreground">
                    Our advanced algorithms learn from your preferences to deliver increasingly accurate job matches.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Local Focus</h3>
                  <p className="text-muted-foreground">
                    Reduce commute times and strengthen your community connections with local opportunities.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Verified Opportunities</h3>
                  <p className="text-muted-foreground">
                    Every employer and job posting is verified to ensure legitimate, quality opportunities.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Success-Driven</h3>
                  <p className="text-muted-foreground">
                    95% success rate in matching qualified candidates with their ideal positions.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="text-3xl font-bold text-primary mb-2">2025</div>
                <div className="text-sm text-muted-foreground">Founded with Vision</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-secondary/5 to-secondary/10">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Platform Availability</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-accent/5 to-accent/10">
                <div className="text-3xl font-bold text-primary mb-2">2</div>
                <div className="text-sm text-muted-foreground">Countries Served</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-muted/5 to-muted/10">
                <div className="text-3xl font-bold text-primary mb-2">$0</div>
                <div className="text-sm text-muted-foreground">Cost for Job Seekers</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Get Started CTA */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of people finding work or hiring workers on localjobzz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/post">
              <Button size="lg" className="w-full sm:w-auto">
                Post a Job
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Find Work
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;