import { Mail, MapPin, Calendar, Users, Target, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import founderImage from "@/assets/founder-harshit.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
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
                      <span>Based in India</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Founded LocalJobzz in 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of professionals who have found their perfect local job through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Card className="p-6 bg-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Get in Touch</div>
                  <div className="text-sm opacity-90">connect@localjobzz.com</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;