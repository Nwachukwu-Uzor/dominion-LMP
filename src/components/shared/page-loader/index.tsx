import { ClipLoader } from "react-spinners";

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center m-auto p-6 min-h-[25vh]">
      <ClipLoader size={25} color="#5b21b6" />
    </div>
  );
};
