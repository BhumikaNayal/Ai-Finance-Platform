'use client';
import { createContext } from "react";
export const MyContext = createContext();
export default function MyContextProvider({children}){
    const value={};
    return(
    <MyContext.Provider value={value}>
        {children}</MyContext.Provider>);
}