import {
  NavigationMenu,
  NavigationMenuList,
} from "../components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, ChevronDown, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { useNavigate } from "react-router-dom";
import PaginationSection from "./PaginationSection";
import { toast } from "react-hot-toast"

interface SearchFormData {
  searchTerm: string;
}

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(2)
  const { user, searchUser, searchResults, logout, isLoading, error, clearError, clearSearchResults, totalCounts, hasNext } =
    useAuthStore();

  const { control, watch, reset } = useForm<SearchFormData>({
    defaultValues: {
      searchTerm: "",
    },
  });

  const watchedSearchTerm = watch("searchTerm");
  const navigate = useNavigate();

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedSearchTerm && watchedSearchTerm.trim().length > 0) {
        // Clear previous results and errors before starting new search
        clearError();
        clearSearchResults();
        searchUser(watchedSearchTerm.trim(), currentPage, limit);
      } else {
        // Clear results and errors when search is empty
        clearError();
        clearSearchResults();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedSearchTerm, searchUser, clearError, clearSearchResults, currentPage]);

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    reset();
    clearError();
    clearSearchResults();
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Logging out.");
    navigate("/");
  }

  const handlePageChange = async (page: number) => {
    setCurrentPage(page)
  }

  return (
    <header className="sticky top-0 z-50 w-screen bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
        {/* Left: Search with custom Sheet + Overlay */}
        <Sheet modal={false} open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <SheetTrigger asChild>
            <div className="relative">
              <Button variant="default" size="sm">
                <Search className="h-4 w-4" />
                Search User
              </Button>
            </div>
          </SheetTrigger>

          {/* Full-screen blur overlay */}
          {isSearchOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
              onClick={handleSearchClose}
            />
          )}

          <SheetContent side="left" className="z-50 p-5 w-96">
            <SheetTitle>Search User</SheetTitle>
            <SheetDescription className="mb-4">
              Find users to chat with
            </SheetDescription>

            <div className="space-y-4">
              <Controller
                name="searchTerm"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search User"
                        className="pl-8"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </div>
                    {fieldState.error && (
                      <p className="text-red-500 text-sm ml-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {isLoading && (
                <div className="text-center py-4">
                  <Loader />
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}

              {watchedSearchTerm &&
                watchedSearchTerm.trim().length > 0 &&
                searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-slate-700">Results:</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={(user as any).id ?? (user as any)._id}
                          className="flex items-center gap-3 p-3 rounded-xl border bg-white hover:bg-sky-50/60 transition-colors shadow-sm hover:shadow-md"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.pic} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">Add</Button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <PaginationSection
                        totalCounts={totalCounts}
                        hasNext={hasNext}
                        currentPage={currentPage}
                        itemsPerPage={limit}
                        handlePageChange={handlePageChange}
                      />
                    </div>
                  </div>
                )}

              {watchedSearchTerm &&
                watchedSearchTerm.trim().length > 0 &&
                searchResults.length === 0 &&
                !isLoading && (
                  <div className="text-center py-4">
                    <p className="text-slate-500">No users found</p>
                  </div>
                )}

              {!watchedSearchTerm || watchedSearchTerm.trim().length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">
                    Start typing to search for users
                  </p>
                </div>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>

        {/* Center: Brand */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <span className="text-slate-700 text-2xl font-semibold">
              Smart Talk
            </span>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-1 cursor-pointer bg-gray-100 px-2 py-1 rounded-lg">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.pic} alt="@user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-42">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
