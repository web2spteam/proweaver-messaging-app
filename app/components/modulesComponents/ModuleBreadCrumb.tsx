"use client";
import { useModuleInfo } from "./ModuleInfo";
import { Breadcrumb } from "flowbite-react";
export function ModuleBreadcrumbLink() {
  const { subject_id, subject_name } = useModuleInfo();
  return (
    <>
      <Breadcrumb.Item href={`/dashboard/subjects/${subject_id}`}>
        {subject_name}
      </Breadcrumb.Item>
    </>
  );
}

export function ModuleBreadcrumb() {
  const { module_title } = useModuleInfo();
  return (
    <>
      <Breadcrumb.Item>{module_title}</Breadcrumb.Item>
    </>
  );
}
