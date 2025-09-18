import { Badge } from "@/components/ui/badge";
import { Linkedin, Github, Mail, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/in/yourname", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/yourname", label: "GitHub" },
    { icon: Mail, href: "mailto:hello@yourname.com", label: "Email" }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          {/* Logo & CTA */}
          <div className="space-y-4">
            <button 
              onClick={scrollToTop}
              className="text-2xl font-bold hover:text-accent transition-colors"
            >
              YourName
            </button>
            
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Crafting digital experiences with passion and precision. 
              Let's build something amazing together.
            </p>
            
            <Badge variant="secondary" className="px-3 py-1">
              Available for hire
            </Badge>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['About', 'Experience', 'Projects', 'Contact'].map((link) => (
                <button
                  key={link}
                  onClick={() => document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-left text-primary-foreground/80 hover:text-accent transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
          
          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            
            <p className="text-xs text-primary-foreground/60">
              hello@yourname.com<br />
              +1 (555) 123-4567
            </p>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60 flex items-center gap-1">
            © {currentYear} Made with <Heart className="h-4 w-4 text-red-400" /> by YourName
          </p>
          
          <div className="flex gap-6 text-xs text-primary-foreground/60">
            <button className="hover:text-accent transition-colors">Privacy Policy</button>
            <button className="hover:text-accent transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;