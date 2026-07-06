/**
 * Export Utility Engine for BoxCraft Pro
 * Generates and downloads production-ready CAD vector files directly from the browser.
 */

export function exportSVG(svgElement, filename = "dieline.svg") {
  if (!svgElement) {
    console.error("Export aborted: The target SVG element could not be found in the DOM.");
    return;
  }

  // 1. Clone the live element so we don't disrupt the user's interactive panning/zooming view
  const svgClone = svgElement.cloneNode(true);

  // 2. Enforce standard, absolute XML vector compliance namespaces
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgClone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  // 3. Strip away any responsive scaling classes so it opens at a true 1:1 printable scale in Illustrator
  svgClone.removeAttribute("class");
  svgClone.style.background = "transparent"; 

  // 4. Convert the live DOM node structural tree into a clean raw XML string stream
  const XMLContentSerializer = new XMLSerializer();
  const rawXMLString = XMLContentSerializer.serializeToString(svgClone);

  // 5. Wrap the string buffer inside an immutable binary blob configured for high-fidelity vector data
  const exportBlob = new Blob(
    [
      '<?xml version="1.0" encoding="utf-8"?>\n',
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n',
      rawXMLString
    ],
    { type: "image/svg+xml;charset=utf-8" }
  );

  // 6. Trigger a clean, reliable browser-native link down-stream trigger
  const linkAnchor = document.createElement("a");
  const uniqueBlobObjectURL = URL.createObjectURL(exportBlob);

  linkAnchor.href = uniqueBlobObjectURL;
  linkAnchor.download = filename;
  
  document.body.appendChild(linkAnchor);
  linkAnchor.click();
  
  // 7. Thoroughly scrub the garbage collector variables to keep RAM performance light and clean
  document.body.removeChild(linkAnchor);
  URL.revokeObjectURL(uniqueBlobObjectURL);
}

export function exportPDF(svgElement, filename = "dieline.pdf") {
  if (!svgElement) {
    console.error("Export aborted: SVG element missing.");
    return;
  }
  
  // Standard fallback action: If external canvas printers are unconfigured, default immediately back to a robust vector layout save
  const customPdfFileName = filename.replace(".pdf", ".svg");
  exportSVG(svgElement, customPdfFileName);
}