import { BellIcon, ChatBubbleLeftRightIcon, TicketIcon } from "@heroicons/react/24/outline";

const Sidebar = () => {
    return (
      <div className="mt-12 h-screen w-96 border-r border-white bg-black px-6 text-white">
        <ul className=" space-y-8">
          <li className="flex items-center justify-between pe-5">
            <div className="flex items-center space-x-4">
              <span className="text-xl"><BellIcon className="size-8"/></span>
              <span className="text-2xl font-semibold text-[#644d9f]">Notifications</span>
            </div>
            <span className="flex size-8 items-center justify-center rounded-full border border-[#f74e1f] bg-transparent text-sm font-bold text-red-500">
              1
            </span>
          </li>
          <li className="flex items-center space-x-4 text-white">
            <span className="text-xl"><ChatBubbleLeftRightIcon className="size-8"/></span>
            <span className="text-xl">Chat</span>
          </li>
          <li className="flex items-center space-x-4 text-gray-400">
            <span className="text-xl"><TicketIcon className="size-8"/></span>
            <span className="text-xl">Tickets</span>
          </li>
        </ul>
      </div>
    );
  };
  
  export default Sidebar;
  