export const walletAddress = (address: string) => {
  const a = address;
  // return `${a.substring(0, 5)}...${a.substring(a.length - 5, a.length)}`
  return `${a.substring(0, 3)}..`;
};

export const walletAddressLoginDisplay = (address: string) => {
  const a = address;
  return `${a.substring(0, 7)}...${a.substring(a.length - 7, a.length)}`;
};
