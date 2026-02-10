export function getStartDate(period: "7d" | "30d" | "90d") {
    const now = new Date();
    const days = parseInt(period.replace("d", ""));
    return new Date(now.setDate(now.getDate() - days));
  }