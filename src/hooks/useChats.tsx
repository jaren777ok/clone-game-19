import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Chat, Message } from '@/pages/NeurocopyChat';

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Cargar chats del usuario desde Supabase
  const loadChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const chatsWithMessages = await Promise.all(
        chatsData.map(async (chat) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('timestamp', { ascending: true });

          if (messagesError) throw messagesError;

          const messages: Message[] = messagesData.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role as 'user' | 'assistant',
            timestamp: new Date(msg.timestamp),
            images: msg.images && Array.isArray(msg.images) && msg.images.length > 0 
              ? msg.images.filter((img): img is string => typeof img === 'string')
              : undefined
          }));

          return {
            id: chat.id,
            title: chat.title,
            messages,
            createdAt: new Date(chat.created_at),
            updatedAt: new Date(chat.updated_at)
          };
        })
      );

      setChats(chatsWithMessages);
    } catch (error: any) {
      console.error('Error loading chats:', error);
      toast({
        title: "Error al cargar chats",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Guardar nuevo chat en Supabase
  const saveChat = async (chat: Chat) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chats')
        .insert({
          id: chat.id,
          user_id: user.id,
          title: chat.title,
          created_at: chat.createdAt.toISOString(),
          updated_at: chat.updatedAt.toISOString()
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving chat:', error);
      toast({
        title: "Error al guardar chat",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateChat = async (chatId: string, updates: Partial<Chat>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.updatedAt) updateData.updated_at = updates.updatedAt.toISOString();

      const { error } = await supabase
        .from('chats')
        .update(updateData)
        .eq('id', chatId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating chat:', error);
      toast({
        title: "Error al actualizar chat",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error al eliminar chat",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Guardar mensaje en Supabase (actualizado para incluir imágenes)
  const saveMessage = async (chatId: string, message: Message) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: message.id,
          chat_id: chatId,
          content: message.content,
          role: message.role,
          timestamp: message.timestamp.toISOString(),
          images: message.images || []
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving message:', error);
      toast({
        title: "Error al guardar mensaje",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Cargar chats al iniciar sesión
  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      setChats([]);
      setLoading(false);
    }
  }, [user]);

  return {
    chats,
    loading,
    setChats,
    loadChats,
    saveChat,
    updateChat,
    deleteChat,
    saveMessage
  };
};
