// src/hooks/usePagination.ts
import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
      totalItems
    };
  }, [currentPage, totalItems, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => {
    if (paginationInfo.hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (paginationInfo.hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const reset = () => {
    setCurrentPage(1);
  };

  return {
    ...paginationInfo,
    goToPage,
    goToPrevious,
    goToNext,
    reset
  };
}