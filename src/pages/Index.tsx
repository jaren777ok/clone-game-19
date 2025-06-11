
import { Smartphone, Brain } from "lucide-react";

const Index = () => {
  const options = [
    {
      id: "crear-video",
      title: "Crear Video",
      description: "Genera videos profesionales con IA de última generación",
      icon: Smartphone,
      gradient: "from-primary/20 to-accent/10"
    },
    {
      id: "neurocopy-gpt",
      title: "Neurocopy GPT",
      description: "Inteligencia artificial híbrida para copywriting avanzado",
      icon: Brain,
      gradient: "from-accent/20 to-primary/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-accent rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
            ¿Cómo le gustaría comenzar, RAM?
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Acceda a herramientas de inteligencia artificial de próxima generación para crear contenido y automatizar flujos de trabajo con precisión cuántica.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {options.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="group relative bg-card cyber-border rounded-2xl p-8 hover:cyber-glow-intense transition-all duration-500 cursor-pointer transform hover:scale-105"
              >
                {/* Card gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Card content */}
                <div className="relative z-10">
                  {/* Icon container */}
                  <div className="mb-6 relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center cyber-glow group-hover:animate-cyber-pulse">
                      <IconComponent className="w-8 h-8 text-background" />
                    </div>
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 w-16 h-16 bg-primary/20 rounded-xl blur-xl group-hover:bg-primary/40 transition-colors duration-500"></div>
                  </div>

                  {/* Text content */}
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                    {option.description}
                  </p>

                  {/* Hover indicator */}
                  <div className="mt-6 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Iniciar →</span>
                  </div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-br-2xl"></div>
              </div>
            );
          })}
        </div>

        {/* Footer section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm tracking-wider uppercase">Sistema Neural Activo</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>

      {/* Background geometric shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default Index;
