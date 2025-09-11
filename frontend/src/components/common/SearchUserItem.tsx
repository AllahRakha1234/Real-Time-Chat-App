import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface SearchUserItemProps {
    user: {
        _id: string;
        name: string;
        email: string;
        pic?: string;
    };
    isInChat: boolean;
    isAdding: boolean;
    onAddUser: (userId: string) => void;
}

const SearchResultItem: React.FC<SearchUserItemProps> = ({
    user,
    isInChat,
    isAdding,
    onAddUser,
}) => {
    return (
        <div
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors shadow-sm ${isInChat
                ? "bg-green-50 border-green-300"
                : "border-primary bg-white hover:bg-sky-50/60 hover:shadow-md"
                }`}
        >
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.pic} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
            </div>

            <Button
                size="sm"
                className="text-secondary-foreground disabled:opacity-60"
                disabled={isInChat || isAdding}
                onClick={() => onAddUser(user._id)}
            >
                {isAdding ? <Loader size={80} /> : isInChat ? "In Chat" : "Add"}
            </Button>
        </div>
    );
};

export default SearchResultItem;
