
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CardCustomization } from '@/types/videoFlow';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customization: CardCustomization) => void;
  generatedScript: string;
}

// Función utilitaria para transformar comillas dobles a simples
const transformQuotes = (value: string): string => {
  return value.replace(/"/g, "'");
};

const CustomizeCardsModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, generatedScript }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [loadingTitulo, setLoadingTitulo] = useState(false);
  const [loadingSubtitulo, setLoadingSubtitulo] = useState(false);

  const handleCompleteWithAI = async (campo: 'titulo' | 'subtitulo') => {
    const setLoading = campo === 'titulo' ? setLoadingTitulo : setLoadingSubtitulo;
    const setValue = campo === 'titulo' ? setTitulo : setSubtitulo;
    const maxLength = campo === 'titulo' ? 62 : 45;
    
    setLoading(true);
    
    try {
      const response = await fetch('https://cris.cloude.es/webhook/generador-de-texto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guion: generatedScript,
          campo: campo
        })
      });
      
      const data = await response.json();
      
      // Respuesta esperada: [{ "exito": "texto" }]
      if (data && data[0] && data[0].exito) {
        const texto = transformQuotes(data[0].exito.slice(0, maxLength));
        setValue(texto);
      }
    } catch (error) {
      console.error('Error al completar con IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const customization: CardCustomization = {
      fecha: format(date, 'dd/MM/yyyy'),
      titulo: transformQuotes(titulo.trim()),
      subtitulo: transformQuotes(subtitulo.trim())
    };
    onConfirm(customization);
  };

  const isValid = titulo.trim().length > 0 && subtitulo.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md cyber-border cyber-gradient backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gradient-safe text-center py-2">
            Personaliza las Tarjetas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Campo Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-sm font-medium text-foreground">
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal cyber-border hover:cyber-glow h-12",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy', { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 cyber-border" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Campo Título */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="titulo" className="text-sm font-medium text-foreground">
                Título
              </Label>
              <span className={cn(
                "text-xs",
                titulo.length > 62 ? "text-destructive" : "text-muted-foreground"
              )}>
                {titulo.length}/62
              </span>
            </div>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(transformQuotes(e.target.value.slice(0, 62)))}
              placeholder="Ingresa el título de la noticia"
              className="cyber-border focus:cyber-glow h-12"
              maxLength={62}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleCompleteWithAI('titulo')}
              disabled={loadingTitulo || !generatedScript}
              className="w-full mt-1 text-primary hover:text-primary/80 hover:bg-primary/10 flex items-center justify-center gap-2"
            >
              {loadingTitulo ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Completar con IA
                </>
              )}
            </Button>
          </div>

          {/* Campo Subtítulo */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="subtitulo" className="text-sm font-medium text-foreground">
                Subtítulo
              </Label>
              <span className={cn(
                "text-xs",
                subtitulo.length > 45 ? "text-destructive" : "text-muted-foreground"
              )}>
                {subtitulo.length}/45
              </span>
            </div>
            <Input
              id="subtitulo"
              value={subtitulo}
              onChange={(e) => setSubtitulo(transformQuotes(e.target.value.slice(0, 45)))}
              placeholder="Ingresa el subtítulo de la noticia"
              className="cyber-border focus:cyber-glow h-12"
              maxLength={45}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleCompleteWithAI('subtitulo')}
              disabled={loadingSubtitulo || !generatedScript}
              className="w-full mt-1 text-primary hover:text-primary/80 hover:bg-primary/10 flex items-center justify-center gap-2"
            >
              {loadingSubtitulo ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Completar con IA
                </>
              )}
            </Button>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 cyber-border hover:cyber-glow h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isValid}
              className="flex-1 cyber-glow h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeCardsModal;
