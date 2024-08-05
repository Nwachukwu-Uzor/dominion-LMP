import React from "react";

type Props = {
  totalPages: number;
  currentPage: number;
  handlePageClick: (page: number) => void;
};

export const Pagination: React.FC<Props> = ({
  totalPages,
  currentPage,
  handlePageClick,
}) => {
  const getFirstGroup = () => {
    const firstGroup = [1];
    if (totalPages < 2) {
      return firstGroup;
    }
    firstGroup.push(2);
    return firstGroup;
  };

  const getLastGroup = () => {
    const lastGroup: number[] = [];
    const lastItemOfFirstGroup = firstGroup[firstGroup.length - 1];
    if (lastItemOfFirstGroup >= totalPages) {
      return lastGroup;
    }
    lastGroup.push(totalPages);
    if (lastItemOfFirstGroup > totalPages - 1) {
      return lastGroup;
    }
    lastGroup.unshift(totalPages - 1);
    return lastGroup.filter((item) => !firstGroup.includes(item));
  };

  const getMiddleGroup = () => {
    const middleGroup: number[] = [];
    // Handle when the current page is part of the first or last group
    if (firstGroup.includes(currentPage) || lastGroup.includes(currentPage)) {
      // Handle when the current page is elsewhere
      const midpoint = Math.floor(totalPages / 2);

      for (let i = midpoint; i < midpoint + 3; i++) {
        middleGroup.push(i);
      }
    } else {
      if (
        !(
          firstGroup.includes(currentPage - 1) ||
          lastGroup.includes(currentPage - 1)
        )
      ) {
        middleGroup.push(currentPage - 1);
      }

      middleGroup.push(currentPage);

      if (
        !(
          firstGroup.includes(currentPage + 1) ||
          lastGroup.includes(currentPage + 1)
        )
      ) {
        middleGroup.push(currentPage + 1);
      }

      if (middleGroup?.length < 3) {
        if (
          !(
            firstGroup.includes(currentPage + 2) ||
            lastGroup.includes(currentPage + 2)
          )
        ) {
          middleGroup.push(currentPage + 2);
        }
      }
    }

    // Remove pages in the middle group that are in the first or last group
    const filteredMiddleGroup = middleGroup.filter(
      (page) =>
        !firstGroup.includes(page) &&
        !lastGroup.includes(page) &&
        page <= totalPages &&
        page > 0
    );

    return filteredMiddleGroup;
  };

  const firstGroup = getFirstGroup();
  const lastGroup = getLastGroup();
  const middleGroup = getMiddleGroup();

  return (
    <div className="flex items-center gap-1">
      {firstGroup.map((page) => (
        <span
          key={page}
          className={`py-1 px-2 text-sm font-semibold ${
            page === currentPage
              ? "bg-primary rounded-sm text-white"
              : "text-black"
          } active:scale-90 active:opacity-75 duration-200 cursor-pointer`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </span>
      ))}
      {middleGroup?.length > 0 ? (
        <span className="inline-flex items-center">
          ...
          {middleGroup.map((page) => (
            <span
              key={page}
              className={`py-1 px-2 text-sm font-semibold ${
                page === currentPage
                  ? "bg-primary rounded-sm text-white"
                  : "text-black"
              } active:scale-90 active:opacity-75 duration-200 cursor-pointer`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </span>
          ))}
          ...
        </span>
      ) : null}
      {lastGroup.map((page) => (
        <span
          key={page}
          className={`py-1 px-2 text-sm font-semibold ${
            page === currentPage
              ? "bg-primary rounded-sm text-white"
              : "text-black"
          } active:scale-90 active:opacity-75 duration-200 cursor-pointer`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </span>
      ))}
    </div>
  );
};
