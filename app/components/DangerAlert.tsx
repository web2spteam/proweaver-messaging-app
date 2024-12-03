interface Props {
  title: string;
  content?: string[]; // Changed to string[]
}

export default function DangerAlert({ title, content }: Props) {
  return (
    <div className="mb-4 rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5 text-red-400"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          {content && (
            <div className="mt-2 text-sm text-red-700">
              {content?.map((item, index) => <p key={index}>{item}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
