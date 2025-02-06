import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

type Props = { loading: boolean };
export const FullScreenLoader: React.FC<Props> = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <ClipLoader color="#ffffff" size={50} />
    </div>
  );
};
