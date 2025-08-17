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

interface SearchFormData {
  searchTerm: string;
}

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { searchUser, searchResults, isLoading, error, clearError } =
    useAuthStore();

  const { control, handleSubmit, watch, reset } = useForm<SearchFormData>({
    defaultValues: {
      searchTerm: "",
    },
  });

  const watchedSearchTerm = watch("searchTerm");

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedSearchTerm && watchedSearchTerm.trim().length > 0) {
        searchUser(watchedSearchTerm.trim());
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedSearchTerm, searchUser]);

  const onSubmit = async (data: SearchFormData) => {
    if (data.searchTerm.trim()) {
      await searchUser(data.searchTerm.trim());
    }
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    reset();
    clearError();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-around">
        {/* Left: Search opens drawer */}
        <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <SheetTrigger asChild>
            <div className="relative w-64 sm:w-80">
              <Button variant="default" size="sm">
                <Search className="h-4 w-4" />
                Search User
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-5 w-96">
            <SheetTitle>Search User</SheetTitle>
            <SheetDescription className="mb-4">
              Find users to chat with
            </SheetDescription>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              {/* Search Results */}
              {isLoading && (
                <div className="text-center py-4">
                  <p className="text-slate-500">Searching...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-700">Results:</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.pic} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
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

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearchClose}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  Search
                </Button>
              </div>
            </form>
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

        {/* Right: Bell + User menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" alt="@user" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
export default Header;
