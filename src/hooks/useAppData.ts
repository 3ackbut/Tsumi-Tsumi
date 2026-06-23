import { useContext } from "react";
import { AppDataContext } from "../context/DataContext";

export function useAppData() {
  const context = useContext(AppDataContext);

  if (context === undefined) {
    throw new Error("useAppData must be used within AppDataProvider");
  }

  return context;
}
