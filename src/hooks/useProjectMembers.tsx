import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectMember } from '@/types';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useProjectMembers(projectId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['project_members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select('*, profile:profiles(*)')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ProjectMember[];
    },
    enabled: !!user && !!projectId,
  });

  const addMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'viewer' | 'editor' | 'admin' }) => {
      // First find the user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (profileError) throw profileError;
      if (!profile) throw new Error('User not found with that email');
      
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId!)
        .eq('user_id', profile.id)
        .maybeSingle();
      
      if (existingMember) throw new Error('User is already a member of this project');
      
      const { data, error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId!,
          user_id: profile.id,
          role,
          invited_by: user!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'shared',
        entity_type: 'project',
        entity_id: projectId,
        entity_name: email,
        metadata: { role },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Member added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add member', description: error.message, variant: 'destructive' });
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'viewer' | 'editor' | 'admin' }) => {
      const { data, error } = await supabase
        .from('project_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_members', projectId] });
      toast({ title: 'Role updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update role', description: error.message, variant: 'destructive' });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      toast({ title: 'Member removed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove member', description: error.message, variant: 'destructive' });
    },
  });

  return {
    members,
    isLoading,
    addMember,
    updateMemberRole,
    removeMember,
  };
}
