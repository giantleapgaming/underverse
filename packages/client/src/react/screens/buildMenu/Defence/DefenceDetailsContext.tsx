import React from "react";
export interface MyObject {
  id: string;
  name: string;
  title: string;
  description: string;
  imageURL: string;
  price: string;
}
const DefenceArrayContext = React.createContext<MyObject[]>([]);

export default DefenceArrayContext;
