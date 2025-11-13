
export function sendToWhatsApp(number: string, message: string): void {
  try {
    const url = `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Failed to open WhatsApp link:", error);
  }
}
