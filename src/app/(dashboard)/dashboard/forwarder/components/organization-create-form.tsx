"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const orgSchema = z.object({
  name: z.string().min(2, "Name ist erforderlich"),
  email: z.string().email("Gültige Email ist erforderlich"),
  type: z.enum(["shipper", "forwarder"]),
  vatNumber: z.string().min(1, "USt-IdNr. ist erforderlich"),
});

type OrgForm = z.infer<typeof orgSchema>;

export default function OrganizationCrudTest() {
  // State
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Queries & Mutations
  const orgsQuery = trpc.organization.getMyOrganizations.useQuery();
  const createOrg = trpc.organization.createOrganization.useMutation();
  const editOrg = trpc.organization.editOrganization.useMutation();
  const deleteOrg = trpc.organization.deleteOrganization.useMutation();

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
          orgsQuery.refetch();
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
          orgsQuery.refetch();
        },
        onError: (err) => setMessage(err.message),
      }
    );
  };

  // Render
  return (
    <div className="max-w-lg mx-auto space-y-10">
      {/* CREATE */}
      <div>
        <h2 className="font-bold mb-2">Organisation erstellen</h2>
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-2">
          <Input placeholder="Name" {...createForm.register("name")}/>
          <Input placeholder="Email" {...createForm.register("email")}/>
          <Input placeholder="USt-IdNr." {...createForm.register("vatNumber")}/>
          <select {...createForm.register("type")}
            className="input w-full border rounded px-2 py-1">
            <option value="shipper">Shipper</option>
            <option value="forwarder">Forwarder</option>
          </select>
          <Button type="submit" disabled={createOrg.isPending}>
            {createOrg.isPending ? "Erstellen..." : "Organisation erstellen"}
          </Button>
        </form>
      </div>

      {/* LIST */}
      <div>
        <h2 className="font-bold mb-2">Organisationen</h2>
        {orgsQuery.isLoading ? (
          <div>Lade...</div>
        ) : orgsQuery.error ? (
          <div className="text-red-600">Fehler: {orgsQuery.error.message}</div>
        ) : orgsQuery.data && orgsQuery.data.length > 0 ? (
          <ul className="space-y-2">
            {orgsQuery.data.map((org) => (
              <li key={org.id} className="border rounded p-2 flex items-center justify-between">
                <span>
                  <b>{org.name}</b> <span className="text-xs text-gray-500">({org.type})</span>
                  <br/>
                  <span className="text-xs">{org.email}</span>
                </span>
                <span className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedOrgId(org.id); setEditMode(true); }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(org.id)} disabled={deleteOrg.isPending}>Delete</Button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div>Keine Organisationen gefunden.</div>
        )}
      </div>

      {/* EDIT */}
      {editMode && selectedOrgId && (
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="font-bold mb-2">Organisation bearbeiten</h2>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-2">
            <Input placeholder="Name" {...editForm.register("name")}/>
            <Input placeholder="Email" {...editForm.register("email")}/>
            <Input placeholder="USt-IdNr." {...editForm.register("vatNumber")}/>
            <select {...editForm.register("type")}
              className="input w-full border rounded px-2 py-1">
              <option value="shipper">Shipper</option>
              <option value="forwarder">Forwarder</option>
            </select>
            <Button type="submit" disabled={editOrg.isPending}>
              {editOrg.isPending ? "Bearbeite..." : "Speichern"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Abbrechen</Button>
          </form>
        </div>
      )}

      {/* MESSAGE */}
      {message && <div className="mt-4 text-green-600">{message}</div>}
    </div>
  );
}
