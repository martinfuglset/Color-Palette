figma.showUI(__html__, { width: 500, height: 400 });


figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-frames') {
    const csvData: string[] = msg.csvData.trim().split('\n'); // Split input into rows

    // Ensure the required font is loaded
    try {
      await figma.loadFontAsync({ family: "Plus Jakarta Sans", style: "SemiBold" });
    } catch (error) {
      figma.notify("Error loading font: Plus Jakarta Sans SemiBold");
      console.error(error);
      return;
    }

    // Create an auto layout container for the frames
    const autoLayoutContainer = figma.createFrame();
    autoLayoutContainer.name = "Color Palette Frames";
    autoLayoutContainer.layoutMode = "VERTICAL"; // Arrange children vertically
    autoLayoutContainer.primaryAxisSizingMode = "AUTO"; // Adjusts to children size
    autoLayoutContainer.counterAxisSizingMode = "AUTO";
    autoLayoutContainer.paddingLeft = 0; // No padding
    autoLayoutContainer.paddingRight = 0;
    autoLayoutContainer.paddingTop = 0;
    autoLayoutContainer.paddingBottom = 0;
    autoLayoutContainer.itemSpacing = 0; // No gap between frames

    csvData.forEach(async (line, index) => {
      const [name, hex] = line.split(',').map((item) => item.trim()); // Parse Name and HEX

      if (name && hex) {
        try {
          // Create the frame with fixed dimensions
          const frame = figma.createFrame();
          frame.name = name; // Set the frame name
          frame.resize(220, 100); // Set fixed dimensions
          frame.layoutMode = "VERTICAL"; // Enable auto layout
          frame.primaryAxisSizingMode = "FIXED"; // Maintain fixed height
          frame.counterAxisSizingMode = "FIXED"; // Maintain fixed width
          frame.primaryAxisAlignItems = "SPACE_BETWEEN"; // Auto-adjust gap between items
          frame.paddingLeft = 15; // Padding inside the frame
          frame.paddingRight = 15;
          frame.paddingTop = 15;
          frame.paddingBottom = 15;
          frame.fills = [{ type: 'SOLID', color: hexToRgb(hex) }]; // Set the background color
          frame.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]; // Black stroke
          frame.strokeWeight = 1; // Set the stroke width
          frame.strokeAlign = "CENTER"; // Center the stroke

          const isDarkColor = isDark(hex);

          // Add the name text
          const nameText = figma.createText();
          nameText.fontName = { family: "Plus Jakarta Sans", style: "SemiBold" }; // Set font
          await figma.loadFontAsync(nameText.fontName as FontName); // Load font before applying
          nameText.characters = name; // Set text content
          nameText.fontSize = 14; // Font size
          nameText.fills = [{ type: 'SOLID', color: isDarkColor ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 } }]; // Dynamic text color
          frame.appendChild(nameText); // Add text to the auto layout frame

          // Add the HEX code text
          const hexText = figma.createText();
          hexText.fontName = { family: "Plus Jakarta Sans", style: "SemiBold" }; // Set font
          await figma.loadFontAsync(hexText.fontName as FontName); // Load font before applying
          hexText.characters = `#${hex.toUpperCase()}`; // Set text content
          hexText.fontSize = 14; // Font size
          hexText.fills = [{ type: 'SOLID', color: isDarkColor ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 } }]; // Dynamic text color
          frame.appendChild(hexText); // Add text to the auto layout frame

          autoLayoutContainer.appendChild(frame); // Add the frame to the container
        } catch (error) {
          console.error(`Error processing row ${index + 1}: "${line}"`, error);
          figma.notify(`Error with row ${index + 1}: "${line}"`);
        }
      } else {
        console.warn(`Invalid input on row ${index + 1}: "${line}"`);
      }
    });

    // Add the container to the canvas
    figma.currentPage.appendChild(autoLayoutContainer);
    figma.viewport.scrollAndZoomIntoView([autoLayoutContainer]); // Focus on the container
  }
};

// Convert HEX to RGB
function hexToRgb(hex: string): RGB {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}

// Determine if a color is dark
function isDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  return luminance < 0.5; // Threshold for dark colors
}
