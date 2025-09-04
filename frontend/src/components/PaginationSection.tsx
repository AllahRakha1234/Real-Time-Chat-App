import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationSectionI {
    totalCounts: number;
    hasNext: boolean;
    currentPage: number;
    itemsPerPage: number;
    handlePageChange: (page: number) => void;
}

const PaginationSection = ({
    totalCounts,
    hasNext,
    currentPage,
    itemsPerPage,
    handlePageChange,
}: PaginationSectionI) => {
    const totalPages = Math.ceil(totalCounts / itemsPerPage);

    return (
        <Pagination>
            <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                    />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    return (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                isActive={page === currentPage}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                }}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}

                {/* Ellipsis if there are more pages */}
                {totalPages > 5 && (
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                )}

                {/* Next Button */}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (hasNext) handlePageChange(currentPage + 1);
                        }}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationSection;
