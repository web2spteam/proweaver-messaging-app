interface HeaderProps {
  children: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <>
      <header className="bg-white shadow dark:bg-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {children}
          </div>
        </div>
      </header>
    </>
  );
}
