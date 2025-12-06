import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useTasks(projectId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id, projectId],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, project:projects(*)')
        .order('created_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const parentTasks = (data as Task[]).filter(t => !t.parent_id);
      const subtasks = (data as Task[]).filter(t => t.parent_id);
      
      return parentTasks.map(task => ({
        ...task,
        subtasks: subtasks.filter(st => st.parent_id === task.id),
      }));
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (task: { title: string; description?: string | null; priority?: string; project_id?: string | null; parent_id?: string | null; due_date?: string | null }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'created',
        entity_type: 'task',
        entity_id: data.id,
        entity_name: data.title,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Task created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create task', description: error.message, variant: 'destructive' });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; title?: string; priority?: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.status) {
        updateData.completed_at = null;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: updates.status === 'completed' ? 'completed' : 'updated',
        entity_type: 'task',
        entity_id: data.id,
        entity_name: data.title,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update task', description: error.message, variant: 'destructive' });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Task deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete task', description: error.message, variant: 'destructive' });
    },
  });

  return { tasks, isLoading, createTask, updateTask, deleteTask };
}