import { Container, PageTitle } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Settings = () => {
  return (
    <Container>
      <PageTitle title="Settings" />
      <Card className="mt-2">
        <p className="font-light mb-4">
          Please select the setting to update
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <Link
            to="loan-frequency"
            className="mt-2 text-primary text-sm group font-medium duration-200 relative w-fit text-center"
          >
            Loan Frequency
            <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full duration-200 h-0.5 bg-primary"></span>
          </Link>
          <Link
            to="loan-frequency"
            className="mt-2 text-primary text-sm group font-medium duration-200 relative w-fit text-center"
          >
            Loan Frequency
            <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full duration-200 h-0.5 bg-primary"></span>
          </Link>
          <Link
            to="loan-frequency"
            className="mt-2 text-primary text-sm group font-medium duration-200 relative w-fit text-center"
          >
            Loan Frequency
            <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full duration-200 h-0.5 bg-primary"></span>
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default Settings;
