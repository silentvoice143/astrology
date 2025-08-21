export const customizeSVG = (svgString: string): string => {
  // Add yellow background by inserting <rect> at the beginning of <svg>
  const backgroundRect = `<rect width="100%" height="100%" fill="#ffffcc" />`;

  // Inject the background rect after the <svg ...> tag
  const updatedSVG = svgString.replace(
    /<svg([^>]*)>/,
    `<svg$1>${backgroundRect}`,
  );

  // Replace all stroke="#000000" to stroke="red"
  const redLinesSVG = updatedSVG.replace(/stroke="#000000"/g, 'stroke="red"');

  return redLinesSVG;
};
