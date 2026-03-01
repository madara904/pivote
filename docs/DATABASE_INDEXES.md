# Datenbank-Indexes – Supabase/PostgreSQL

## Bestehende Indexes prüfen

### 1. Im Supabase Dashboard (SQL Editor)

```sql
-- Alle Indexes in deiner Datenbank anzeigen
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 2. Kompaktere Übersicht

```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 3. Supabase CLI (unbenutzte Indexes finden)

```bash
npx supabase inspect db unused-indexes
```

### 4. Query Performance im Dashboard

- **Supabase Dashboard** → **Database** → **Query Performance**
- Zeigt langsame Queries und empfiehlt ggf. Indexes

---

## Hinzugefügte Indexes (Migration 0002)

| Tabelle | Index | Zweck |
|---------|-------|-------|
| **session** | `session_user_id_idx` | Session-Lookup pro Request |
| **account** | `account_user_id_idx` | Account-Lookup bei Auth |
| **verification** | `verification_identifier_idx` | Reset-Token Lookup |
| **twoFactor** | `twoFactor_user_id_idx` | 2FA-Lookup |
| **organization_member** | `organization_member_user_id_is_active_idx` | Membership-Check (Hot Path) |
| **organization_member** | `organization_member_organization_id_idx` | Mitgliederliste pro Org |
| **subscription** | `subscription_organization_id_idx` | Tier-Limits |
| **organization_connection** | `*_shipper_status_idx`, `*_forwarder_status_idx` | Connection-Listen + Limit-Checks |
| **inquiry** | `inquiry_shipper_org_*` | Shipper-Inquiry-Listen |
| **inquiry_forwarder** | `inquiry_forwarder_forwarder_*` | Forwarder-Inquiry-Listen |
| **quotation** | `quotation_forwarder_created_idx` | Tier-Limit-Count, Dashboard |
| **activity_event** | `activity_event_organization_created_idx` | Dashboard-Aktivität |
| **inquiry_document** | `inquiry_document_inquiry_id_idx` | Dokumente pro Inquiry |
| **inquiry_package** | `inquiry_package_inquiry_id_idx` | Pakete pro Inquiry |
| **inquiry_note** | `inquiry_note_inquiry_id_idx` | Notizen pro Inquiry |
| **charge_template** | `charge_template_organization_id_idx` | Charge-Templates |

---

## Migration anwenden

```bash
# Lokal (Supabase CLI)
npx supabase db push

# Oder: Migration manuell im SQL Editor ausführen
# Inhalt von supabase/migrations/0002_add_performance_indexes.sql kopieren
```

---

## Index-Strategie

- **Foreign Keys**: PostgreSQL erstellt **keine** Indexes auf FK-Spalten. Diese werden hier ergänzt.
- **Primary Keys / Unique**: Haben bereits automatisch einen Index.
- **WHERE + ORDER BY**: Composite-Indexes wie `(org_id, created_at DESC)` unterstützen typische Listen-Abfragen.
