import React from 'react';
import { Settings, Key, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlotatoConfigMenuProps {
  onEditApiKey: () => void;
  onEditAccounts: () => void;
}

const BlotatoConfigMenu = ({ onEditApiKey, onEditAccounts }: BlotatoConfigMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="cyber-border hover:cyber-glow"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configuración
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border-border z-[60]">
        <DropdownMenuItem
          onClick={onEditApiKey}
          className="cursor-pointer hover:bg-muted/50"
        >
          <Key className="w-4 h-4 mr-2" />
          <span>Editar API Key de Blotato</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onEditAccounts}
          className="cursor-pointer hover:bg-muted/50"
        >
          <Link2 className="w-4 h-4 mr-2" />
          <span>Editar Cuentas Sociales</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BlotatoConfigMenu;
