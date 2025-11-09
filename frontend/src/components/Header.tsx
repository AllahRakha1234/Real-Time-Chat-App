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
import { ChevronDown, Search, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store"
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { useNavigate } from "react-router-dom";
import PaginationSection from "./PaginationSection";
import { toast } from "react-hot-toast"
import useDebounce from "@/hooks/useDebounce";
import SearchResultItem from "./common/SearchUserItem";
import NotificationsMenu from "./Notifications/NotificationsMenu";
import ProfileModal from "@/components/modals/ProfileModal";


const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(5)
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  // useState for searchTerm instead of useForm Controller
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { user, searchUser, searchResults, logout, isLoading, error, clearError, clearSearchResults, totalCounts, hasNext } = useAuthStore();
  const { createOrAccessChat, getChatUserIds } = useChatStore();
  const existingChatUserIds = new Set(getChatUserIds(user?._id ?? ""));

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();

  // Debounced search effect (same behavior as before)
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 0) {
      clearError();
      clearSearchResults();
      searchUser(debouncedSearchTerm.trim(), currentPage, limit);
    } else {
      clearError();
      clearSearchResults();
    }
  }, [debouncedSearchTerm, searchUser, clearError, clearSearchResults, currentPage, limit]);


  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
    clearError();
    clearSearchResults();
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Logging out.");
    navigate("/");
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageLimitChange = (pageLimit: number) => {
    setLimit(pageLimit)
  }

  const handleAddUserInChat = async (userId: string) => {
    try {
      setAddingUserId(userId); // show loader on button
      const result = await createOrAccessChat(userId);

      if (result.success && result.chat) {
        toast.success("User added to chat 🚀");
      } else {
        toast.error(result.error || "Failed to add user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setAddingUserId(null);
    }
  };

  return (
    <header className="sticky top-2 z-50 w-[92vw] bg-white rounded-full mx-auto px-5">
      <div className="mx-auto flex h-[8vh] max-w-7xl items-center justify-between">
        {/* Left: Search with custom Sheet + Overlay */}
        <Sheet
          modal={false}
          open={isSearchOpen}
          onOpenChange={(open) => {
            if (!open) handleSearchClose(); // centralize close logic
            else setIsSearchOpen(true);
          }}
        >
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
              {/* Replaced Controller with controlled Input using useState */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search User"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                  />
                </div>
              </div>

              {isLoading && (
                <div className="mt-[30vh] text-center py-4">
                  <Loader />
                </div>
              )}

              {error && (
                <div className="bg-red-50 mt-[30vh] border border-red-200 rounded-md p-3">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}

              {searchTerm &&
                searchTerm.trim().length > 0 &&
                searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-primary-foreground/90">Results:</h3>
                    <div className="max-h-[60vh] overflow-y-scroll space-y-2 custom-scrollbar">
                      {searchResults.map((user) => (
                        <SearchResultItem
                          key={user._id}
                          user={user}
                          isInChat={existingChatUserIds.has(user._id)}
                          isAdding={addingUserId === user._id}
                          onAddUser={handleAddUserInChat}
                        />
                      ))}
                    </div>
                    <div className="mt-3">
                      <PaginationSection
                        totalCounts={totalCounts}
                        hasNext={hasNext}
                        currentPage={currentPage}
                        itemsPerPage={limit}
                        showLimitRangeSelect={true}
                        handlePageChange={handlePageChange}
                        handlePageLimitChange={handlePageLimitChange}
                      />
                    </div>
                  </div>
                )}

              {searchTerm &&
                searchTerm.trim().length > 0 &&
                searchResults.length === 0 &&
                !isLoading && (
                  <div className="flex flex-col items-center justify-center mt-[30vh] space-y-1 ">
                    <User size={60} className="text-slate-400" />
                    <p className="text-lg font-medium text-slate-500">No users found</p>
                  </div>
                )}

              {!searchTerm || searchTerm.trim().length === 0 ? (
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
            <span className="text-slate-800 text-2xl font-semibold">
              Smart Talk
            </span>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right: Notifications + User menu */}
        <div className="flex items-center gap-2">
          <NotificationsMenu />
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
            <DropdownMenuContent align="end" className="w-42 border border-gray-300">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsProfileModalOpen(true)}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600 cursor-pointer">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={user}
      />
    </header>
  );
};

export default Header;