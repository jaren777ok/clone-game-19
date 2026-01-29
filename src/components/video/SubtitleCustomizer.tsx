import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Palette, Type, Sparkles, RotateCcw, Monitor } from 'lucide-react';
import { SubtitleCustomization } from '@/types/videoFlow';

interface SubtitleCustomizerProps {
  onSelectCustomization: (customization: SubtitleCustomization) => void;
  onBack: () => void;
}

const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3Njk3MTYyNzQsImV4cCI6MTkyNzM5NjI3NH0.WY9BkeYyf8U0doTqKMBmXo0X_2pecKTwDy3tMN7VKHY';

const PREVIEW_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/video%20de%20prueba%20subtitulos.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy92aWRlbyBkZSBwcnVlYmEgc3VidGl0dWxvcy5tcDQiLCJpYXQiOjE3Njk3MjA1NjEsImV4cCI6MTkyNzQwMDU2MX0.bsgwHIxC3SNEOg4ney65wtOMvTn7zbXL56ofK-VTsM0';

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
  const [currentWordCount, setCurrentWordCount] = useState(1);
  const sampleText = "La Mente Humana es muy Rara";

  // Trigger animation when effects change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
    setCurrentGroupIndex(0);
    setCurrentWordInGroup(0);
    setCurrentWordCount(1);
  }, [customization.subtitleEffect, customization.placementEffect]);

  // Auto-manage hasBackgroundColor for highlight and karaoke effects
  useEffect(() => {
    if (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') {
      setCustomization(prev => ({
        ...prev,
        hasBackgroundColor: false,
        fill: prev.fill || '#ffffff'
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
    
    if (customization.placementEffect === 'align') {
      const timer = setInterval(() => {
        if (currentWordCount < 3) {
          setCurrentWordCount(prev => prev + 1);
        } else {
          const nextGroupIndex = (currentGroupIndex + 1) % groups.length;
          setCurrentGroupIndex(nextGroupIndex);
          setCurrentWordCount(1);
          setAnimationKey(Date.now());
        }
      }, 800);
      
      return () => clearInterval(timer);
    }
    
    if (groups.length > 1) {
      const timer = setInterval(() => {
        setCurrentGroupIndex(prev => (prev + 1) % groups.length);
      }, 3000);
      
      return () => clearInterval(timer);
    }
  }, [sampleText, animationKey, customization.placementEffect, currentWordCount, currentGroupIndex]);

  // Auto-cycle for highlight + static and karaoke + static effects
  useEffect(() => {
    if ((customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') && customization.placementEffect === 'static') {
      const words = sampleText.split(' ');
      const groups = [];
      for (let i = 0; i < words.length; i += 3) {
        groups.push(words.slice(i, i + 3));
      }
      
      const timer = setInterval(() => {
        setCurrentWordInGroup(prev => {
          const currentGroup = groups[currentGroupIndex] || [];
          
          if (prev + 1 >= currentGroup.length) {
            setCurrentGroupIndex(prevGroup => (prevGroup + 1) % groups.length);
            return 0;
          }
          
          return prev + 1;
        });
      }, 1200);
      
      return () => clearInterval(timer);
    }
  }, [customization.subtitleEffect, customization.placementEffect, sampleText, currentGroupIndex]);

  // Helper function to sanitize backgroundColor
  const sanitizeBackgroundColor = (customization: SubtitleCustomization): string => {
    if (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') {
      return "";
    }
    return customization.hasBackgroundColor ? customization.backgroundColor : "";
  };

  const handleContinue = () => {
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
    
    let classes = `text-xl md:text-2xl lg:text-3xl font-bold transition-all duration-500 ${font?.class || 'font-montserrat'}`;
    
    if ((customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') && customization.placementEffect === 'static') {
      classes = `text-xl md:text-2xl lg:text-2xl font-bold transition-all duration-500 whitespace-nowrap ${font?.class || 'font-montserrat'}`;
    }
    
    if (customization.textTransform === 'uppercase') classes += ' uppercase';
    else if (customization.textTransform === 'lowercase') classes += ' lowercase';
    else if (customization.textTransform === 'capitalize') classes += ' capitalize';

    return classes;
  };

  const getAnimationStyles = (): React.CSSProperties => {
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

    if (customization.subtitleEffect === 'fade') {
      styles.animation = 'fadeIn 0.8s ease-out';
    } else if (customization.subtitleEffect === 'bounce') {
      styles.animation = 'bounceIn 0.6s ease-out';
    } else if (customization.subtitleEffect === 'slide') {
      styles.animation = 'slideDown 0.7s ease-out';
    }

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
    
    if (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') {
      if (customization.placementEffect === 'static') {
        const words = sampleText.split(' ');
        const groups = [];
        for (let i = 0; i < words.length; i += 3) {
          groups.push(words.slice(i, i + 3));
        }
        
        const currentGroup = groups[currentGroupIndex] || [];
        
        if (customization.subtitleEffect === 'highlight') {
          return (
            <div className="inline-flex flex-wrap gap-1">
              {currentGroup.map((word, index) => {
                const isHighlighted = index === currentWordInGroup;
                
                return (
                  <div
                    key={`${animationKey}-group-${currentGroupIndex}-word-${index}`}
                    style={{
                      color: customization.fill || '#ffffff',
                      backgroundColor: isHighlighted ? customization.textColor : 'transparent',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      transition: 'all 0.5s ease-in-out',
                      transform: isHighlighted ? 'scale(1.05)' : 'scale(1)',
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
          return (
            <div className="inline-flex flex-wrap gap-1">
              {currentGroup.map((word, index) => {
                const isKaraokeActive = index <= currentWordInGroup;
                
                return (
                  <div
                    key={`${animationKey}-group-${currentGroupIndex}-word-${index}`}
                    style={{
                      color: isKaraokeActive ? customization.textColor : (customization.fill || '#ffffff'),
                      backgroundColor: 'transparent',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      transition: 'color 0.5s ease-in-out',
                      transform: isKaraokeActive ? 'scale(1.05)' : 'scale(1)',
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
    
    if (customization.placementEffect === 'align') {
      const wordsToShow = currentGroup.slice(0, currentWordCount);
      return (
        <div className="flex justify-center items-center">
          <div className="inline-flex gap-2 justify-center text-center">
            {wordsToShow.map((word, index) => (
              <div
                key={`align-${currentGroupIndex}-${index}-${animationKey}`}
                style={getAnimationStyles()}
                className={`${getPreviewClasses()} animate-fade-in`}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
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
    
    const groupText = currentGroup.join(' ');
    const baseStyles = getAnimationStyles();
    
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
    <div className="min-h-screen bg-background relative overflow-hidden">
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Background Video */}
      <video
        src={BACKGROUND_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-background/50" />

      {/* Gradient overlays */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel (35%) - Options */}
        <div className="w-[35%] min-w-[380px] max-w-[480px] border-r border-border/30 p-6 overflow-y-auto bg-card/20 backdrop-blur-sm">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow hover:bg-primary/10 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar voz
          </Button>

          {/* Header with floating icon */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center cyber-glow mb-4 animate-float">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-center">
              Personalizar <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Subtítulos</span>
            </h1>
          </div>

          {/* Separator */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6" />

          {/* Options Sections */}
          <div className="space-y-5">
            {/* Font Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Tipo de Fuente</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {FONTS.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setCustomization(prev => ({ 
                      ...prev, 
                      fontFamily: font.name,
                      Tamañofuente: getFontWeight(font.name),
                      "Fixed size": getFixedSize(font.name)
                    }))}
                    className={`p-2 rounded-lg border text-left text-xs transition-all ${
                      customization.fontFamily === font.name
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 hover:border-primary/50 bg-card/30'
                    }`}
                  >
                    <div className={`${font.class} font-medium`}>
                      {font.preview}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Effects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Efectos de Subtítulos</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUBTITLE_EFFECTS.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setCustomization(prev => ({ ...prev, subtitleEffect: effect.id }))}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      customization.subtitleEffect === effect.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 hover:border-primary/50 bg-card/30'
                    }`}
                  >
                    <div className="font-medium text-xs">{effect.name}</div>
                    <div className="text-[10px] text-muted-foreground">{effect.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Placement Effects */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Efectos de Colocación</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PLACEMENT_EFFECTS.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setCustomization(prev => ({ ...prev, placementEffect: effect.id }))}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      customization.placementEffect === effect.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 hover:border-primary/50 bg-card/30'
                    }`}
                  >
                    <div className="font-medium text-xs">{effect.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Transform */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Transformación de Texto</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEXT_TRANSFORMS.map((transform) => (
                  <button
                    key={transform.id}
                    onClick={() => setCustomization(prev => ({ ...prev, textTransform: transform.id }))}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      customization.textTransform === transform.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 hover:border-primary/50 bg-card/30'
                    }`}
                  >
                    <div className="font-medium text-[10px]">{transform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    {customization.subtitleEffect === 'highlight' ? 'Fondo Nuevo Color' : 
                     customization.subtitleEffect === 'karaoke' ? 'Karaoke Nuevo Color' : 'Color de Fondo'}
                  </h3>
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
                    <span className="text-xs text-muted-foreground">
                      {customization.hasBackgroundColor ? 'On' : 'Off'}
                    </span>
                  </div>
                )}
              </div>
              
              {(customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke' || customization.hasBackgroundColor) ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-10 gap-1.5">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCustomization(prev => ({ ...prev, 
                          textColor: (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? color : prev.textColor,
                          backgroundColor: (customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? prev.backgroundColor : color
                        }))}
                        className={`w-6 h-6 rounded border transition-all ${
                          ((customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? customization.textColor : customization.backgroundColor) === color
                            ? 'border-primary scale-110 ring-2 ring-primary/50'
                            : 'border-border/30 hover:border-primary/50'
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
                    className="w-full h-6 rounded border border-border/30"
                  />
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground text-xs">
                  Activar para personalizar color de fondo
                </div>
              )}
            </div>

            {/* Text Color */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">
                  {(customization.subtitleEffect === 'highlight' || customization.subtitleEffect === 'karaoke') ? 'Letra Nueva Color' : 'Color de Letra'}
                </h3>
              </div>
              {customization.subtitleEffect !== 'highlight' && customization.subtitleEffect !== 'karaoke' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-10 gap-1.5">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCustomization(prev => ({ ...prev, textColor: color }))}
                        className={`w-6 h-6 rounded border transition-all ${
                          customization.textColor === color
                            ? 'border-primary scale-110 ring-2 ring-primary/50'
                            : 'border-border/30 hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={customization.textColor}
                    onChange={(e) => setCustomization(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-full h-6 rounded border border-border/30"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-10 gap-1.5">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        onClick={() => setCustomization(prev => ({ ...prev, fill: color }))}
                        className={`w-6 h-6 rounded border transition-all ${
                          customization.fill === color
                            ? 'border-primary scale-110 ring-2 ring-primary/50'
                            : 'border-border/30 hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={customization.fill || '#ffffff'}
                    onChange={(e) => setCustomization(prev => ({ ...prev, fill: e.target.value }))}
                    className="w-full h-6 rounded border border-border/30"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel (65%) - Preview */}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <div className="flex flex-col items-center">
            {/* Video Preview with Subtitles - Vertical 9:16 */}
            <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_40px_rgba(255,20,147,0.2)]" style={{ aspectRatio: '9/16', height: '70vh', maxHeight: '600px' }}>
              <video
                src={PREVIEW_VIDEO_URL}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
              {/* Subtitle Overlay - Center-lower position */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: '15%' }}>
                <div className="text-center px-4">
                  {renderWordByWord()}
                </div>
              </div>
            </div>

            {/* Configuration Chips */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Configuración actual:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="bg-card/50 border border-border/30">{customization.fontFamily}</Badge>
                <Badge variant="secondary" className="bg-card/50 border border-border/30">{customization.subtitleEffect}</Badge>
                <Badge variant="secondary" className="bg-card/50 border border-border/30">{customization.placementEffect}</Badge>
                <Badge variant="secondary" className="bg-card/50 border border-border/30">{customization.textTransform}</Badge>
              </div>
            </div>

            {/* Use this Design Button */}
            <Button
              onClick={handleContinue}
              className="w-full mt-8 h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg font-semibold cyber-glow"
            >
              Usar este Diseño
            </Button>
          </div>
        </div>
      </div>

      {/* Neural System Active Indicator */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 text-primary animate-pulse">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm font-medium tracking-wider">SISTEMA NEURAL ACTIVO</span>
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
};

export default SubtitleCustomizer;
