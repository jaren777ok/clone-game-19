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
  { id: 'highlight', name: 'Highlight', description: 'Destacado palabra por palabra' },
  { id: 'karaoke', name: 'Karaoke', description: 'Efecto karaoke palabra por palabra' },
] as const;

const PLACEMENT_EFFECTS = [
  { id: 'animate', name: 'Animate', description: 'Efecto pop animado' },
  { id: 'align', name: 'Align', description: 'Palabra por palabra' },
  { id: 'static', name: 'Static', description: 'Textos lineales sin animación' },
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
    "Fixed size": getFixedSize('Montserrat'),
    fill: ''
  });

  const [animationKey, setAnimationKey] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentWordInGroup, setCurrentWordInGroup] = useState(0);
  const sampleText = "La Mente Humana es muy Rara";

  // Trigger animation when effects change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
    setCurrentGroupIndex(0);
    setCurrentWordInGroup(0);
  }, [customization.subtitleEffect, customization.placementEffect]);

  // Auto-manage hasBackgroundColor for highlight and karaoke effects
  useEffect(() => {
    if (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') {
      // Force hasBackgroundColor to false for highlight and karaoke effects
      setCustomization(prev => ({
        ...prev,
        hasBackgroundColor: false,
        fill: prev.fill || '#ffffff' // Ensure fill has a default value
      }));
    }
  }, [customization.subtitleEffect]);

  // Auto-select "static" placement effect for highlight and karaoke
  useEffect(() => {
    if (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') {
      setCustomization(prev => ({
        ...prev,
        placementEffect: 'static'
      }));
    }
  }, [customization.subtitleEffect]);

  // Auto-cycle through word groups for preview
  useEffect(() => {
    const words = sampleText.split(' ');
    const groups = [];
    for (let i = 0; i < words.length; i += 3) {
      groups.push(words.slice(i, i + 3));
    }
    
    if (groups.length > 1) {
      const timer = setInterval(() => {
        setCurrentGroupIndex(prev => (prev + 1) % groups.length);
      }, 3000); // Change group every 3 seconds
      
      return () => clearInterval(timer);
    }
  }, [sampleText, animationKey]);

  // Auto-cycle for highlight + static and karaoke + static effects: groups of 3 words with sequential highlighting
  useEffect(() => {
    if ((customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') && customization.placementEffect === 'static') {
      const words = sampleText.split(' ');
      const groups = [];
      for (let i = 0; i < words.length; i += 3) {
        groups.push(words.slice(i, i + 3));
      }
      
      const timer = setInterval(() => {
        setCurrentWordInGroup(prev => {
          setCurrentGroupIndex(currentIdx => {
            const currentGroup = groups[currentIdx] || [];
            if (prev + 1 >= currentGroup.length) {
              // Move to next group when current word cycle completes
              return (currentIdx + 1) % groups.length;
            }
            return currentIdx; // Keep same group
          });
          
          // Reset word index when moving to next group, otherwise increment
          const currentGroup = groups[currentGroupIndex] || [];
          return (prev + 1 >= currentGroup.length) ? 0 : prev + 1;
        });
      }, 800); // Change word every 800ms
      
      return () => clearInterval(timer);
    }
  }, [customization.subtitleEffect, customization.placementEffect, sampleText]);

  // Helper function to sanitize backgroundColor
  const sanitizeBackgroundColor = (customization: SubtitleCustomization): string => {
    // Para efectos highlight y karaoke: siempre ""
    if (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') {
      return "";
    }
    
    // Para otros efectos: "" si no está activado, valor hexadecimal si está activado
    return customization.hasBackgroundColor ? customization.backgroundColor : "";
  };

  const handleContinue = () => {
    // Asegurar que los valores calculados están presentes
    const finalCustomization = {
      ...customization,
      Tamañofuente: getFontWeight(customization.fontFamily),
      "Fixed size": getFixedSize(customization.fontFamily),
      backgroundColor: sanitizeBackgroundColor(customization)
    };
    onSelectCustomization(finalCustomization);
  };

  const getPreviewClasses = () => {
    const font = FONTS.find(f => f.name === customization.fontFamily);
    
    // Base font sizes - reduced for better fit
    let classes = `text-xl md:text-2xl lg:text-3xl font-bold transition-all duration-500 ${font?.class || 'font-montserrat'}`;
    
    // Special smaller size for highlight + static and karaoke + static combinations to fit 3 words in one line
    if ((customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') && customization.placementEffect === 'static') {
      classes = `text-lg md:text-xl lg:text-2xl font-bold transition-all duration-500 ${font?.class || 'font-montserrat'}`;
    }
    
    // Apply text transform
    if (customization.textTransform === 'uppercase') classes += ' uppercase';
    else if (customization.textTransform === 'lowercase') classes += ' lowercase';
    else if (customization.textTransform === 'capitalize') classes += ' capitalize';

    return classes;
  };

  const getAnimationStyles = (): React.CSSProperties => {
    // Special handling for highlight effect
    if (customization.subtitleEffect === 'highlight') {
      return {
        color: customization.fill || '#ffffff',
        backgroundColor: customization.textColor,
        padding: '8px 16px',
        borderRadius: '8px',
        display: 'inline-block',
        position: 'relative' as const,
        animation: 'highlightGlow 1.5s ease-in-out infinite',
      };
    }

    // Special handling for karaoke effect (only color change, no background)
    if (customization.subtitleEffect === 'karaoke') {
      return {
        color: customization.fill || '#ffffff',
        backgroundColor: 'transparent',
        padding: '8px 16px',
        borderRadius: '8px',
        display: 'inline-block',
        position: 'relative' as const,
        transition: 'color 0.3s ease-in-out',
      };
    }

    const styles: React.CSSProperties = {
      color: customization.textColor,
      backgroundColor: customization.hasBackgroundColor ? customization.backgroundColor : 'transparent',
      padding: '8px 16px',
      borderRadius: '8px',
      display: 'inline-block',
      position: 'relative' as const,
    };

    // Add subtitle effects
    if (customization.subtitleEffect === 'fade') {
      styles.animation = 'fadeIn 0.8s ease-out';
    } else if (customization.subtitleEffect === 'bounce') {
      styles.animation = 'bounceIn 0.6s ease-out';
    } else if (customization.subtitleEffect === 'slide') {
      styles.animation = 'slideDown 0.7s ease-out';
    }

    // Add placement effects (not for static)
    if (customization.placementEffect === 'animate') {
      styles.transform = 'scale(1.02)';
    }

    return styles;
  };

  const renderWordByWord = () => {
    const words = sampleText.split(' ');
    const groups = [];
    for (let i = 0; i < words.length; i += 3) {
      groups.push(words.slice(i, i + 3));
    }
    
    const currentGroup = groups[currentGroupIndex] || [];
    
    // Special handling for highlight and karaoke effects
    if (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') {
      // For highlight/karaoke + static: sequential word-by-word highlighting/karaoke in groups of 3
      if (customization.placementEffect === 'static') {
        const words = sampleText.split(' ');
        const groups = [];
        for (let i = 0; i < words.length; i += 3) {
          groups.push(words.slice(i, i + 3));
        }
        
        const currentGroup = groups[currentGroupIndex] || [];
        
        // Different rendering for highlight vs karaoke
        if (customization.subtitleEffect === 'highlight') {
          return (
            <div className="inline-flex flex-wrap gap-2">
              {currentGroup.map((word, index) => {
                // Only the word with the current index within the group is highlighted
                const isHighlighted = index === currentWordInGroup;
                
                return (
                  <div
                    key={`${animationKey}-group-${currentGroupIndex}-word-${index}`}
                    style={{
                      color: customization.fill || '#ffffff', // Always use user's chosen text color
                      backgroundColor: isHighlighted ? customization.textColor : 'transparent',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease-in-out',
                      display: 'inline-block',
                    }}
                    className={getPreviewClasses()}
                  >
                    {word}
                  </div>
                );
              })}
            </div>
          );
        } else if (customization.subtitleEffect === 'karaoke') {
          // Karaoke effect: cumulative color change from left to right
          return (
            <div className="inline-flex flex-wrap gap-2">
              {currentGroup.map((word, index) => {
                // Words up to and including current word get karaoke color (textColor)
                const isKaraokeActive = index <= currentWordInGroup;
                
                return (
                  <div
                    key={`${animationKey}-group-${currentGroupIndex}-word-${index}`}
                    style={{
                      color: isKaraokeActive ? customization.textColor : (customization.fill || '#ffffff'),
                      backgroundColor: 'transparent', // No background for karaoke
                      padding: '8px 16px',
                      borderRadius: '8px',
                      transition: 'color 0.3s ease-in-out',
                      display: 'inline-block',
                    }}
                    className={getPreviewClasses()}
                  >
                    {word}
                  </div>
                );
              })}
            </div>
          );
        }
      }
      
      // For other highlight/karaoke effects: show word by word with respective animation
      return (
        <div className="inline-flex flex-wrap gap-2">
          {currentGroup.map((word, index) => (
            <div
              key={`${animationKey}-${currentGroupIndex}-${index}`}
              style={{
                ...getAnimationStyles(),
                animationDelay: `${index * 0.4}s`,
              }}
              className={getPreviewClasses()}
            >
              {word}
            </div>
          ))}
        </div>
      );
    }
    
    // For "align" effect: show words one by one within the group
    if (customization.placementEffect === 'align') {
      return (
        <div className="inline-flex flex-wrap gap-2">
          {currentGroup.map((word, index) => (
            <div
              key={`${animationKey}-${currentGroupIndex}-${index}`}
              style={{
                ...getAnimationStyles(),
                animationDelay: `${index * 0.3}s`,
              }}
              className={getPreviewClasses()}
            >
              {word}
            </div>
          ))}
        </div>
      );
    }
    
    // For static effect: show without animations
    if (customization.placementEffect === 'static') {
      const groupText = currentGroup.join(' ');
      return (
        <div 
          key={`${animationKey}-${currentGroupIndex}`}
          style={getAnimationStyles()} 
          className={getPreviewClasses()}
        >
          {groupText}
        </div>
      );
    }
    
    // For other effects: show the group as a unit with combined effects
    const groupText = currentGroup.join(' ');
    const baseStyles = getAnimationStyles();
    
    // Combine subtitle effect with animate (pop) effect if selected
    let combinedAnimation = '';
    if (customization.subtitleEffect === 'fade') {
      combinedAnimation = customization.placementEffect === 'animate' 
        ? 'fadeInPop 0.8s ease-out' 
        : 'fadeIn 0.8s ease-out';
    } else if (customization.subtitleEffect === 'bounce') {
      combinedAnimation = customization.placementEffect === 'animate' 
        ? 'bounceInPop 0.6s ease-out' 
        : 'bounceIn 0.6s ease-out';
    } else if (customization.subtitleEffect === 'slide') {
      combinedAnimation = customization.placementEffect === 'animate' 
        ? 'slideDownPop 0.7s ease-out' 
        : 'slideDown 0.7s ease-out';
    } else {
      combinedAnimation = customization.placementEffect === 'animate' 
        ? 'popOnly 0.4s ease-out' 
        : 'none';
    }
    
    return (
      <div 
        key={`${animationKey}-${currentGroupIndex}`}
        style={{
          ...baseStyles,
          animation: combinedAnimation,
        }} 
        className={getPreviewClasses()}
      >
        {groupText}
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
        @keyframes fadeInPop {
          0% { opacity: 0; transform: scale(0.9); }
          70% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bounceInPop {
          0% { opacity: 0; transform: scale(0.7); }
          40% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDownPop {
          0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
          60% { opacity: 1; transform: translateY(0) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popOnly {
          0% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes highlightGlow {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
            transform: scale(1.02);
          }
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
              {/* Background Color - Logic changes for Highlight */}
              <Card className="p-4 border-cyber-glow/20 bg-card/50 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">
                      {customization.subtitleEffect === 'highlight' ? 'Fondo Nuevo Color' : 
                       customization.subtitleEffect === 'karaoke' ? 'Karaoke Nuevo Color' : 'Color de Fondo'}
                    </h4>
                  </div>
                  {customization.subtitleEffect !== 'highlight' && customization.subtitleEffect !== 'karaoke' && (
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
                  )}
                </div>
                
                {/* Show color selection for highlight, karaoke OR when background is enabled */}
                {(customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke' || customization.hasBackgroundColor) ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCustomization(prev => ({ ...prev, 
                            textColor: (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? color : prev.textColor,
                            backgroundColor: (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? prev.backgroundColor : color
                          }))}
                          className={`w-8 h-8 rounded border-2 transition-all ${
                            ((customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? customization.textColor : customization.backgroundColor) === color
                              ? 'border-primary scale-110'
                              : 'border-border hover:border-primary/50'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={(customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? customization.textColor : customization.backgroundColor}
                      onChange={(e) => setCustomization(prev => ({ ...prev, 
                        textColor: (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? e.target.value : prev.textColor,
                        backgroundColor: (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? prev.backgroundColor : e.target.value
                      }))}
                      className="w-full h-8 rounded border border-border"
                    />
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground animate-fade-in">
                    <div className="text-sm">Activar para personalizar color de fondo</div>
                  </div>
                )}
              </Card>

              {/* Text Color / Letra Nueva Color for Highlight */}
              <Card className="p-4 border-cyber-glow/20 bg-card/50 backdrop-blur">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">
                    {(customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? 'Letra Nueva Color' : 'Color de Letra'}
                  </h4>
                </div>
                {customization.subtitleEffect !== 'highlight' && customization.subtitleEffect !== 'karaoke' ? (
                  <>
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
                  </>
                ) : (
                  /* Special selector for highlight and karaoke fill color */
                  <>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={() => setCustomization(prev => ({ ...prev, fill: color }))}
                          className={`w-8 h-8 rounded border-2 transition-all ${
                            customization.fill === color
                              ? 'border-primary scale-110'
                              : 'border-border hover:border-primary/50'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={customization.fill || '#ffffff'}
                      onChange={(e) => setCustomization(prev => ({ ...prev, fill: e.target.value }))}
                      className="w-full h-8 rounded border border-border"
                    />
                  </>
                )}
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
              
              <div className="bg-black/80 rounded-lg p-4 md:p-6 lg:p-8 min-h-[220px] md:min-h-[250px] lg:min-h-[280px] flex items-center justify-center">
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