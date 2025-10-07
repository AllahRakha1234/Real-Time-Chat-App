import ScrollableFeed from "react-scrollable-feed";
import type { Message } from "@/types/message";
import ChatMessageAvatar from "@/components/Chat/ChatMessageAvatar";

const MessageList = ({
  messages,
  currentUser,
}: {
  messages: Message[];
  currentUser: any;
}) => {
  return (
    <div className="h-full w-full">
      <ScrollableFeed forceScroll={true} className="flex flex-col space-y-2 custom-scrollbar">
        {messages.map((msg, index) => {
          const isOwn = msg.sender._id === currentUser._id;

          // Check if this message is the last one in a sequence from the same sender
          const nextMessage = messages[index + 1];
          const isLastFromSender =
            !nextMessage || nextMessage.sender._id !== msg.sender._id;

          return (
            <div
              key={msg._id}
              className={`flex items-end mx-1 ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar on left for other users */}
              {!isOwn && isLastFromSender && (
                <ChatMessageAvatar
                  name={msg.sender.name}
                  pic={msg.sender.pic}
                  isOwn={false}
                />
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-1 ${
                  isOwn ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}
                  ${isLastFromSender ? (isOwn ? "rounded-br-none" : "rounded-bl-none") : ""}
                  ${!isLastFromSender ? (isOwn ? "mr-[55px]" : "ml-[55px]") : ""}
                  `
                }
              >
                <p>{msg.content}</p>
                <span className="text-xs opacity-70 block">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Avatar on right for own messages */}
              {isOwn && isLastFromSender && (
                <ChatMessageAvatar
                  name={currentUser.name}
                  pic={currentUser.pic}
                  isOwn={true}
                />
              )}
            </div>
          );
        })}
      </ScrollableFeed>
    </div>
  );
};

export default MessageList;