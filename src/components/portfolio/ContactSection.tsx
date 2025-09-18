import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Linkedin, Github, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon.",
      });
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hello@yourname.com",
      href: "mailto:hello@yourname.com"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: MapPin,
      title: "Location",
      value: "San Francisco, CA",
      href: "#"
    }
  ];

  const socialLinks = [
    {
      icon: Linkedin,
      title: "LinkedIn",
      href: "https://linkedin.com/in/yourname",
      username: "/in/yourname"
    },
    {
      icon: Github,
      title: "GitHub",
      href: "https://github.com/yourname",
      username: "@yourname"
    }
  ];

  return (
    <section id="contact" className="section-padding bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="px-4 py-2 mb-4">
            Contact
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Let's Build Something{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Amazing Together
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I'm always excited to discuss new opportunities and interesting projects. 
            Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <Card className="card-elegant">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Send me a message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      required 
                      className="transition-all duration-300 focus:shadow-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      required 
                      className="transition-all duration-300 focus:shadow-medium"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                    className="transition-all duration-300 focus:shadow-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Let's work together!" 
                    required 
                    className="transition-all duration-300 focus:shadow-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell me about your project or just say hello..."
                    className="min-h-32 transition-all duration-300 focus:shadow-medium"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="btn-hero w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Contact Info */}
          <div className="space-y-8">
            
            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground mb-6">Get in touch</h3>
              
              {contactInfo.map((info, index) => (
                <Card key={index} className="card-elegant">
                  <CardContent className="p-6">
                    <a 
                      href={info.href}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{info.title}</div>
                        <div className="text-muted-foreground group-hover:text-primary transition-colors">
                          {info.value}
                        </div>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-foreground">Follow me</h4>
              
              <div className="space-y-3">
                {socialLinks.map((social, index) => (
                  <Card key={index} className="card-elegant">
                    <CardContent className="p-4">
                      <a 
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 group"
                      >
                        <social.icon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {social.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {social.username}
                          </div>
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Availability Status */}
            <Card className="card-elegant">
              <CardContent className="p-6 text-center">
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-foreground">Available for new opportunities</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Currently accepting freelance projects and full-time positions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;