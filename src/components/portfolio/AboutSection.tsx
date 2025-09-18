import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const AboutSection = () => {
  const skills = [
    { name: "JavaScript/TypeScript", level: 95 },
    { name: "React/Next.js", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "Python", level: 80 },
    { name: "UI/UX Design", level: 85 },
    { name: "Cloud Architecture", level: 80 },
  ];

  const technologies = [
    "React", "TypeScript", "Node.js", "Python", "AWS", "Docker", 
    "PostgreSQL", "MongoDB", "Figma", "Git", "Kubernetes", "GraphQL"
  ];

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* About Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="px-4 py-2">
                About Me
              </Badge>
              
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Turning Ideas Into{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Digital Reality
                </span>
              </h2>
              
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="text-lg">
                  I'm a passionate software engineer with a strong background in full-stack development 
                  and product design. My journey began 5 years ago, and since then, I've had the privilege 
                  of working with startups and established companies to bring innovative ideas to life.
                </p>
                
                <p>
                  What sets me apart is my ability to bridge the gap between technical excellence and 
                  user experience. I believe that great software should not only work flawlessly but 
                  also feel intuitive and delightful to use.
                </p>
                
                <p>
                  When I'm not coding, you'll find me exploring new technologies, contributing to 
                  open-source projects, or mentoring aspiring developers in my community.
                </p>
              </div>
            </div>
            
            {/* Technologies */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Technologies I Work With</h3>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Skills */}
          <div className="space-y-8">
            <Card className="card-elegant">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-8">Core Skills</h3>
                
                <div className="space-y-6">
                  {skills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="card-elegant">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Projects Completed</div>
                </CardContent>
              </Card>
              
              <Card className="card-elegant">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">5+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;