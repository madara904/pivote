"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing/uploadthing-utils";
import Image from "next/image";

const orgSchema = z.object({
  name: z.string().min(2, "Name ist erforderlich"),
  email: z.string().email("Gültige Email ist erforderlich"),
  type: z.enum(["shipper", "forwarder"]),
  vatNumber: z.string().min(1, "USt-IdNr. ist erforderlich"),
});

type OrgForm = z.infer<typeof orgSchema>;

export default function OrganizationCrudTest() {

  const utils = trpc.useUtils()
  // State
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Queries & Mutations
  const orgsQuery = trpc.organization.getMyOrganizations.useQuery();
  const createOrg = trpc.organization.createOrganization.useMutation();
  const editOrg = trpc.organization.editOrganization.useMutation();
  const deleteOrg = trpc.organization.deleteOrganization.useMutation();

  // Get selected organization data
  const selectedOrg = orgsQuery.data?.find((o) => o.id === selectedOrgId);

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

  // Render
  return (
    
    <div className="w-full space-y-10">
    {!selectedOrgId && <div>
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
      </div>}

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

      {/* LOGO SECTION - Always visible */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="font-semibold text-lg">Logo</h2>
          <p className="text-sm text-muted-foreground">
            {selectedOrg ? `Laden Sie ein Logo für ${selectedOrg.name} hoch oder ändern Sie das bestehende Logo.` : "Laden Sie ein Logo für Ihre Organisation hoch."}
          </p>
        </div>
        
        {/* Display logo section when organization is selected */}
        {selectedOrgId && selectedOrg ? (
          selectedOrg.logo ? (
            <div className="flex items-start gap-6">
              <div className="relative w-48 h-48 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Image
                  src={selectedOrg.logo}
                  alt={`${selectedOrg.name} Logo`}
                  fill
                  className="object-contain p-4"
                  unoptimized
                  onError={(e) => {
                    console.error("Image load error:", e);
                  }}
                />
              </div>
              <div className="flex">
                <UploadButton 
                  endpoint="organizationLogo"
                  className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium ut-button:transition-colors ut-allowed-content:text-muted-foreground ut-allowed-content:text-xs"
                  appearance={{
                    button: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    allowedContent: "text-xs text-muted-foreground mt-1",
                    container: "w-full",
                  }}
                  content={{
                    button: ({ ready, isUploading }) => {
                      if (isUploading) return "Wird hochgeladen...";
                      if (!ready) return "Vorbereitung...";
                      return "Logo ändern";
                    },
                    allowedContent: ({ ready }) => {
                      if (!ready) return "Bereite vor...";
                      return "Max. 2MB • PNG, JPG, GIF";
                    },
                  }}
                  headers={{
                    "x-organization-id": selectedOrgId,
                  }}
                  onClientUploadComplete={(res) => {
                    console.log("Upload complete response:", res);
                    if (res && res[0]?.url) {
                      console.log("Logo URL from upload:", res[0].url);
                      console.log("Updating organization:", selectedOrgId);
                      // Update organization with logo URL
                      editOrg.mutate(
                        {
                          organizationId: selectedOrgId,
                          logo: res[0].url,
                        },
                        {
                          onSuccess: (data) => {
                            console.log("Logo saved successfully:", data);
                            setMessage("Logo erfolgreich hochgeladen!");
                            orgsQuery.refetch();
                          },
                          onError: (err) => {
                            console.error("Error saving logo:", err);
                            setMessage(`Fehler beim Speichern: ${err.message}`);
                          },
                        }
                      );
                    } else {
                      console.error("Invalid upload response:", res);
                      setMessage("Fehler: Ungültige Antwort vom Upload-Server");
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setMessage(`Fehler beim Hochladen: ${error.message}`);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <UploadButton 
                endpoint="organizationLogo"
                className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:px-4 ut-button:py-2 ut-button:font-medium ut-button:transition-colors ut-allowed-content:text-muted-foreground ut-allowed-content:text-xs"
                appearance={{
                  button: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  allowedContent: "text-xs text-muted-foreground mt-1",
                  container: "w-full",
                }}
                content={{
                  button: ({ ready, isUploading }) => {
                    if (isUploading) return "Wird hochgeladen...";
                    if (!ready) return "Vorbereitung...";
                    return "Logo hochladen";
                  },
                  allowedContent: ({ ready }) => {
                    if (!ready) return "Bereite vor...";
                    return "Max. 2MB • PNG, JPG, GIF";
                  },
                }}
                headers={{
                  "x-organization-id": selectedOrgId,
                }}
                onClientUploadComplete={(res) => {
                  console.log("Upload complete response:", res);
                  if (res && res[0]?.url) {
                    console.log("Logo URL from upload:", res[0].url);
                    console.log("Updating organization:", selectedOrgId);
                    // Update organization with logo URL
                    editOrg.mutate(
                      {
                        organizationId: selectedOrgId,
                        logo: res[0].url,
                      },
                      {
                        onSuccess: (data) => {
                          console.log("Logo saved successfully:", data);
                          setMessage("Logo erfolgreich hochgeladen!");
                          orgsQuery.refetch();
                        },
                        onError: (err) => {
                          console.error("Error saving logo:", err);
                          setMessage(`Fehler beim Speichern: ${err.message}`);
                        },
                      }
                    );
                  } else {
                    console.error("Invalid upload response:", res);
                    setMessage("Fehler: Ungültige Antwort vom Upload-Server");
                  }
                }}
                onUploadError={(error: Error) => {
                  setMessage(`Fehler beim Hochladen: ${error.message}`);
                }}
              />
            </div>
          )
        ) : orgsQuery.data && orgsQuery.data.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Erstellen Sie zuerst eine Organisation, um ein Logo hochzuladen.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Lade Organisationen...
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
