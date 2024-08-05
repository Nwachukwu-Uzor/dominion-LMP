import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdAddCard,
  MdDashboard,
  MdOutlineAddCard,
  MdOutlineMessage,
  MdSavings,
} from "react-icons/md";
import { TiUserAdd } from "react-icons/ti";
import { HiUsers } from "react-icons/hi2";

import logo from "@/assets/images/dominion-logo.svg";
import { SESSION_STORAGE_KEY } from "@/constants";
import { toast } from "react-toastify";
import { LogOutIcon } from "lucide-react";
import { useUser } from "@/hooks";
import { IoNotificationsCircleOutline } from "react-icons/io5";

type Props = {
  open: boolean;
  handleToggleSidebar: () => void;
};

const USER_ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  REVIEWER: "REVIEWER",
  SUPERVISOR: "SUPERVISOR",
};

export const Sidebar: React.FC<Props> = ({ open, handleToggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  const onLinkClick = () => {
    if (window.innerWidth > 768) {
      return;
    }
    handleToggleSidebar();
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <MdDashboard />,
      id: "1",
    },
    {
      id: 2,
      title: "Accounts",
      path: "/accounts",
      icon: <MdSavings />,
    },
    {
      id: 3,
      title: "Customers",
      path: "/customers",
      icon: <TiUserAdd />,
    },
    {
      id: 4,
      title: "Bulk Notifications",
      path: "/bulk-notifications",
      icon: <IoNotificationsCircleOutline />,
    },
    {
      id: 5,
      title: "Messaging",
      path: "/messaging",
      icon: <MdOutlineMessage />,
    },
  ];

  if (user) {
    const transformedRoles = user.role.map((role) => role.toUpperCase());

    if (transformedRoles.includes(USER_ROLES.SUPER_ADMIN.toUpperCase())) {
      menuItems.push({
        id: 6,
        title: "Users",
        path: "/users",
        icon: <HiUsers />,
      });
    }

    if (transformedRoles.includes(USER_ROLES.SUPERVISOR)) {
      menuItems.splice(3, 0, {
        id: 7,
        title: "Pending Authorizer",
        path: "/loan/requests/supervisor",
        icon: <MdOutlineAddCard />,
      });
    }

    if (transformedRoles.includes(USER_ROLES.REVIEWER)) {
      menuItems.splice(3, 0, {
        id: 8,
        title: "Pending Reviewer",
        path: "/loan/requests/reviewer",
        icon: <MdOutlineAddCard />,
      });
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    toast.success("Logout successful..");
    navigate("/auth/login");
  };

  return (
    <aside
      className={`bg-[#2D2D2D] h-screen  ${
        open ? "lg:w-72 " : "lg:w-20"
      } duration-300 overflow-y-auto no-scrollbar`}
    >
      <nav
        className={`bg-[#2D2D2D] fixed pt-8 lg:left-0 top-0 bottom-0 z-20 ${
          open ? "w-72 " : "w-0 -left-20 lg:block lg:w-20"
        } duration-300 flex flex-col gap-10 h-[100vh-36px]`}
      >
        <div
          className={`flex items-center justify-start mt-12 gap-3 px-5 ${
            open ? "w-fit" : "w-full"
          } h-8`}
        >
          <NavLink to={"/dashboard"}>
            <img
              src={logo}
              className={`p-1 w-full rounded cursor-pointer mx-auto ${
                open ? "" : "rotate-[360deg]"
              } duration-500`}
              alt="Logo"
            />
          </NavLink>
        </div>
        <div className="flex flex-col justify-between mt-2">
          <ul className="pt-2 flex flex-col gap-3 overflow-x-hidden">
            {menuItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={onLinkClick}
                  className={({ isActive }) =>
                    `w-full ${
                      open ? "" : "lg:justify-center"
                    } flex items-center gap-x-4 text-sm cursor-pointer hover:opacity-80 p-2 pl-5 ${
                      isActive
                        ? "text-primary bg-white lg:bg-transparent lg:border-l-[6px] lg:border-l-primary"
                        : "bg-transparent text-white"
                    } hover:text-primary`
                  }
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{item.icon}</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        sideOffset={open ? 250 : 35}
                        className="bg-white shadow-sm text-black"
                        arrowPadding={4}
                      >
                        <p className="text-sm">{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span
                    className={`font-medium text-base ${
                      open ? "scale-1 w-auto" : "scale-0 w-0"
                    }`}
                  >
                    {item.title}
                  </span>
                </NavLink>
              </li>
            ))}
            <NavLink
              to="/loan-request"
              target="_blank"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `w-full ${
                  open ? "" : "lg:justify-center"
                } flex items-center gap-x-4 text-sm cursor-pointer hover:opacity-80 p-2 pl-5 ${
                  isActive
                    ? "text-primary bg-white lg:bg-transparent lg:border-l-[6px] lg:border-l-primary"
                    : "bg-transparent text-white"
                } hover:text-primary`
              }
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <MdAddCard />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    sideOffset={open ? 250 : 35}
                    className="bg-white shadow-sm text-black"
                    arrowPadding={4}
                  >
                    <p className="text-sm">Initiate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span
                className={`font-medium text-base ${
                  open ? "scale-1 w-auto" : "scale-0 w-0"
                }`}
              >
                Initiate
              </span>
            </NavLink>
          </ul>
          <div className="w-full absolute bottom-4 border-t-2 border-t-white pt-2">
            <button
              onClick={handleLogout}
              className={`flex items-center justify-start p-1 pl-5 gap-1 text-white w-full font-bold ${
                open ? "" : "lg:justify-center"
              } hover:text-primary duration-150`}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <LogOutIcon />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    sideOffset={open ? 250 : 35}
                    className="bg-white shadow-sm text-black"
                    arrowPadding={4}
                  >
                    <p className="text-sm font-normal">Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span
                className={` text-base ${
                  open ? "scale-1 w-auto" : "scale-0 w-0"
                }`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};
