import { useState } from 'react';
import { Users, UserPlus, X, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useProjectMembers, ProjectInvitation } from '@/hooks/useProjectMembers';
import { useAuth } from '@/hooks/useAuth';
import { Project, ProjectMember } from '@/types';
import { cn } from '@/lib/utils';

interface ShareProjectDialogProps {
  project?: Project;
  projectId?: string;
  children?: React.ReactNode;
}

export function ShareProjectDialog({ project, projectId, children }: ShareProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  
  const { user } = useAuth();
  const actualProjectId = project?.id || projectId;
  const { members, pendingInvitations, addMember, updateMemberRole, removeMember, cancelInvitation } = useProjectMembers(actualProjectId);
  
  const isOwner = project ? user?.id === project.user_id : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    addMember.mutate({ email: email.trim(), role });
    setEmail('');
    setRole('viewer');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
            <Users className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">Share Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Add member form */}
          {isOwner && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono text-sm">Invite by email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="flex-1"
                  />
                  <Select value={role} onValueChange={(v) => setRole(v as 'viewer' | 'editor' | 'admin')}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={addMember.isPending} className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                {addMember.isPending ? 'Inviting...' : 'Invite'}
              </Button>
            </form>
          )}
          
          {/* Members list */}
          <div className="space-y-3">
            <Label className="font-mono text-sm">Members</Label>
            
            {/* Owner */}
            <div className="flex items-center justify-between p-3 border-2 border-foreground bg-muted">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 border-2 border-foreground bg-accent flex items-center justify-center">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-mono text-sm font-bold">Owner</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {isOwner ? 'You' : 'Project owner'}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs bg-primary text-primary-foreground px-2 py-1 border-2 border-foreground">
                Owner
              </span>
            </div>
            
            {/* Other members */}
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                isOwner={isOwner}
                onUpdateRole={(role) => updateMemberRole.mutate({ memberId: member.id, role })}
                onRemove={() => removeMember.mutate(member.id)}
              />
            ))}
            
            {/* Pending invitations */}
            {pendingInvitations.map((invitation) => (
              <PendingInvitationRow
                key={invitation.id}
                invitation={invitation}
                isOwner={isOwner}
                onCancel={() => cancelInvitation.mutate(invitation.id)}
              />
            ))}
            
            {members.length === 0 && pendingInvitations.length === 0 && (
              <p className="font-mono text-sm text-muted-foreground text-center py-4">
                No members yet. Invite someone to collaborate!
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MemberRowProps {
  member: ProjectMember;
  isOwner: boolean;
  onUpdateRole: (role: 'viewer' | 'editor' | 'admin') => void;
  onRemove: () => void;
}

function MemberRow({ member, isOwner, onUpdateRole, onRemove }: MemberRowProps) {
  const roleColors = {
    viewer: 'bg-muted text-muted-foreground',
    editor: 'bg-accent text-accent-foreground',
    admin: 'bg-primary text-primary-foreground',
  };

  return (
    <div className="flex items-center justify-between p-3 border-2 border-foreground hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 border-2 border-foreground bg-background flex items-center justify-center font-mono font-bold text-sm">
          {member.profile?.full_name?.[0] || member.profile?.email?.[0] || '?'}
        </div>
        <div>
          <p className="font-mono text-sm font-medium">
            {member.profile?.full_name || 'Unknown'}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {member.profile?.email || 'No email'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isOwner ? (
          <>
            <Select value={member.role} onValueChange={(v) => onUpdateRole(v as 'viewer' | 'editor' | 'admin')}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <span className={cn(
            'font-mono text-xs px-2 py-1 border-2 border-foreground',
            roleColors[member.role]
          )}>
            {member.role}
          </span>
        )}
      </div>
    </div>
  );
}

interface PendingInvitationRowProps {
  invitation: ProjectInvitation;
  isOwner: boolean;
  onCancel: () => void;
}

function PendingInvitationRow({ invitation, isOwner, onCancel }: PendingInvitationRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border-2 border-dashed border-muted-foreground hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 border-2 border-dashed border-muted-foreground bg-background flex items-center justify-center">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-mono text-sm text-muted-foreground">
            {invitation.email}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Pending • {invitation.role}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs bg-muted text-muted-foreground px-2 py-1 border-2 border-dashed border-muted-foreground">
          Pending
        </span>
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
