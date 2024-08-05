import React from "react";
import { Card } from "@/components/ui/card";

import walletImg from "@/assets/images/wallet.svg";
import { ClipLoader } from "react-spinners";

const themes = {
  danger: "bg-[#E70E02] text-white",
  success: "bg-[#2C9720] text-white",
  warn: "bg-[#FF9500] text-white",
  dark: "bg-gray-600 text-white"
};

const themesText = {
  danger: "text-[#E70E02]",
  success: "text-[#2C9720]",
  warn: "text-[#FF9500]",
  dark: "text-gray-600"
};

type Props = {
  count: number;
  title: string;
  theme?: keyof typeof themes;
  isLoading?: boolean;
};

export const DashboardCard: React.FC<Props> = ({
  count,
  title,
  theme,
  isLoading,
}) => {
  return (
    <Card
      className={`min-h-[15vh] items-center flex border-0 p-0 md:p-0 lg:p-0 xl:p-0 overflow-hidden`}
    >
      <div
        className={`w-[25%] ${
          theme && themes[theme]
        } h-full flex items-center justify-center`}
      >
        <img src={walletImg} alt="walletImg" />
      </div>
      <div className="p-2 lg:p-4">
        <h2
          className={`text-xl lg:text-3xl my-1 font-semibold ${
            theme && themesText[theme]
          }`}
        >
          {isLoading ? <ClipLoader color="#5b21b6" size={12} /> : count}
        </h2>
        <h3 className="text-sm">{title}</h3>
      </div>
    </Card>
  );
};
