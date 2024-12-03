"use client";
import { useBatchInfo } from "@/app/components/studentsComponents/BatchInfo";
import { Breadcrumb } from "flowbite-react";
export function BatchBreadcrumbLink() {
  const { batch_slug, batch_name } = useBatchInfo();
  return (
    <>
      <Breadcrumb.Item href={`/dashboard/students/${batch_slug}`}>
        {batch_name}
      </Breadcrumb.Item>
    </>
  );
}

export function BatchBreadcrumb() {
  const { batch_name } = useBatchInfo();
  return (
    <>
      <Breadcrumb.Item>{batch_name}</Breadcrumb.Item>
    </>
  );
}
