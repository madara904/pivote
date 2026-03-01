export type ActivityFeedItem = {
  id: string;
  type: string;
  createdAt: Date;
  payload: Record<string, unknown> | null;
  actorName: string | null;
};

export type ActivityEntry = {
  id: string;
  time: string;
  message: string;
  detailPrimary?: string;
  detailSecondary?: string;
};

const serviceTypeLabels: Record<string, string> = {
  air_freight: "Air",
  sea_freight: "Sea",
  road_freight: "Road",
  rail_freight: "Rail",
};

function formatRelativeTime(date: Date, nowMs: number) {
  const diffMs = nowMs - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Gerade eben";
  if (diffMinutes < 60) return `Vor ${diffMinutes} Min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Vor ${diffHours} Std`;

  const diffDays = Math.floor(diffHours / 24);
  return `Vor ${diffDays} Tg`;
}

export function formatCurrency(value: unknown, currency: string | undefined) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
    minimumFractionDigits: 2, // Cent-Beträge immer anzeigen
    maximumFractionDigits: 2,
  }).format(amount);
}

type ActivityContext = {
  referenceNumber?: string;
  shipperOrgName?: string;
  serviceType?: string;
  originCity?: string;
  destinationCity?: string;
  priceLabel: string | null;
  actorName: string;
};

const activityConfig: Record<
  string,
  (context: ActivityContext) => Omit<ActivityEntry, "id" | "time">
> = {
  "inquiry.received": ({ referenceNumber, shipperOrgName, serviceType }) => ({
    message: `Neue Anfrage${referenceNumber ? ` #${referenceNumber}` : ""} erhalten`,
    detailPrimary: shipperOrgName || "Versender",
    detailSecondary: serviceTypeLabels[serviceType ?? ""] || "Anfrage",
  }),
  "quotation.submitted": ({ referenceNumber, shipperOrgName, priceLabel, actorName }) => ({
    message: `${actorName} hat ein Angebot${referenceNumber ? ` #${referenceNumber}` : ""} eingereicht`,
    detailPrimary: priceLabel || "Angebot",
    detailSecondary: shipperOrgName ? "Versender" : "Angebot",
  }),
  "quotation.accepted": ({ referenceNumber, shipperOrgName }) => ({
    message: `Angebot${referenceNumber ? ` #${referenceNumber}` : ""} angenommen`,
    detailPrimary: shipperOrgName || "Versender",
    detailSecondary: "Akzeptiert",
  }),
  "quotation.rejected": ({ referenceNumber, shipperOrgName }) => ({
    message: `Angebot${referenceNumber ? ` #${referenceNumber}` : ""} abgelehnt`,
    detailPrimary: shipperOrgName || "Versender",
    detailSecondary: "Abgelehnt",
  }),
  "connection.requested": ({ shipperOrgName, actorName }) => ({
    message: `Verbindungsanfrage von ${shipperOrgName || "Versender"}`,
    detailPrimary: shipperOrgName || "Versender",
    detailSecondary: actorName,
  }),
  "connection.accepted": ({ shipperOrgName, actorName }) => ({
    message: `Verbindung mit ${shipperOrgName || "Versender"} angenommen`,
    detailPrimary: shipperOrgName || "Versender",
    detailSecondary: actorName,
  }),
  "connection.removed": ({ shipperOrgName, actorName }) => ({
    message: `Verbindung mit ${shipperOrgName || "Versender"} entfernt`,
    detailPrimary: shipperOrgName || "Versender",
    detailSecondary: actorName,
  }),
};

export function buildActivityEntry(item: ActivityFeedItem, nowMs = Date.now()): ActivityEntry {
  const payload = (item.payload ?? {}) as Record<string, unknown>;
  const referenceNumber = payload.referenceNumber as string | undefined;
  const shipperOrgName = payload.shipperOrgName as string | undefined;
  const serviceType = payload.serviceType as string | undefined;
  const originCity = payload.originCity as string | undefined;
  const destinationCity = payload.destinationCity as string | undefined;
  const currency = payload.currency as string | undefined;
  const priceLabel = formatCurrency(payload.totalPrice, currency);
  const actorName = item.actorName ?? "Jemand";
  const config = activityConfig[item.type];

  if (config) {
    return {
      id: item.id,
      time: formatRelativeTime(item.createdAt, nowMs),
      ...config({
        referenceNumber,
        shipperOrgName,
        serviceType,
        originCity,
        destinationCity,
        priceLabel,
        actorName,
      }),
    };
  }

  return {
    id: item.id,
    time: formatRelativeTime(item.createdAt, nowMs),
    message: `${actorName} hat eine Aktion ausgeführt`,
  };
}
