"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOrganizationActions } from "@/hooks/use-organization-actions";
import OrganizationCreateCard from "./organization-create-card";
import OrganizationListCard from "./organization-list-card";
import OrganizationEditDialog from "./organization-edit-dialog";
import OrganizationLogoCard from "./organization-logo-card";
import OrganizationMembersCard from "./organization-members-card";
import type { OrganizationGetMyOrganizations } from "@/types/trpc-inferred";

const orgSchema = z.object({
  name: z.string().min(2, "Name ist erforderlich"),
  email: z.string().email("Gültige Email ist erforderlich"),
  type: z.enum(["shipper", "forwarder"]),
  description: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  vatNumber: z.string().min(1, "USt-IdNr. ist erforderlich"),
  registrationNumber: z.string().optional(),
});

export type OrgForm = z.infer<typeof orgSchema>;

export default function OrganizationCrudTest() {
  const trpcOptions = useTRPC();
  

  const {
    createOrganization,
    editOrganization,
    deleteOrganization,
    addMember,
    updateMemberRole,
    removeMember,
  } = useOrganizationActions();

    
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");

  
  const { data: orgsData } = useSuspenseQuery(trpcOptions.organization.getMyOrganizations.queryOptions()) as { data: OrganizationGetMyOrganizations };
  const membersQuery = useQuery({
    ...trpcOptions.organization.listMembers.queryOptions({ organizationId: selectedOrgId ?? "" }),
    enabled: !!selectedOrgId,
  });

  
  const selectedOrg = orgsData?.find((o) => o.id === selectedOrgId);
  const selectedOrgIsOwner = selectedOrg?.membershipRole === "owner";


  useEffect(() => {
    if (!selectedOrgId && orgsData && orgsData.length === 1) {
      setSelectedOrgId(orgsData[0].id);
    }
  }, [orgsData, selectedOrgId]);


  const createForm = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      email: "",
      type: "shipper",
      description: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      vatNumber: "",
      registrationNumber: "",
    },
  });
  const editForm = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: "",
      email: "",
      type: "shipper",
      description: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      vatNumber: "",
      registrationNumber: "",
    },
  });

  useEffect(() => {
    if (!editMode) return;
    const org = orgsData?.find((o) => o.id === selectedOrgId);
    if (org) {
      editForm.reset({
        name: org.name,
        email: org.email,
        type: org.type,
        description: org.description || "",
        phone: org.phone || "",
        website: org.website || "",
        address: org.address || "",
        city: org.city || "",
        postalCode: org.postalCode || "",
        country: org.country || "",
        vatNumber: org.vatNumber || "",
        registrationNumber: org.registrationNumber || "",
      });
    }
  }, [selectedOrgId, editMode, orgsData, editForm]);

  const handleCreate = (data: OrgForm) => {
    createOrganization.mutate(data, {
      onSuccess: () => {
        createForm.reset();
      },
    });
  };

  const handleEdit = (data: OrgForm) => {
    if (!selectedOrgId) return;
    editOrganization.mutate(
      { organizationId: selectedOrgId, ...data },
      {
        onSuccess: () => {
          setEditMode(false);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteOrganization.mutate(
      { organizationId: id },
      {
        onSuccess: () => {
          if (selectedOrgId === id) setSelectedOrgId(null);
        },
      }
    );
  };

  const handleInviteMember = () => {
    if (!selectedOrgId) return;
    if (!inviteEmail.trim()) {
      toast.error("Bitte eine E-Mail-Adresse eingeben.");
      return;
    }
    addMember.mutate(
      { organizationId: selectedOrgId, email: inviteEmail.trim(), role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
        },
      }
    );
  };

  return (
    <div className="w-full space-y-6">
      <OrganizationCreateCard
        form={createForm}
        onSubmit={handleCreate}
        isSubmitting={createOrganization.isPending}
        hidden={!!selectedOrgId}
      />

      <OrganizationListCard
        organizations={orgsData}
        isLoading={false}
        errorMessage={undefined}
        deletePending={deleteOrganization.isPending}
        onEdit={(orgId) => {
          setSelectedOrgId(orgId);
          setEditMode(true);
        }}
        onDelete={handleDelete}
        canEdit={(org) => org.membershipRole === "owner"}
        canDelete={(org) => org.membershipRole === "owner"}
      />

      <OrganizationEditDialog
        open={editMode && !!selectedOrgId}
        onOpenChange={(open) => {
          if (!open) setEditMode(false);
        }}
        form={editForm}
        onSubmit={handleEdit}
        isSubmitting={editOrganization.isPending}
        canEdit={selectedOrgIsOwner}
      />

      <OrganizationLogoCard
        selectedOrgId={selectedOrgId}
        selectedOrgLogo={selectedOrg?.logo ?? null}
        selectedOrgIsOwner={selectedOrgIsOwner}
        onLogoUploaded={(url) => {
          if (!selectedOrgId) return;
          editOrganization.mutate(
            { organizationId: selectedOrgId, logo: url },
            {
              onSuccess: () => {
                toast.success("Logo erfolgreich hochgeladen!");
              },
            }
          );
        }}
        onLogoError={(messageText) => toast.error(messageText)}
      />

      {selectedOrgId && (
        <OrganizationMembersCard
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
          onUpdateRole={(memberId: string, role: "admin" | "member") =>
            updateMemberRole.mutate(
              { organizationId: selectedOrgId, memberId, role }
            )
          }
          onRemoveMember={(memberId: string) =>
            removeMember.mutate(
              { organizationId: selectedOrgId, memberId }
            )
          }
          updateRolePending={updateMemberRole.isPending}
          removePending={removeMember.isPending}
          message={null}
          messageTone="success"
        />
      )}
    </div>
  );
}
