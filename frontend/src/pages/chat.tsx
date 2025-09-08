import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import ChatUser from "@/components/Chat/ChatUser";
import { useChatStore } from "@/store/chat.store";

const ChatPage = () => {
  const { chats, isLoading, error } = useChatStore();

  return (
    <div className="h-[92vh] w-screen px-20 pt-6 overflow-hidden">
      <div className="flex h-full flex-row gap-4">
        {/* Sidebar */}
        <div className="w-2/6 h-[85vh] bg-white p-3 rounded-md shadow-sm flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h1 className="text-2xl font-medium my-auto">My Chats</h1>
            <Button
              className="bg-secondary hover:bg-secondary/80 gap-2"
              onClick={() => {
                // TODO: open modal to create new group chat
              }}
            >
              <span>New Group</span>
              <CirclePlus size={18} />
            </Button>
          </div>

          {/* Chats Section (scrollable only for users) */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {isLoading && <p className="text-gray-500">Loading chats...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
              <ChatUser chats={chats ?? []} isLoading={isLoading} error={error} />
            )}
          </div>
        </div>


        {/* Main Chat Window */}
        <div className="flex-1 min-h-[85vh] bg-gray-100 rounded-md shadow-sm flex items-center justify-center">
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      </div>
    </div >
  );
};

export default ChatPage;
