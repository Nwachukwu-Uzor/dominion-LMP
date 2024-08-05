const STATUS_STYLES: Record<string, string> = {
  FAILED: "bg-[#FFD9D7] text-[#E70E02] border-[#FD5249]",
  DISABLED: "bg-[#FFD9D7] text-[#E70E02] border-[#FD5249]",
  SUCCESSFUL: "bg-[#C4F1BF] text-[#2C9720] border-[#64DB57]",
  ACTIVE: "bg-[#C4F1BF] text-[#2C9720] border-[#64DB57]",
  PENDING: "bg-[#F5EDFC] text-[#7E21CF] border-[#BB83EC]",
  DECLINED: "bg-[#FFD9D7] text-[#E70E02] border-[#FD5249]",
};

export const generateTransactionStatusStyle = (status: string) => {
  const styles = STATUS_STYLES[status.toUpperCase()] ?? "";

  return `px-1 border-2 uppercase inline-block min-w-[80px] text-center py-0.5 rounded-full text-[8px] font-bold ${styles}`;
};
