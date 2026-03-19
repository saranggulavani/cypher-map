/**
 * Robust clipboard utility with fallback for insecure contexts.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  // 1. Modern API (HTTPS/Localhost)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Modern Clipboard API failed:", err);
    }
  }

  // 2. Fallback (Insecure/Mobile IP)
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  textArea.setAttribute("readonly", "");

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, 99999);

  try {
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
};
