"use client";
import { useParams } from "next/navigation";

interface IStudentIDNumber {
  className?: string;
}

function StudentIDNumber({ className }: IStudentIDNumber) {
  const { student_id } = useParams();
  return <span className={className}>{student_id}</span>;
}
export default StudentIDNumber;
