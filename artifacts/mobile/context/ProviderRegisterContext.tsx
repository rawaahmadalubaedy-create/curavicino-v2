import React, {
  createContext,
  useContext,
  useState,
} from "react";

const ProviderRegisterContext = createContext<any>(null);

export function ProviderRegisterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [selectedLanguages, setSelectedLanguages] =
    useState<string[]>(["Italian"]);

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [workingDays, setWorkingDays] =
    useState<string[]>([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
    ]);

  const [hoursFrom, setHoursFrom] =
    useState("08:00");

  const [hoursTo, setHoursTo] =
    useState("18:00");

  const [isOnline, setIsOnline] =
    useState(true);

  const [uploads, setUploads] =
    useState<Record<string, boolean>>({
      id: false,
      medical: false,
      criminal: false,
      photo: false,
    });

  const [withdrawal, setWithdrawal] =
    useState<"daily" | "weekly" | "monthly">(
      "weekly"
    );

  const [loading, setLoading] =
    useState(false);

  const toggleItem = (
    arr: string[],
    item: string,
    setArr: (v: string[]) => void
  ) => {
    setArr(
      arr.includes(item)
        ? arr.filter((i) => i !== item)
        : [...arr, item]
    );
  };

  return (
    <ProviderRegisterContext.Provider
      value={{
        fullName,
        setFullName,
        age,
        setAge,
        phone,
        setPhone,
        email,
        setEmail,
        address,
        setAddress,
        selectedLanguages,
        setSelectedLanguages,
        selectedCategories,
        setSelectedCategories,
        workingDays,
        setWorkingDays,
        hoursFrom,
        setHoursFrom,
        hoursTo,
        setHoursTo,
        isOnline,
        setIsOnline,
        uploads,
        setUploads,
        withdrawal,
        setWithdrawal,
        loading,
        setLoading,
        toggleItem,
      }}
    >
      {children}
    </ProviderRegisterContext.Provider>
  );
}

export function useProviderRegister() {
  return useContext(
    ProviderRegisterContext
  );
}