
import React from 'react';

const TipsSection = () => {
  return (
    <div className="bg-card/50 cyber-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Consejos para mejores resultados:
      </h3>
      <div className="text-muted-foreground space-y-3 text-sm">
        <p>
          Solo pega tu enlace de noticia y si deseas puedes dar algunas indicaciones de cómo quieres el guion.
        </p>
        <blockquote className="border-l-2 border-primary/50 pl-4 italic bg-background/20 p-2 rounded-r-lg">
          <p className="font-semibold text-foreground/80 not-italic">Ejemplo:</p>
          <p>
            https://www.bluradio.com/economia/gobierno-se-opone-a-jornada-laboral-de-4x3-esto-se-ha-aprobado-hasta-ahora-so35?utm_source=BluRadio&utm_medium=WhatsApp hazme un guion de esta noticia y que al Final la gente comente la Palabra "DÓLAR" para recibir más información.
          </p>
        </blockquote>
      </div>
    </div>
  );
};

export default TipsSection;
