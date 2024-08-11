import React from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Button } from "../ui/button";
import { SESSION_STORAGE_KEY } from "@/constants";

type Props = {
  handleClose: () => void;
};

export const RequestSucessful: React.FC<Props> = ({ handleClose }) => {
  const message = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_MESSAGE`);

  return (
    <article className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold">Request Submitted Successfully</h2>
      <IoMdCheckmarkCircleOutline className="text-6xl text-green-400" />
      <p className="text-center text-sm font-light">
        {message ?? (
          <>
            Your loan application has been submitted successfully. <br />
            You will be notified when the request has been reviewed.
          </>
        )}
      </p>
      <Button className="rounded-sm min-w-[200px]" onClick={handleClose}>
        Close
      </Button>
    </article>
  );
};
