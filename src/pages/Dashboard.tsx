
import { Smartphone, Brain, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const options = [
    {
      id: "crear-video",
      title: "Crear Video",
      description: "Genera videos profesionales con IA de última generación",
      icon: Smartphone,
      gradient: "from-primary/20 to-accent/10",
      onClick: () => navigate("/crear-video")
    },
    {
      id: "neurocopy-gpt",
      title: "Neurocopy GPT",
      description: "Inteligencia artificial híbrida para copywriting avanzado",
      icon: Brain,
      gradient: "from-accent/20 to-primary/10",
      onClick: () => navigate("/neurocopy-gpt")
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      >
        <source
          src="https://hxqdmjiqfjnaqganavog.supabase.co/storage/v1/object/sign/fondo/fondo%20de%20login%20.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mZDNjMjgwYS00YjczLTRlNTItOWY5MS05ZmVjM2MyZmZhN2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb25kby9mb25kbyBkZSBsb2dpbiAubXA0IiwiaWF0IjoxNzQ5NzczMjA5LCJleHAiOjIwNjUxMzMyMDl9.N_d0ajv13x02HMQvxIsvPXmb3ln46obgnOk0WurH4oM"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Header with user info and logout */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="text-sm">{user?.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="cyber-border hover:cyber-glow bg-background/80 backdrop-blur-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
            NEWS VERO IA
          </h1>
          <p className="text-muted-foreground text-lg">
            ¡Bienvenido de vuelta! Selecciona una herramienta para comenzar.
          </p>
        </div>

        {/* Options Grid - Now showing both options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {options.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                onClick={option.onClick}
                className="group relative bg-card/90 backdrop-blur-sm cyber-border rounded-2xl p-8 hover:cyber-glow-intense transition-all duration-500 cursor-pointer transform hover:scale-105"
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

export default Dashboard;
