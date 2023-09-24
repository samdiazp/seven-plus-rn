import { useContext } from "react";
import { SupabaseContext } from "../providers/supabase";

export const useSpabase = () => {
  const context = useContext(SupabaseContext);

  return context;
};
