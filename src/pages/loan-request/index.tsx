import {
  BasicInformation,
  ContactInformation,
  Documents,
  RequestSucessful,
} from "@/components/loan-request";
import { SESSION_STORAGE_KEY } from "@/constants";
import { useEffect, useState } from "react";
import Stepper from "react-stepper-horizontal";

const steps = [
  { title: "Basic Information" },
  { title: "Contact Information" },
  { title: "Documents" },
];

const LoanRequest = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const stage = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_STAGE`);
    if (!stage) {
      return;
    }
    setActiveStep(Number(stage) ?? 0);
  }, []);

  const handleUpdateStep = (isForward = true) => {
    setActiveStep((current) => (isForward ? current + 1 : current - 1));
  };

  const handleClose = () => {
    setActiveStep(0);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_STAGE`);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_BASIC_INFORMATION`);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_CONTACT_INFORMATION`);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_MESSAGE`);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_BVN_DETAILS`);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_DOCUMENTS`);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_IPPIS_INFO`);
  };

  function getSectionComponent() {
    switch (activeStep) {
      case 0:
        return <BasicInformation handleUpdateStep={handleUpdateStep} />;
      case 1:
        return <ContactInformation handleUpdateStep={handleUpdateStep} />;
      case 2:
        return <Documents handleUpdateStep={handleUpdateStep} />;
      case 3:
        return <RequestSucessful handleClose={handleClose} />;
      default:
        return null;
    }
  }
  return (
    <main>
      <h3 className="scroll-m-20 text-center text-xl font-semibold tracking-tight">
        DMB IPPIS Loan
      </h3>
      <p className="mt-1 text-center text-sm leading-7">
        Start your Loan Application today!
      </p>
      <div className="my-8">
        <Stepper
          steps={steps}
          activeStep={activeStep}
          completeColor="#7E21CF"
          completeTitleColor="#7E21CF"
          completeBarColor="#7E21CF"
          activeColor="#E2CCF5"
        />
      </div>
      <section>{getSectionComponent()}</section>
    </main>
  );
};

export default LoanRequest;
