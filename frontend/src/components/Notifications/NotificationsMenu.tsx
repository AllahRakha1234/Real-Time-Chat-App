import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/store/notification.store";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/types/message";
import { useChatStore } from "@/store/chat.store";

const NotificationsMenu = () => {
  const { setSelectedChat } = useChatStore();
  const { notifications, removeNotification, clearAllNotifications } = useNotificationStore();

  const handleClick = (notif: Message) => {
    setSelectedChat(notif.chat);
    removeNotification(notif._id);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className="relative cursor-pointer">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <Badge className="absolute bottom-4 right-0.5 bg-red-500 text-white text-[10px] px-1 py-0">
                {notifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 border border-gray-200 shadow-md p-0">
        <DropdownMenuLabel className="px-3 py-2 flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <button
              className="text-xs text-primary hover:underline"
              onClick={clearAllNotifications}
            >
              Clear all
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="max-h-[320px]">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const isGroupChat = notif.chat?.isGroupChat;
              const chatName = notif.chat?.chatName || "Unknown Chat";
              const senderName = notif.sender?.name || "Someone";

              return (
                <DropdownMenuItem
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className="cursor-pointer hover:bg-slate-100 px-3 py-2"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      {!isGroupChat && notif.sender?.pic ? (
                        <AvatarImage
                          src={notif.sender.pic}
                          alt={senderName}
                        />
                      ) : null}
                      <AvatarFallback>
                        {isGroupChat
                          ? chatName[0]?.toUpperCase()
                          : senderName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col overflow-hidden">
                      {isGroupChat ? (
                        <>
                          <span className="font-semibold text-sm truncate">
                            {chatName}
                          </span>
                          <span className="text-xs text-gray-600 truncate">
                            {senderName}: {notif.content}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-sm truncate">
                            {senderName}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">
                            {notif.content}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="text-center text-lg text-gray-500 text-sm py-4">
              No new notifications
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;