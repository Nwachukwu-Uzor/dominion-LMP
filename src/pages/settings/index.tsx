import { Container, PageTitle } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { USER_ROLES } from "@/constants";
import { useUser } from "@/hooks";
import { Link } from "react-router-dom";

const Settings = () => {
  const { user } = useUser();
  return (
    <Container>
      <PageTitle title="Settings" />
      <Card className="mt-2">
        <p className="mb-4 font-light">Please select the setting to update</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <Link
            to="loan-frequency"
            className="group relative mt-2 w-fit text-center text-sm font-medium text-primary duration-200"
          >
            - Loan Frequency
            <span className="absolute -bottom-0.5 left-0 h-[0.25px] w-0 bg-primary duration-200 group-hover:w-full"></span>
          </Link>
          {user?.role?.includes(USER_ROLES.SUPER_ADMIN) ? (
            <Link
              to="link-status"
              className="group relative mt-2 w-fit text-center text-sm font-medium text-primary duration-200"
            >
              - Link Status
              <span className="absolute -bottom-0.5 left-0 h-[0.25px] w-0 bg-primary duration-200 group-hover:w-full"></span>
            </Link>
          ) : null}
        </div>
      </Card>
    </Container>
  );
};

export default Settings;
