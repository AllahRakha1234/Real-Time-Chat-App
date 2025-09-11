import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationSectionI {
    totalCounts: number;
    hasNext: boolean;
    currentPage: number;
    itemsPerPage: number;
    showLimitRangeSelect: boolean;
    handlePageChange: (page: number) => void;
    handlePageLimitChange: (page: number) => void;

}

function getFixedPaginationRange(totalPages: number, currentPage: number): (number | "ellipsis")[] {
    if (totalPages <= 4) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    pages.push(1);

    if (currentPage <= 2) {
        // Case: at the beginning
        // pages.push(2, 3, 4);
        pages.push(2, 3);
        pages.push("ellipsis");
        pages.push(totalPages);
    } else if (currentPage >= totalPages - 1) {
        // Case: at the end
        pages.push("ellipsis");
        // pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
        pages.push(totalPages - 2, totalPages - 1);
        pages.push(totalPages);
    } else {
        // Case: in the middle
        pages.push("ellipsis");
        // pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push(currentPage - 1, currentPage);
        pages.push("ellipsis");
        pages.push(totalPages);
    }

    return pages;
}

const PaginationSection = ({
    totalCounts,
    hasNext,
    currentPage,
    itemsPerPage,
    showLimitRangeSelect,
    handlePageChange,
    handlePageLimitChange
}: PaginationSectionI) => {
    const totalPages = Math.ceil(totalCounts / itemsPerPage);
    const pages = getFixedPaginationRange(totalPages, currentPage);

    return (
        <div className="flex items-center justify-center flex-col space-y-2">
            <Pagination>
                <PaginationContent className="flex flex-wrap justify-center">
                    {/* Previous */}
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) handlePageChange(currentPage - 1);
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>

                    {/* Numbers + Ellipsis */}
                    {pages.map((page, idx) => (
                        <PaginationItem key={idx}>
                            {page === "ellipsis" ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    className={
                                        page === currentPage
                                            ? "bg-primary text-secondary-foreground hover:bg-primary/90"
                                            : ""
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page);
                                    }}
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    {/* Next */}
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (hasNext) handlePageChange(currentPage + 1);
                            }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
            {/* <div className="flex justify-center items-center"> */}
            {
                showLimitRangeSelect && (
                    <Select
                        onValueChange={(value) => handlePageLimitChange(Number(value))}
                        defaultValue={String(itemsPerPage) || "5"}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Page Limit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Page Limit</SelectLabel>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                )
            }
        </div>
        // </div>
    );
};

export default PaginationSection;
