import { Smartphone, LogOut, User } from "lucide-react";
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

  // Solo mostrar la opción de crear video
  const options = [
    {
      id: "crear-video",
      title: "Crear Video",
      description: "Genera videos profesionales con IA de última generación",
      icon: Smartphone,
      gradient: "from-primary/20 to-accent/10",
      onClick: () => navigate("/crear-video")
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
          src="https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/fondo%20del%20dashboard.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2ZvbmRvIGRlbCBkYXNoYm9hcmQubXA0IiwiaWF0IjoxNzUwNTUyMzAwLCJleHAiOjE3ODIwODgzMDB9.zK0ijbIhmiLjTodcNP2pJeTOxzd1wOGNH8oEdzHYKqc"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Header with user info and logout */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center space-x-2 sm:space-x-4">
        <div className="hidden sm:flex items-center space-x-2 text-muted-foreground">
          <User className="w-4 h-4" />
          <span className="text-sm truncate max-w-[120px] sm:max-w-none">{user?.email}</span>
        </div>
        <div className="sm:hidden flex items-center text-muted-foreground">
          <User className="w-4 h-4" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="cyber-border hover:cyber-glow bg-background/80 backdrop-blur-sm px-2 sm:px-4"
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6">
            <span className="text-white">Clone</span>
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">Game</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4 sm:px-0">
            ¡Bienvenido de vuelta! Selecciona una herramienta para comenzar.
          </p>
        </div>

        {/* Options Grid - Solo mostrar crear video */}
        <div className="flex justify-center px-4 sm:px-0">
          <div className="max-w-md w-full">
            {options.map((option) => {
              const IconComponent = option.icon;
              return (
                  <div
                  key={option.id}
                  onClick={option.onClick}
                  className="group relative bg-card/90 backdrop-blur-sm cyber-border rounded-2xl p-4 sm:p-8 hover:cyber-glow-intense transition-all duration-500 cursor-pointer transform hover:scale-105"
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
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">
                      {option.title}
                    </h3>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
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
