import React from "react";
export interface MyObject {
  id: string;
  name: string;
  title: string;
  description: string;
  imageURL: string;
  price: string;
}
const ShipArrayContext = React.createContext<MyObject[]>([]);

export default ShipArrayContext;
