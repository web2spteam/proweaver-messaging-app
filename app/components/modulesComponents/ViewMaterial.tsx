"use client"
import { useSearchParams } from 'next/navigation';
import { decodeBase64 } from "@/app/utils/zlib";

function ViewMaterial() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');
    const type = searchParams.get('type');
    
    return (
        <iframe 
        src={type == "docx" || type == "doc" ? `https://view.officeapps.live.com/op/view.aspx?src=${decodeBase64(url ?? '')}`: decodeBase64(url ?? '')}
        className="size-full"
        ></iframe>
    )
}

export default ViewMaterial;