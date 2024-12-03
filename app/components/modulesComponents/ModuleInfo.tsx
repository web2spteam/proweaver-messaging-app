// ModuleInfo.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getData } from "@/app/hooks/useAxios";
import { useParams } from "next/navigation";

// Update the interface to include batch_id
interface ModuleInfoContextType {
  subject_id: string | number;
  subject_name: string;
  module_title: string;
}

const ModuleInfoContext = createContext<ModuleInfoContextType | null>(null);

export function ModuleInfoProvider({ children }: { children: React.ReactNode }) {
  const { module_id } = useParams();
  const [moduleInfo, setModuleInfo] = useState<ModuleInfoContextType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchModuleInfo = async () => {
      try {
        const res: any = await getData(`subject_modules/getModuleInfo/${module_id}`);
        if (res) {
          setModuleInfo({
            subject_id: res.subject_id, // Assuming res contains batch_id
            subject_name: res.subject_name,
            module_title: res.module_title,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModuleInfo();
  }, [module_id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!moduleInfo) {
    return <div>No module info available.</div>;
  }

  return (
    <ModuleInfoContext.Provider value={moduleInfo}>
      {children}
    </ModuleInfoContext.Provider>
  );
}

// Custom hook to access moduleInfo including batch_id
export function useModuleInfo() {
  const moduleInfo = useContext(ModuleInfoContext);
  if (!moduleInfo) {
    throw new Error("useModuleInfo must be used within a ModuleInfoProvider");
  }
  return moduleInfo;
}

export function ModuleTitle() {
  const { module_title } = useModuleInfo();
  return <span>{module_title}</span>;
}
