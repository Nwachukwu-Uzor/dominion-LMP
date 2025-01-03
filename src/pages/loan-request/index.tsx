import {
  BasicInformation,
  ContactInformation,
  Documents,
  EligiblityCheck,
  RequestSucessful,
} from "@/components/loan-request";
import { SESSION_STORAGE_KEY, LINK_STATUS_OPTIONS } from "@/constants";
import { FETCH_LINK_STATUS } from "@/constants/query-keys";
import { SettingsService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import Stepper from "react-stepper-horizontal";

const steps = [
  { title: "Eligiblity Check" },
  { title: "Basic Information" },
  { title: "Contact Information" },
  { title: "Documents" },
];

const LoanRequest = () => {
  const [activeStep, setActiveStep] = useState(0);

  const settingsService = new SettingsService();

  const { data: linkStatus, isLoading: isLoadingLinkStatus } = useQuery({
    queryKey: [FETCH_LINK_STATUS],
    queryFn: async () => {
      const data = await settingsService.getLinkStatus();
      return data?.linkStatus;
    },
  });

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
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_ELIGIBILITY_INFORMATION`);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_ELIGIBILITY`);
    sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_CUSTOMER_INFO`);
  };

  function getSectionComponent() {
    switch (activeStep) {
      case 0:
        return <EligiblityCheck handleUpdateStep={handleUpdateStep} />;
      case 1:
        return <BasicInformation handleUpdateStep={handleUpdateStep} />;
      case 2:
        return <ContactInformation handleUpdateStep={handleUpdateStep} />;
      case 3:
        return <Documents handleUpdateStep={handleUpdateStep} />;
      case 4:
        return <RequestSucessful handleClose={handleClose} />;
      default:
        return null;
    }
  }
  return (
    <main>
      {isLoadingLinkStatus ? (
        <article className="mt-2 flex min-h-[10vh] items-center justify-center rounded-sm bg-gray-50 px-2 py-4">
          <ClipLoader size={16} color="#5b21b6" />
        </article>
      ) : linkStatus?.toUpperCase() === LINK_STATUS_OPTIONS.ON ? (
        <>
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
        </>
      ) : (
        <section className="text-center">
          <h3 className="mb-2 text-xl font-semibold uppercase">Form Closed</h3>
          <p className="text-sm font-light">
            Sorry the form is no longer accepting response...
          </p>
        </section>
      )}
    </main>
  );
};

export default LoanRequest;
