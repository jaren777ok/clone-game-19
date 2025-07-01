
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl cyber-border">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-medium mb-2">Verificando configuración...</h3>
            <p className="text-muted-foreground text-sm">
              Revisando tu configuración de Blotato existente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingState;
