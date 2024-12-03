// BatchInfo.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getData } from "@/app/hooks/useAxios";
import { useParams } from "next/navigation";

// Update the interface to include batch_id
interface BatchInfoContextType {
  batch_id: string | number;
  batch_name: string;
  batch_slug: string | string[];
}

const BatchInfoContext = createContext<BatchInfoContextType | null>(null);

export function BatchInfoProvider({ children }: { children: React.ReactNode }) {
  const { batch_slug } = useParams();
  const [batchInfo, setBatchInfo] = useState<BatchInfoContextType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBatchInfo = async () => {
      try {
        const res: any = await getData(`batch/getBatchInfo/${batch_slug}`);
        if (res) {
          setBatchInfo({
            batch_id: res.batch_id, // Assuming res contains batch_id
            batch_name: res.batch_name,
            batch_slug: batch_slug,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchInfo();
  }, [batch_slug]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!batchInfo) {
    return <div>No batch info available.</div>;
  }

  return (
    <BatchInfoContext.Provider value={batchInfo}>
      {children}
    </BatchInfoContext.Provider>
  );
}

// Custom hook to access batchInfo including batch_id
export function useBatchInfo() {
  const batchInfo = useContext(BatchInfoContext);
  if (!batchInfo) {
    throw new Error("useBatchInfo must be used within a BatchInfoProvider");
  }
  return batchInfo;
}

export function BatchName() {
  const { batch_name } = useBatchInfo();
  return <span>{batch_name}</span>;
}
