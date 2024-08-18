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
import { BsFillClipboard2DataFill } from "react-icons/bs";
import { TiUserAdd } from "react-icons/ti";
import { HiUsers } from "react-icons/hi2";

import logo from "@/assets/images/dominion-logo.svg";
import { SESSION_STORAGE_KEY } from "@/constants";
import { toast } from "react-toastify";
import { LogOutIcon } from "lucide-react";
import { useUser } from "@/hooks";
import { IoNotificationsCircleOutline, IoSettings } from "react-icons/io5";

type Props = {
  open: boolean;
  handleToggleSidebar: () => void;
};

const USER_ROLES = {
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  REVIEWER: "REVIEWER",
  AUTHORIZER: "AUTHORIZER",
};

export const Sidebar: React.FC<Props> = ({ open, handleToggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);

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
      title: "IPPIS Data",
      path: "ippis",
      icon: <BsFillClipboard2DataFill />,
    },
    {
      id: 4,
      title: "Customers",
      path: "/customers",
      icon: <TiUserAdd />,
    },
    {
      id: 5,
      title: "Bulk Notifications",
      path: "/bulk-notifications",
      icon: <IoNotificationsCircleOutline />,
    },
    {
      id: 6,
      title: "Messaging",
      path: "/messaging",
      icon: <MdOutlineMessage />,
    },
    {
      id: 7,
      title: "Settings",
      path: "/settings",
      icon: <IoSettings />,
    },
  ];

  if (user) {
    const transformedRoles = user.role.map((role) => role.toUpperCase());

    if (transformedRoles.includes(USER_ROLES.SUPER_ADMIN.toUpperCase())) {
      menuItems.push({
        id: 8,
        title: "Users",
        path: "/users",
        icon: <HiUsers />,
      });
    }

    if (transformedRoles.includes(USER_ROLES.AUTHORIZER)) {
      menuItems.splice(3, 0, {
        id: 9,
        title: "Pending Authorizer",
        path: "/loan/requests/authorizer",
        icon: <MdOutlineAddCard />,
      });
    }

    if (transformedRoles.includes(USER_ROLES.REVIEWER)) {
      menuItems.splice(3, 0, {
        id: 10,
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
      className={`h-screen bg-[#2D2D2D] ${
        open ? "lg:w-72" : "lg:w-20"
      } no-scrollbar overflow-y-auto duration-300`}
    >
      <nav
        className={`fixed bottom-0 top-0 z-20 bg-[#2D2D2D] lg:left-0 ${
          open ? "w-72" : "-left-20 w-0 lg:block lg:w-20"
        } flex h-[100vh-36px] flex-col overflow-y-hidden duration-300`}
      >
        <div
          className={`flex items-center justify-start gap-3 px-5 ${
            open ? "w-fit" : "w-full"
          } h-24`}
        >
          <NavLink to={"/"}>
            <img
              src={logo}
              className={`mx-auto w-full cursor-pointer rounded p-1 ${
                open ? "" : "rotate-[360deg]"
              } duration-500`}
              alt="Logo"
            />
          </NavLink>
        </div>
        <div className="flex flex-col justify-between">
          <ul className="flex h-[calc(100vh-10rem)] flex-col gap-3 overflow-y-auto overflow-x-hidden py-3">
            {menuItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={onLinkClick}
                  className={({ isActive }) =>
                    `w-full ${
                      open ? "" : "lg:justify-center"
                    } flex cursor-pointer items-center gap-x-4 p-2 pl-5 text-sm hover:opacity-80 ${
                      isActive
                        ? "bg-white text-primary lg:border-l-[6px] lg:border-l-primary lg:bg-transparent"
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
                        className="bg-white text-black shadow-sm"
                        arrowPadding={4}
                      >
                        <p className="text-sm">{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span
                    className={`text-base font-medium ${
                      open ? "scale-1 w-auto" : "w-0 scale-0"
                    }`}
                  >
                    {item.title}
                  </span>
                </NavLink>
              </li>
            ))}
            <NavLink
              to={`/loan-request?access_code=${token}`}
              target="_blank"
              onClick={onLinkClick}
              className={({ isActive }) =>
                `w-full ${
                  open ? "" : "lg:justify-center"
                } flex cursor-pointer items-center gap-x-4 p-2 pl-5 text-sm hover:opacity-80 ${
                  isActive
                    ? "bg-white text-primary lg:border-l-[6px] lg:border-l-primary lg:bg-transparent"
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
                    className="bg-white text-black shadow-sm"
                    arrowPadding={4}
                  >
                    <p className="text-sm">Initiate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span
                className={`text-base font-medium ${
                  open ? "scale-1 w-auto" : "w-0 scale-0"
                }`}
              >
                Initiate
              </span>
            </NavLink>
          </ul>
          <div className="absolute bottom-0 h-16 flex items-center justify-center z-50 w-full border-t-2 border-t-white pt-2">
            <button
              onClick={handleLogout}
              className={`flex w-full items-center justify-start gap-1 p-1 pl-5 font-bold text-white ${
                open ? "" : "lg:justify-center"
              } duration-150 hover:text-primary`}
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
                    className="bg-white text-black shadow-sm"
                    arrowPadding={4}
                  >
                    <p className="text-sm font-normal">Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span
                className={`text-base ${
                  open ? "scale-1 w-auto" : "w-0 scale-0"
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
