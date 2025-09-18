import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, Mail, Linkedin, Github } from "lucide-react";
import heroPortrait from "@/assets/hero-portrait.jpg";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Content */}
          <div className="space-y-8 fade-in">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                Available for opportunities
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
                Hi, I'm{" "}
                <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                  Your Name
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-foreground/90 font-light leading-relaxed">
                Senior Software Engineer & Product Designer crafting digital experiences that make a difference
              </p>
              
              <p className="text-lg text-primary-foreground/70 max-w-2xl leading-relaxed">
                Passionate about building scalable solutions and beautiful user interfaces. 
                5+ years of experience turning complex problems into elegant, user-friendly products.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => scrollToSection('contact')}
                className="btn-hero group"
              >
                Let's Work Together
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button 
                onClick={() => scrollToSection('projects')}
                className="btn-outline"
              >
                View My Work
              </Button>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-6 pt-4">
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail className="h-6 w-6" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-2">
                <Download className="h-5 w-5" />
                <span className="text-sm font-medium">Resume</span>
              </a>
            </div>
          </div>
          
          {/* Profile Image */}
          <div className="relative fade-in-delay">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-3xl transform rotate-6 scale-105 opacity-20" />
              <div className="relative bg-card rounded-3xl p-2 shadow-large">
                <img
                  src={heroPortrait}
                  alt="Professional portrait"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-card rounded-xl p-4 shadow-medium float-animation">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">Available for hire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full p-1">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;