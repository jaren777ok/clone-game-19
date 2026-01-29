
import React from 'react';
import { Plus } from 'lucide-react';
import { HeyGenApiKey } from '@/types/videoFlow';
import ApiKeyCard from './ApiKeyCard';

interface Props {
  apiKeys: HeyGenApiKey[];
  onSelectApiKey: (apiKey: HeyGenApiKey) => void;
  onDeleteApiKey: (keyId: string) => void;
  onShowAddForm: () => void;
}

const ApiKeyList: React.FC<Props> = ({ 
  apiKeys, 
  onSelectApiKey, 
  onDeleteApiKey, 
  onShowAddForm 
}) => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h2 className="text-lg sm:text-xl font-semibold text-foreground">
        Tus Conexiones API Activas:
      </h2>

      {/* API Keys Cards */}
      <div className="space-y-4">
        {apiKeys.map((apiKey, index) => (
          <ApiKeyCard
            key={apiKey.id}
            apiKey={apiKey}
            index={index}
            onSelect={onSelectApiKey}
            onDelete={onDeleteApiKey}
          />
        ))}
      </div>

      {/* Add New Key Button Card */}
      <button
        onClick={onShowAddForm}
        className="
          w-full p-5 sm:p-6 rounded-xl
          border-2 border-dashed border-muted-foreground/30
          hover:border-primary/50
          hover:shadow-[0_0_30px_rgba(255,20,147,0.2)]
          hover:bg-primary/5
          transition-all duration-300
          flex items-center justify-center gap-3 sm:gap-4
          group
        "
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-background" />
        </div>
        <span className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
          Agregar nueva clave API
        </span>
      </button>
    </div>
  );
};

export default ApiKeyList;
