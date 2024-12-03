import { CheckCircleIcon } from "@heroicons/react/24/outline";

const Notifications = () => {
    const tasks = [
      { id: 1, user: "Rocky Villahermosa", account: "Account Name" },
      { id: 2, user: "Cinderella Sismundo", account: "Account Name" },
      { id: 3, user: "Rocky Villahermosa", account: "Account Name" },
      { id: 4, user: "Cinderella Sismundo", account: "Account Name" },
    ];
  
    return (
      <div className="flex-1 bg-black px-16 py-12 text-white">
        <div className="mb-8 border-b border-gray-700 pb-6">
          <div className="flex space-x-8 text-sm">
            <button className="text-lg text-gray-400 hover:text-white">All</button>
            <button className="text-lg font-bold text-white">
              New Tasks{" "}
              <span className="rounded-full bg-[#f74e1f] px-2 py-0 text-sm text-black">
                1
              </span>
            </button>
            <button className="text-lg text-gray-400 hover:text-white">Shared Tasks</button>
            <button className="text-lg text-gray-400 hover:text-white">Priority Tasks</button>
            <button className="text-lg text-gray-400 hover:text-white">
              Flagged Accounts
            </button>
            <button className="text-lg text-gray-400 hover:text-white">Idle Time</button>
            <button className="text-2xl text-gray-400 hover:text-white">...</button>
          </div>
        </div>
  
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center space-x-6 border-b border-gray-700 py-6"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-500">
                <span className="text-xl font-bold text-white">{task.user.charAt(0)}</span>
              </div>
              <div>
                <p className="text-lg">
                  <span className="font-semibold">{task.user}</span>{" "}
                  <span className="text-gray-400">created new task for</span>{" "}
                  <a href="#" className="text-white underline">{task.account}</a>
                </p>
              </div>
              <div className="ml-auto text-2xl text-green-500"><CheckCircleIcon className="size-7"/></div>
              <button className="text-2xl text-gray-400 hover:text-white">...</button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default Notifications;
  