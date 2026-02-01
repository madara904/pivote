"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import OrganizationCreateCard from "./organization/organization-create-card";
import OrganizationListCard from "./organization/organization-list-card";
import OrganizationEditDialog from "./organization/organization-edit-dialog";
import OrganizationLogoCard from "./organization/organization-logo-card";
import OrganizationMembersCard from "./organization/organization-members-card";

const orgSchema = z.object({
  name: z.string().min(2, "Name ist erforderlich"),
  email: z.string().email("Gültige Email ist erforderlich"),
  type: z.enum(["shipper", "forwarder"]),
  vatNumber: z.string().min(1, "USt-IdNr. ist erforderlich"),
});

export type OrgForm = z.infer<typeof orgSchema>;

export default function OrganizationCrudTest() {

  const utils = trpc.useUtils()
  // State
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [membersMessage, setMembersMessage] = useState<string | null>(null);
  const [membersMessageTone, setMembersMessageTone] = useState<"success" | "error">("success");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  // Queries & Mutations
  const orgsQuery = trpc.organization.getMyOrganizations.useQuery();
  const createOrg = trpc.organization.createOrganization.useMutation();
  const editOrg = trpc.organization.editOrganization.useMutation();
  const deleteOrg = trpc.organization.deleteOrganization.useMutation();
  const membersQuery = trpc.organization.listMembers.useQuery(
    { organizationId: selectedOrgId ?? "" },
    { enabled: !!selectedOrgId }
  );
  const addMember = trpc.organization.addMember.useMutation();
  const updateMemberRole = trpc.organization.updateMemberRole.useMutation();
  const removeMember = trpc.organization.removeMember.useMutation();

  // Get selected organization data
  const selectedOrg = orgsQuery.data?.find((o) => o.id === selectedOrgId);
  const selectedOrgIsOwner = selectedOrg?.membershipRole === "owner";

  // Auto-select organization if user has only one
  useEffect(() => {
    if (!selectedOrgId && orgsQuery.data && orgsQuery.data.length === 1) {
      setSelectedOrgId(orgsQuery.data[0].id);
    }
  }, [orgsQuery.data, selectedOrgId]);

  // Debug: Log selected org data
  useEffect(() => {
    if (selectedOrg) {
      console.log("Selected org:", selectedOrg);
      console.log("Logo URL:", selectedOrg.logo);
    }
  }, [selectedOrg]);

  // Forms
  const createForm = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: "", email: "", type: "shipper", vatNumber: "" },
  });
  const editForm = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: "", email: "", type: "shipper", vatNumber: "" },
  });

  // Set edit form values when org selected
  useEffect(() => {
    if (!editMode) return;
    const org = orgsQuery.data?.find((o) => o.id === selectedOrgId);
    if (org) {
      editForm.reset({
        name: org.name,
        email: org.email,
        type: org.type,
        vatNumber: org.vatNumber || "",
      });
    }
  }, [selectedOrgId, editMode, orgsQuery.data, editForm]);

  // Handlers
  const handleCreate = (data: OrgForm) => {
    setMessage(null);
    createOrg.mutate(data, {
      onSuccess: () => {
        setMessage("Organisation erstellt!");
        createForm.reset();
        orgsQuery.refetch();
      },
      onError: (err) => setMessage(err.message),
    });
  };

  const handleEdit = (data: OrgForm) => {
    if (!selectedOrgId) return;
    setMessage(null);
    editOrg.mutate(
      { organizationId: selectedOrgId, ...data },
      {
        onSuccess: () => {
          setMessage("Organisation bearbeitet!");
          setEditMode(false);
          utils.organization.getMyOrganizations.invalidate();
        },
        onError: (err) => setMessage(err.message),
      }
    );
  };

  const handleDelete = (id: string) => {
    setMessage(null);
    deleteOrg.mutate(
      { organizationId: id },
      {
        onSuccess: () => {
          setMessage("Organisation gelöscht!");
          if (selectedOrgId === id) setSelectedOrgId(null);
          utils.organization.getMyOrganizations.invalidate();
        },
        onError: (err) => setMessage(err.message),
      }
    );
  };

  const handleInviteMember = () => {
    if (!selectedOrgId) return;
    if (!inviteEmail.trim()) {
      setMembersMessage("Bitte eine E-Mail-Adresse eingeben.");
      setMembersMessageTone("error");
      return;
    }
    setMembersMessage(null);
    addMember.mutate(
      { organizationId: selectedOrgId, email: inviteEmail.trim(), role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setMembersMessage("Mitglied hinzugefügt!");
          setMembersMessageTone("success");
          membersQuery.refetch();
        },
        onError: (err) => {
          setMembersMessage(err.message);
          setMembersMessageTone("error");
        },
      }
    );
  };

  // Render
  return (
    <div className="w-full space-y-6">
      <OrganizationCreateCard
        form={createForm}
        onSubmit={handleCreate}
        isSubmitting={createOrg.isPending}
        hidden={!!selectedOrgId}
      />

      <OrganizationListCard
        organizations={orgsQuery.data}
        isLoading={orgsQuery.isLoading}
        errorMessage={orgsQuery.error?.message}
        deletePending={deleteOrg.isPending}
        onEdit={(orgId) => {
          setSelectedOrgId(orgId);
          setEditMode(true);
        }}
        onDelete={handleDelete}
        canEdit={(org) => org.membershipRole === "owner" || org.membershipRole === "admin"}
        canDelete={(org) => org.membershipRole === "owner" || org.membershipRole === "admin"}
      />

      <OrganizationEditDialog
        open={editMode && !!selectedOrgId}
        onOpenChange={(open) => {
          if (!open) setEditMode(false);
        }}
        form={editForm}
        onSubmit={handleEdit}
        isSubmitting={editOrg.isPending}
        canEdit={selectedOrgIsOwner}
      />

      {message && <div className="mt-4 text-green-600">{message}</div>}

      <OrganizationLogoCard
        selectedOrgId={selectedOrgId}
        selectedOrgName={selectedOrg?.name ?? null}
        selectedOrgLogo={selectedOrg?.logo ?? null}
        selectedOrgIsOwner={selectedOrgIsOwner}
        hasOrganizations={Boolean(orgsQuery.data && orgsQuery.data.length > 0)}
        onLogoUploaded={(url) => {
          if (!selectedOrgId) return;
          editOrg.mutate(
            { organizationId: selectedOrgId, logo: url },
            {
              onSuccess: () => {
                setMessage("Logo erfolgreich hochgeladen!");
                orgsQuery.refetch();
              },
              onError: (err) => {
                setMessage(`Fehler beim Speichern: ${err.message}`);
              },
            }
          );
        }}
        onLogoError={(messageText) => setMessage(messageText)}
      />

      {selectedOrgId && (
        <OrganizationMembersCard
          selectedOrgId={selectedOrgId}
          selectedOrgIsOwner={selectedOrgIsOwner}
          inviteEmail={inviteEmail}
          inviteRole={inviteRole}
          onInviteEmailChange={setInviteEmail}
          onInviteRoleChange={setInviteRole}
          onInvite={handleInviteMember}
          invitePending={addMember.isPending}
          members={membersQuery.data}
          membersLoading={membersQuery.isLoading}
          membersError={membersQuery.error?.message}
          onUpdateRole={(memberId, role) =>
            updateMemberRole.mutate(
              { organizationId: selectedOrgId, memberId, role },
              {
                onSuccess: () => {
                  setMembersMessage("Rolle aktualisiert.");
                  setMembersMessageTone("success");
                  membersQuery.refetch();
                },
                onError: (err) => {
                  setMembersMessage(err.message);
                  setMembersMessageTone("error");
                },
              }
            )
          }
          onRemoveMember={(memberId) =>
            removeMember.mutate(
              { organizationId: selectedOrgId, memberId },
              {
                onSuccess: () => {
                  setMembersMessage("Mitglied entfernt.");
                  setMembersMessageTone("success");
                  membersQuery.refetch();
                },
                onError: (err) => {
                  setMembersMessage(err.message);
                  setMembersMessageTone("error");
                },
              }
            )
          }
          updateRolePending={updateMemberRole.isPending}
          removePending={removeMember.isPending}
          message={membersMessage}
          messageTone={membersMessageTone}
        />
      )}
    </div>
  );
}
