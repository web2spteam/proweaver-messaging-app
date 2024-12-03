"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getData } from "@/app/hooks/useAxios";

interface ISubjectName {
  className?: string;
}

function SubjectName({ className }: ISubjectName) {
  const { subject_id } = useParams();
  const [subjectName, setSubjectName] = useState<string>("");

  const fetchSubjectInfo = useCallback(async () => {
    try {
      const res: any = await getData(`subjects/getSubjectInfo/${subject_id}`);
      if (res) {
        setSubjectName(res?.subject_name);
      }
    } catch (error) {
      console.error(error);
    }
  }, [subject_id]);

  useEffect(() => {
    fetchSubjectInfo();
  }, [fetchSubjectInfo]);
  return <span className={className}>{subjectName}</span>;
}
export default SubjectName;
