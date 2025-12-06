import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useProjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (project: { name: string; description?: string | null; budget?: number }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'created',
        entity_type: 'project',
        entity_id: data.id,
        entity_name: data.name,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Project created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create project', description: error.message, variant: 'destructive' });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'updated',
        entity_type: 'project',
        entity_id: data.id,
        entity_name: data.name,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Project updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update project', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Project deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete project', description: error.message, variant: 'destructive' });
    },
  });

  return { projects, isLoading, createProject, updateProject, deleteProject };
}