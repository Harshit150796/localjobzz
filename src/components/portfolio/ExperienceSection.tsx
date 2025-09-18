import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, Calendar } from "lucide-react";

const ExperienceSection = () => {
  const experiences = [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      period: "2022 - Present",
      description: "Leading a team of 5 developers in building scalable web applications. Architected and implemented microservices infrastructure that improved system performance by 40%.",
      achievements: [
        "Built and deployed 3 major product features serving 100K+ users",
        "Mentored junior developers and established coding standards",
        "Reduced deployment time by 60% through CI/CD optimization"
      ],
      technologies: ["React", "Node.js", "AWS", "PostgreSQL", "Docker"]
    },
    {
      title: "Full Stack Developer",
      company: "StartupXYZ",
      location: "Remote",
      period: "2020 - 2022",
      description: "Developed the entire frontend and backend infrastructure for a B2B SaaS platform. Worked directly with founders to translate business requirements into technical solutions.",
      achievements: [
        "Built MVP from scratch, achieving $1M ARR within 18 months",
        "Implemented real-time features supporting 10K+ concurrent users",
        "Designed and developed responsive UI/UX increasing user engagement by 35%"
      ],
      technologies: ["Vue.js", "Python", "Django", "PostgreSQL", "Redis"]
    },
    {
      title: "Frontend Developer",
      company: "Digital Agency Co.",
      location: "New York, NY",
      period: "2019 - 2020",
      description: "Created responsive websites and web applications for various clients including e-commerce platforms and corporate websites.",
      achievements: [
        "Delivered 20+ client projects on time and within budget",
        "Improved website performance metrics by 50% on average",
        "Collaborated with design team to ensure pixel-perfect implementations"
      ],
      technologies: ["JavaScript", "React", "SCSS", "WordPress", "PHP"]
    }
  ];

  return (
    <section id="experience" className="section-padding bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="px-4 py-2 mb-4">
            Experience
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            My Professional{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building impactful solutions and growing with amazing teams
          </p>
        </div>
        
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <Card key={index} className="card-elegant">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6">
                  
                  {/* Company Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">{exp.title}</h3>
                      
                      <div className="flex items-center gap-2 text-primary">
                        <Building2 className="h-4 w-4" />
                        <span className="font-semibold">{exp.company}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{exp.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{exp.period}</span>
                      </div>
                    </div>
                    
                    {/* Technologies */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">Technologies:</div>
                      <div className="flex flex-wrap gap-1">
                        {exp.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Description & Achievements */}
                  <div className="md:col-span-2 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Key Achievements:</h4>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;