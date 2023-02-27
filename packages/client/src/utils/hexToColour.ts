function hashToHexColor(hash: string): string {
  // Convert the hash value to a base 16 (hexadecimal) string
  let hex = parseInt(hash, 36).toString(16);

  // Pad the string with zeros if it's less than six characters long
  while (hex.length < 6) {
    hex = "0" + hex;
  }

  // Add some variation to the color by taking the XOR of the last two digits of the hash
  const variation = parseInt(hash.slice(-2), 36) ^ 255;
  const variationHex = variation.toString(16).padStart(2, "0");

  // Return the hexadecimal color code with a hash symbol (#) prefix and variation added
  return "#" + hex + variationHex;
}

function hexToNumber(hex: string): number {
  // Remove the "#" prefix from the hex color code string
  const cleanHex = hex.replace(/^#/, "");

  // Convert the hex color code string to a number
  const number = parseInt(cleanHex, 16);

  return number;
}

function generateColorsFromHash(hash: string): number[] {
  const colors: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sectionHash = hash.substring(i * 8, i * 8 + 8);
    const color = hashToHexColor(sectionHash);
    colors.push(hexToNumber(color));
  }

  return colors;
}

export function generateColorsFromWalletAddress(walletAddress: string): number[] {
  // Remove the leading "0x" prefix from the wallet address
  const hash = walletAddress.replace(/^0x/, "");

  // Generate 4 hex colors from the wallet address hash
  const colors = generateColorsFromHash(hash);

  return colors;
}
