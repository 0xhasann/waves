export const now = () => {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  };

export const formatMessageTime = (dateStr: string): string => {
    const msgDate = new Date(dateStr);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

    if (msgDay.getTime() === today.getTime()) {
        return msgDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    if (msgDay.getTime() === yesterday.getTime()) {
        return "Yesterday";
    }

    return msgDate.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
};