import { createContext, useContext, useState, ReactNode } from "react";

type AddressState = {
  division: string;
  district: string;
  upazila: string;
};

type AddressContextType = {
  address: AddressState | null;
  setAddress: (address: AddressState) => void;
};

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<AddressState | null>(null);
  return (
    <AddressContext.Provider value={{ address, setAddress }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) throw new Error("useAddress must be used within an AddressProvider");
  return context;
}
