import { useState } from "react";
import { Container, NonPaginatedTable, PageTitle } from "@/components/shared";
import { AdminType } from "@/types/shared";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { generateTransactionStatusStyle } from "@/utils";
// import { toast } from "react-toastify";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivateAdmin, DisableAdmin } from "@/components/admins";
import { FETCH_ALL_ADMINS, SESSION_STORAGE_KEY } from "@/constants";
import { AdminService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { Pagination } from "@/components/shared/pagination";
import { useRoleAccess } from "@/hooks";

const ADMIN_STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
};

const STATUS_OPTIONS = [
  {
    id: 1,
    value: "All",
    label: "All",
  },
  {
    id: 2,
    value: "pending",
    label: "Pending",
  },
  {
    id: 3,
    value: "active",
    label: "Active",
  },
  {
    id: 4,
    value: "disabled",
    label: "Disabled",
  },
];

const MODAL_TYPES = {
  ACTIVATE: "ACTIVATE",
  DEACTIVATE: "DEACTIVATE",
};

const INITIAL_CONFIG = {
  status: "All",
  page: 1,
  size: 10,
  totalPages: 0,
};

const SUPER_ADMIN = "superAdmin";

const Admins = () => {
  useRoleAccess(SUPER_ADMIN);
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const adminService = new AdminService(token);
  const [pageConfig, setPageConfig] = useState(INITIAL_CONFIG);

  const { isLoading: isLoadingAdmins, data: admins } = useQuery({
    queryKey: [FETCH_ALL_ADMINS, pageConfig.page, pageConfig.status],
    queryFn: async ({ queryKey }) => {
      const [_, page, status] = queryKey;
      console.log(_);

      const data = await adminService.getAdmins({
        page,
        status: status.toString().toUpperCase() === "ALL" ? "" : status,
        size: pageConfig.size,
      });
      if (data && data?.payload) {
        setPageConfig((current) => ({
          ...current,
          totalPages: data?.payload?.totalPages ?? 1,
        }));
      }
      return data?.payload;
    },
  });

  const [selectedAdmin, setSelectedAdmin] = useState<AdminType | null>(null);
  const [openModal, setOpenModal] = useState<string | boolean>("");

  const handleOpenModal = (admin: AdminType, type: string) => {
    setSelectedAdmin(admin);
    setOpenModal(type);
  };

  const handleClose = () => {
    setOpenModal("");
    setSelectedAdmin(null);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Full Name",
      accessorKey: "fullName",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Registered On",
      accessorKey: "date",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <div
          className={`${generateTransactionStatusStyle(getValue() as string)}`}
        >
          {getValue() as string}
        </div>
      ),
    },

    {
      header: "Action",
      accessorKey: "id",
      cell: ({ row }) => {
        const { status } = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {[ADMIN_STATUS.ACTIVE].includes(status.toUpperCase()) && (
              <button
                onClick={() =>
                  handleOpenModal(row.original, MODAL_TYPES.DEACTIVATE)
                }
                className="ml-auto text-red-600 relative group w-fit font-bold text-sm flex items-center justify-center gap-0.5 hover:opacity-85 active:scale-75"
              >
                Disable
                <span className="absolute left-0 h-[1.25px] -bottom-0.5 w-0 group-hover:w-full bg-red-600 ease-in duration-150 opacity-85"></span>
              </button>
            )}
            {[ADMIN_STATUS.PENDING, ADMIN_STATUS.DISABLED].includes(
              status.toUpperCase()
            ) && (
              <button
                className="ml-auto text-green-600 relative group w-fit font-bold text-sm flex items-center justify-center gap-0.5 hover:opacity-85 active:scale-75"
                onClick={() =>
                  handleOpenModal(row.original, MODAL_TYPES.ACTIVATE)
                }
              >
                Activate
                <span className="absolute left-0 h-[1.25px] -bottom-0.5 w-0 group-hover:w-full bg-green-600 ease-linear duration-150 opacity-85"></span>
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const handleStatusChange = (status: string) => {
    setPageConfig((current) => ({ ...current, status: status, page: 1 }));
  };

  const handlePageNumberClick = (pageNumber: number) => {
    setPageConfig((current) => ({ ...current, page: pageNumber }));
  };

  return (
    <>
      <Container>
        <PageTitle title="Users" />
        <Card className="my-2">
          <div
            className="flex my-2 flex-col lg:flex-row gap-3 lg:gap-2 justify-between items-start lg:items-center"
            // onSubmit={handleSubmit(onSubmit)}
          >
            <div className="w-full max-w-[400px]">
              <Label htmlFor="alertType" className="mb-1 font-semibold">
                Status
              </Label>
              <Select
                value={pageConfig.status}
                onValueChange={async (value) => {
                  handleStatusChange(value);
                }}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    {STATUS_OPTIONS?.map((opt) => (
                      <SelectItem value={opt.value} key={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          {isLoadingAdmins ? (
            <div className="min-h-[25vh] flex items-center justify-center">
              <ClipLoader size={25} color="#5b21b6" />
            </div>
          ) : admins?.staffRecords && admins.staffRecords.length > 0 ? (
            <>
              <NonPaginatedTable columns={columns} data={admins.staffRecords} />
              <div>
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
        </Card>
      </Container>
      <ActivateAdmin
        openModal={openModal === MODAL_TYPES.ACTIVATE}
        onClose={handleClose}
        admin={selectedAdmin}
      />
      <DisableAdmin
        openModal={openModal === MODAL_TYPES.DEACTIVATE}
        onClose={handleClose}
        admin={selectedAdmin}
      />
    </>
  );
};

export default Admins;
