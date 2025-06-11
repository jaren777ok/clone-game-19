
import React from 'react';
import { Plus, MessageSquare, User } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Chat } from "@/pages/NeurocopyChat";

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChat,
  onChatSelect,
  onNewChat
}) => {
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center cyber-glow">
            <MessageSquare className="w-4 h-4 text-background" />
          </div>
          <span className="font-bold text-foreground">NeuroCopy GPT</span>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full cyber-border bg-card hover:cyber-glow-intense transition-all duration-300"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton
                onClick={() => onChatSelect(chat.id)}
                isActive={activeChat === chat.id}
                className="w-full justify-start text-left p-3 rounded-lg hover:bg-accent/10 transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4 mr-3 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chat.messages.length} mensajes
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-card/50 cyber-border">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">Usuario</div>
            <div className="text-xs text-muted-foreground">Copywriter Pro</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
