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
  vatNumber: z
    .string()
    .min(1, "USt-IdNr. ist erforderlich")
    .regex(/^DE[0-9]{9}$/, "Format: DE + 9 Ziffern (z. B. DE123456789)"),
  registrationNumber: z
    .string()
    .optional()
    .refine(
      (value) => !value || /^HRB[0-9]+$/.test(value),
      "Format: HRB + Ziffern (z. B. HRB12345)"
    ),
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
  const selectedOrgRole = selectedOrg?.membershipRole;
  const selectedOrgIsOwner = selectedOrgRole === "owner";
  const selectedOrgCanManageLogo =
    selectedOrgRole === "owner" || selectedOrgRole === "admin";


  useEffect(() => {
    if (!selectedOrgId && orgsData && orgsData.length === 1) {
      setSelectedOrgId(orgsData[0].id);
    }
  }, [orgsData, selectedOrgId]);


  const createForm = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      type: "forwarder",
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
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      type: "forwarder",
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
    const trimmed = inviteEmail.trim();
    if (!trimmed) {
      toast.error("Bitte eine E-Mail-Adresse eingeben.");
      return;
    }
    const emailSchema = z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
    const parsed = emailSchema.safeParse(trimmed);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }
    addMember.mutate(
      { organizationId: selectedOrgId, email: trimmed, role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
        },
      }
    );
  };

  return (
    <div className="w-full space-y-4">
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
        selectedOrgId={selectedOrgId}
        onSelect={setSelectedOrgId}
        deletePending={deleteOrganization.isPending}
        onEdit={(orgId) => {
          setSelectedOrgId(orgId);
          setEditMode(true);
        }}
        onDelete={handleDelete}
        canEdit={(org) => org.membershipRole === "owner"}
        canDelete={(org) => org.membershipRole === "owner"}
      />

      {!selectedOrgId ? (
        <div className="py-8 border border-dashed border-border/80 bg-muted/20 flex items-center justify-center min-h-[120px]">
          <p className="text-[12px] text-muted-foreground">
            Wählen Sie eine Organisation aus, um Logo und Team zu verwalten.
          </p>
        </div>
      ) : (
        <>
          <OrganizationLogoCard
            selectedOrgId={selectedOrgId}
            selectedOrgLogo={selectedOrg?.logo ?? null}
            selectedOrgCanManage={selectedOrgCanManageLogo}
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
            onLogoReset={(url) => {
              if (!selectedOrgId) return;
              editOrganization.mutate(
                { organizationId: selectedOrgId, logo: url ?? undefined },
                {
                  onSuccess: () => {
                    toast.success("Logo wurde zurückgesetzt.");
                  },
                }
              );
            }}
            onLogoError={(messageText) => toast.error(messageText)}
          />

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
            removePending={removeMember.isPending}
          />
        </>
      )}

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
    </div>
  );
}
