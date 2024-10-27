import { Container, PageTitle } from "@/components/shared";
import { Link } from "react-router-dom";
import { TemplatesList } from "@/components/templates";
import { SESSION_STORAGE_KEY } from "@/constants";
import { TemplateService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { Pagination } from "@/components/shared/pagination";
import { FETCH_ALL_TEMPLATES } from "@/constants/query-keys";

const INITIAL_CONFIG = {
  status: "active",
  page: 1,
  size: 10,
  totalPages: 0,
};

const Messaging = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const templateService = new TemplateService(token);
  const [pageConfig, setPageConfig] = useState(INITIAL_CONFIG);

  const { isLoading: isLoadingTemplates, data: templates } = useQuery({
    queryKey: [FETCH_ALL_TEMPLATES, pageConfig.page],
    queryFn: async ({ queryKey }) => {
      const [_, page] = queryKey;
      console.log(_);

      const data = await templateService.getAllTemplates({
        page,
        size: pageConfig.size,
      });
      console.log(data);

      if (data && data?.payload) {
        setPageConfig((current) => ({
          ...current,
          totalPages: data?.payload?.totalPages ?? 1,
        }));
      }
      return data?.payload;
    },
  });

  const handlePageNumberClick = (pageNumber: number) => {
    setPageConfig((current) => ({ ...current, page: pageNumber }));
  };

  return (
    <Container>
      <PageTitle title="Messaging" />
      <Link
        to="new-template"
        className="max-w-[180px] gap-1 rounded-md active:scale-75 hover:opacity-60 duration-150 py-2 px-1 my-4 flex items-center justify-center ml-auto bg-[#7E21CF] text-white text-xs font-medium"
      >
        New Template
      </Link>

      {isLoadingTemplates ? (
        <div className="min-h-[25vh] flex items-center justify-center">
          <ClipLoader size={25} color="#5b21b6" />
        </div>
      ) : templates?.messagingRecords &&
        templates?.messagingRecords?.length > 0 ? (
        <>
          <TemplatesList templates={templates.messagingRecords} />
          <div className="mt-2">
            <Pagination
              totalPages={pageConfig.totalPages}
              currentPage={pageConfig.page}
              handlePageClick={handlePageNumberClick}
            />
          </div>
        </>
      ) : (
        <p>No Records found</p>
      )}
    </Container>
  );
};

export default Messaging;
