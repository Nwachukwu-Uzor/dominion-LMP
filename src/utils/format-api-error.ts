export const formatAPIError = (error: any) => {
  return (
    error?.response?.data?.message ?? error?.message ?? "An error occurred"
  );
};
