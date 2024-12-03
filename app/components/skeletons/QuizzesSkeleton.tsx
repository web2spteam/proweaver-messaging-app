function QuizzesSkeleton() {
    return (
        <div className="mb-10 flex w-full animate-pulse justify-between gap-8 rounded-lg border border-gray-200 bg-white p-5 shadow dark:border-gray-700 dark:bg-gray-800 sm:items-center">
            <div className="flex grow flex-col justify-between sm:flex-row sm:items-center">
                <div className="h-6 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="mt-2 h-4 w-16 rounded bg-gray-300 dark:bg-gray-700 sm:mt-0"></div>
                <div className="mt-2 h-4 w-36 rounded bg-gray-300 dark:bg-gray-700 sm:mt-0"></div>
                <div className="mt-2 h-4 w-48 rounded bg-gray-300 dark:bg-gray-700 sm:mt-0"></div>
            </div>
            <div className="inline-flex">
                <div className="mr-3 size-10 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
                <div className="size-10 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
            </div>
        </div>
    )
}

export default QuizzesSkeleton