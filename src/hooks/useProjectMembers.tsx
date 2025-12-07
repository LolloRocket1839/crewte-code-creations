import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectMember } from '@/types';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  invited_by: string;
  created_at: string;
}

export function useProjectMembers(projectId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['project_members', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          id,
          project_id,
          user_id,
          role,
          invited_by,
          created_at,
          profile:profiles!project_members_user_id_fkey (
            id,
            email,
            full_name,
            created_at,
            updated_at
          )
        `)
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as unknown as ProjectMember[];
    },
    enabled: !!user && !!projectId,
  });

  // Fetch pending invitations
  const { data: pendingInvitations = [], isLoading: isLoadingInvitations } = useQuery({
    queryKey: ['project_invitations', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ProjectInvitation[];
    },
    enabled: !!user && !!projectId,
  });

  const addMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'viewer' | 'editor' | 'admin' }) => {
      // First check if already invited
      const { data: existingInvite } = await supabase
        .from('project_invitations')
        .select('id')
        .eq('project_id', projectId!)
        .ilike('email', email)
        .maybeSingle();
      
      if (existingInvite) throw new Error('This email has already been invited');

      // Try to find the user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .maybeSingle();
      
      if (profileError) throw profileError;
      
      // If user exists, add directly as member
      if (profile) {
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
        
        return { type: 'member', data };
      }
      
      // User doesn't exist, create a pending invitation
      const { data, error } = await supabase
        .from('project_invitations')
        .insert({
          project_id: projectId!,
          email: email.toLowerCase(),
          role,
          invited_by: user!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await supabase.from('activity_log').insert({
        user_id: user!.id,
        action: 'invited',
        entity_type: 'project',
        entity_id: projectId,
        entity_name: email,
        metadata: { role, pending: true },
      });
      
      return { type: 'invitation', data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['project_members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project_invitations', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      
      if (result.type === 'member') {
        toast({ title: 'Member added successfully' });
      } else {
        toast({ 
          title: 'Invitation sent', 
          description: 'They will be added when they sign up' 
        });
      }
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

  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('project_invitations')
        .delete()
        .eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_invitations', projectId] });
      toast({ title: 'Invitation cancelled' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to cancel invitation', description: error.message, variant: 'destructive' });
    },
  });

  return {
    members,
    pendingInvitations,
    isLoading: isLoading || isLoadingInvitations,
    addMember,
    updateMemberRole,
    removeMember,
    cancelInvitation,
  };
}
