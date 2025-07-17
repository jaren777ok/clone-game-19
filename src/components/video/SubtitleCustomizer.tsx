import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Eye, Palette, Type, Sparkles, RotateCcw, Monitor } from 'lucide-react';
import { SubtitleCustomization } from '@/types/videoFlow';
// Fixed Transform import issue - using RotateCcw instead

interface SubtitleCustomizerProps {
  onSelectCustomization: (customization: SubtitleCustomization) => void;
  onBack: () => void;
}

const FONTS = [
  { name: 'Montserrat', class: 'font-montserrat', preview: 'Montserrat' },
  { name: 'Roboto', class: 'font-roboto', preview: 'Roboto' },
  { name: 'Roboto Condensed', class: 'font-roboto-condensed', preview: 'Roboto Condensed' },
  { name: 'Roboto Mono', class: 'font-roboto-mono', preview: 'Roboto Mono' },
  { name: 'Roboto Slab', class: 'font-roboto-slab', preview: 'Roboto Slab' },
  { name: 'Anton', class: 'font-anton', preview: 'Anton' },
  { name: 'Antonio', class: 'font-antonio', preview: 'Antonio' },
  { name: 'Archivo Black', class: 'font-archivo-black', preview: 'Archivo Black' },
  { name: 'Archivo Narrow', class: 'font-archivo-narrow', preview: 'Archivo Narrow' },
  { name: 'Bebas Neue', class: 'font-bebas-neue', preview: 'Bebas Neue' },
  { name: 'Staatliches', class: 'font-staatliches', preview: 'Staatliches' },
  { name: 'Squada One', class: 'font-squada-one', preview: 'Squada One' },
];

const SUBTITLE_EFFECTS = [
  { id: 'color', name: 'Normal', description: 'Sin efectos especiales' },
  { id: 'fade', name: 'Fade', description: 'Entrada con desvanecimiento' },
  { id: 'bounce', name: 'Bounce', description: 'Entrada con zoom suave' },
  { id: 'slide', name: 'Slide', description: 'Entrada desde arriba' },
] as const;

const PLACEMENT_EFFECTS = [
  { id: 'animate', name: 'Animate', description: 'Efecto pop animado' },
  { id: 'align', name: 'Align', description: 'Palabra por palabra' },
] as const;

const TEXT_TRANSFORMS = [
  { id: 'uppercase', name: 'MAYÚSCULAS', description: 'Todo en mayúsculas' },
  { id: 'capitalize', name: 'Capitalizado', description: 'Primera letra mayúscula' },
  { id: 'lowercase', name: 'minúsculas', description: 'Todo en minúsculas' },
] as const;

const COLOR_PALETTE = [
  '#421010', '#1a1a2e', '#16213e', '#0f3460', '#533a71',
  '#ff1700', '#e94560', '#f38ba8', '#fab387', '#f9e2af',
  '#a6e3a1', '#94e2d5', '#89dceb', '#74c7ec', '#89b4fa',
  '#cba6f7', '#f5c2e7', '#eba0ac', '#f38ba8', '#f9e2af'
];

const SubtitleCustomizer: React.FC<SubtitleCustomizerProps> = ({
  onSelectCustomization,
  onBack
}) => {
  // Helper functions for font weight and fixed size mapping
  const getFontWeight = (fontFamily: string): number => {
    const fontWeight400 = ['Anton', 'Archivo Black', 'Bebas Neue', 'Staatliches', 'Squada One'];
    return fontWeight400.includes(fontFamily) ? 400 : 700;
  };

  const getFixedSize = (fontFamily: string): number => {
    const size65Fonts = ['Anton', 'Antonio', 'Archivo Narrow', 'Bebas Neue', 'Staatliches', 'Squada One'];
    const size61Fonts = ['Archivo Black', 'Roboto Condensed'];
    
    if (size65Fonts.includes(fontFamily)) return 6.5;
    if (size61Fonts.includes(fontFamily)) return 6.1;
    return 5.5; // default
  };

  const [customization, setCustomization] = useState<SubtitleCustomization>({
    fontFamily: 'Montserrat',
    subtitleEffect: 'color',
    placementEffect: 'animate',
    textTransform: 'capitalize',
    hasBackgroundColor: false,
    backgroundColor: '#421010',
    textColor: '#ffffff',
    Tamañofuente: getFontWeight('Montserrat'),
    "Fixed size": getFixedSize('Montserrat')
  });

  const [animationKey, setAnimationKey] = useState(0);
  const sampleText = "Cuatro instrumentos musicales revolucionan la industria";

  // Trigger animation when effects change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [customization.subtitleEffect, customization.placementEffect]);

  const handleContinue = () => {
    // Asegurar que los valores calculados están presentes
    const finalCustomization = {
      ...customization,
      Tamañofuente: getFontWeight(customization.fontFamily),
      "Fixed size": getFixedSize(customization.fontFamily)
    };
    onSelectCustomization(finalCustomization);
  };

  const getPreviewClasses = () => {
    const font = FONTS.find(f => f.name === customization.fontFamily);
    let classes = `text-2xl font-bold transition-all duration-500 ${font?.class || 'font-montserrat'}`;
    
    // Apply text transform
    if (customization.textTransform === 'uppercase') classes += ' uppercase';
    else if (customization.textTransform === 'lowercase') classes += ' lowercase';
    else if (customization.textTransform === 'capitalize') classes += ' capitalize';

    return classes;
  };

  const getAnimationStyles = () => {
    const styles: React.CSSProperties = {
      color: customization.textColor,
      backgroundColor: customization.hasBackgroundColor ? customization.backgroundColor : 'transparent',
      padding: '12px 20px',
      borderRadius: '8px',
      display: 'inline-block',
      position: 'relative',
    };

    // Add subtitle effects
    if (customization.subtitleEffect === 'fade') {
      styles.animation = 'fadeIn 0.8s ease-out';
    } else if (customization.subtitleEffect === 'bounce') {
      styles.animation = 'bounceIn 0.6s ease-out';
    } else if (customization.subtitleEffect === 'slide') {
      styles.animation = 'slideDown 0.7s ease-out';
    }

    // Add placement effects
    if (customization.placementEffect === 'animate') {
      styles.transform = 'scale(1.02)';
    }

    return styles;
  };

  const renderWordByWord = () => {
    if (customization.placementEffect !== 'align') {
      return (
        <div style={getAnimationStyles()} className={getPreviewClasses()}>
          {sampleText}
        </div>
      );
    }

    const words = sampleText.split(' ');
    return (
      <div className="inline-flex flex-wrap gap-2">
        {words.map((word, index) => (
          <div
            key={`${animationKey}-${index}`}
            style={{
              ...getAnimationStyles(),
              animationDelay: `${index * 0.2}s`,
            }}
            className={getPreviewClasses()}
          >
            {word}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cyber-dark to-background">
      {/* Custom CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.8); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Personalizar Subtítulos
            </h1>
            <p className="text-muted-foreground mt-2">Estilo Noticia - Configuración avanzada</p>
          </div>
          <div className="w-20" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Font Selection */}
            <Card className="p-6 border-cyber-glow/20 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Tipo de Fuente</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {FONTS.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setCustomization(prev => ({ 
                      ...prev, 
                      fontFamily: font.name,
                      Tamañofuente: getFontWeight(font.name),
                      "Fixed size": getFixedSize(font.name)
                    }))}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      customization.fontFamily === font.name
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`${font.class} text-sm font-medium`}>
                      {font.preview}
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Subtitle Effects */}
            <Card className="p-6 border-cyber-glow/20 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Efectos de Subtítulos</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SUBTITLE_EFFECTS.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setCustomization(prev => ({ ...prev, subtitleEffect: effect.id }))}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      customization.subtitleEffect === effect.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{effect.name}</div>
                    <div className="text-xs text-muted-foreground">{effect.description}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Placement Effects */}
            <Card className="p-6 border-cyber-glow/20 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Efectos de Colocación</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PLACEMENT_EFFECTS.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setCustomization(prev => ({ ...prev, placementEffect: effect.id }))}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      customization.placementEffect === effect.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{effect.name}</div>
                    <div className="text-xs text-muted-foreground">{effect.description}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Text Transform */}
            <Card className="p-6 border-cyber-glow/20 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Transformación de Texto</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {TEXT_TRANSFORMS.map((transform) => (
                  <button
                    key={transform.id}
                    onClick={() => setCustomization(prev => ({ ...prev, textTransform: transform.id }))}
                    className={`p-2 sm:p-3 rounded-lg border text-left transition-all ${
                      customization.textTransform === transform.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-xs sm:text-sm">{transform.name}</div>
                    <div className="text-xs text-muted-foreground">{transform.description}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Background Color */}
              <Card className="p-4 border-cyber-glow/20 bg-card/50 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">Color de Fondo</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={customization.hasBackgroundColor}
                      onCheckedChange={(checked) => {
                        setCustomization(prev => ({ 
                          ...prev, 
                          hasBackgroundColor: checked,
                          backgroundColor: checked ? (prev.backgroundColor || '#421010') : prev.backgroundColor
                        }));
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {customization.hasBackgroundColor ? 'Activado' : 'Desactivado'}
                    </span>
                  </div>
                </div>
                
                {customization.hasBackgroundColor ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCustomization(prev => ({ ...prev, backgroundColor: color }))}
                          className={`w-8 h-8 rounded border-2 transition-all ${
                            customization.backgroundColor === color
                              ? 'border-primary scale-110'
                              : 'border-border hover:border-primary/50'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={customization.backgroundColor}
                      onChange={(e) => setCustomization(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-8 rounded border border-border"
                    />
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground animate-fade-in">
                    <div className="text-sm">Activar para personalizar color de fondo</div>
                  </div>
                )}
              </Card>

              {/* Text Color */}
              <Card className="p-4 border-cyber-glow/20 bg-card/50 backdrop-blur">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Color de Letra</h4>
                </div>
                <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCustomization(prev => ({ ...prev, textColor: color }))}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        customization.textColor === color
                          ? 'border-primary scale-110'
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={customization.textColor}
                  onChange={(e) => setCustomization(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-full h-8 rounded border border-border"
                />
              </Card>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8">
            <Card className="p-8 border-cyber-glow/20 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Vista Previa en Tiempo Real</h3>
              </div>
              
              <div className="bg-black/80 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  {renderWordByWord()}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="text-sm text-muted-foreground">
                  <strong>Configuración actual:</strong>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{customization.fontFamily}</Badge>
                  <Badge variant="secondary">{customization.subtitleEffect}</Badge>
                  <Badge variant="secondary">{customization.placementEffect}</Badge>
                  <Badge variant="secondary">{customization.textTransform}</Badge>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleContinue}
              className="w-full mt-6 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3"
            >
              Continuar con Neurocopy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleCustomizer;