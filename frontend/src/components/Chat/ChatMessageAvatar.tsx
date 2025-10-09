import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatMessageAvatarProps {
  name?: string;
  pic?: string;
  size?: string;
  isOwn?: boolean;
}

const ChatMessageAvatar = ({ name, pic, size = "h-12 w-12", isOwn }: ChatMessageAvatarProps) => {
  return (
    <div className={`${isOwn ? "ml-1" : "ml-1 mr-1"}`}>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Avatar className={`${size} cursor-pointer`}>
            <AvatarImage src={pic} alt={name || "User"} />
            <AvatarFallback>
              {name?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side={isOwn ? "left" : "right"}>
          <p>{name || (isOwn ? "You" : "Unknown User")}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ChatMessageAvatar;
