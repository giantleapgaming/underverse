export const walletAddress = (address: string) => {
  const a = address;
  // return `${a.substring(0, 5)}...${a.substring(a.length - 5, a.length)}`
  return `${a.substring(0, 4)}..`;
};

export const walletAddressLoginDisplay = (address: string) => {
  const a = address;
  return `${a.substring(0, 13)}...${a.substring(a.length - 13, a.length)}`;
};
