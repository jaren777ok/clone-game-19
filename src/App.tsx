import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import NeurocopyChat from "./pages/NeurocopyChat";
import VideoCreationFlow from "./pages/VideoCreationFlow";
import VideoGeneratorFinal from "./pages/VideoGeneratorFinal";
import SavedVideos from "./pages/SavedVideos";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

// Componente para manejar la redirección de usuarios autenticados
const AuthRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-background rounded"></div>
          </div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, mostrar la página de autenticación
  return <Auth />;
};

// Componente interno que contiene las rutas y necesita acceso al AuthProvider
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<AuthRedirect />} />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    <Route path="/neurocopy-gpt" element={
      <ProtectedRoute>
        <NeurocopyChat />
      </ProtectedRoute>
    } />
    <Route path="/crear-video" element={
      <ProtectedRoute>
        <VideoCreationFlow />
      </ProtectedRoute>
    } />
    <Route path="/crear-video-generator" element={
      <ProtectedRoute>
        <VideoGeneratorFinal />
      </ProtectedRoute>
    } />
    <Route path="/videos-guardados" element={
      <ProtectedRoute>
        <SavedVideos />
      </ProtectedRoute>
    } />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <SonnerToaster />
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
