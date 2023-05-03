export const walletAddress = (address: string) => {
  const a = address;
  // return `${a.substring(0, 5)}...${a.substring(a.length - 5, a.length)}`
  return `${a.substring(0, 4)}..`;
};

export const walletAddressLoginDisplay = (address: string) => {
  const a = address;
  return `${a.substring(0, 5)}...${a.substring(a.length - 5, a.length)}`;
};

export const worldAddressDisplay = (address: string) => {
  const a = address;
  return `${a.substring(0, 8)}...${a.substring(a.length - 8, a.length)}`;
};
