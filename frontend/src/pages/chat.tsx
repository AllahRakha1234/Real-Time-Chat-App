import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CirclePlus, MessageCirclePlus } from "lucide-react";
import ChatUser from "@/components/Chat/ChatUser";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import GroupModal from "@/components/modals/NewGroupModal";
import { Loader } from "@/components/ui/loader";
import ChatTopbar from "@/components/Chat/ChatTopbar";
import { type Chat } from "@/types/chat";
import ProfileModal from "@/components/modals/ProfileModal";

const ChatPage = () => {
  const { user } = useAuthStore();
  const { chats, fetchChats, isLoading, error } = useChatStore();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null); // lift state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  return (
    <div className="h-[92vh] w-screen px-16 pt-6 overflow-hidden">
      <div className="flex h-full flex-row gap-4">
        {/* Sidebar */}
        <div className="w-2/6 h-[85vh] bg-white rounded-md shadow-sm flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mt-1 py-2 px-6 flex-shrink-0 border-b-2 border-primary rounded-xl">
            <h1 className="text-2xl font-medium my-auto">My Chats</h1>
            <Button
              variant="simple"
              className="bg-secondary hover:bg-secondary/80 gap-2"
              onClick={() => setIsGroupModalOpen(true)}
            >
              <span>New Group</span>
              <CirclePlus size={18} />
            </Button>
          </div>

          {/* Chats Section */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {isLoading && (
              <div className="flex h-full items-center justify-center">
                <Loader />
              </div>
            )}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
              <ChatUser
                chats={chats ?? []}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />
            )}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 h-[85vh] bg-white rounded-md shadow-sm flex flex-col">
          {selectedChat ? (
            <>
              {/* 🔹 Topbar with name + eye button */}
              <ChatTopbar
                chat={selectedChat}
                onOpenProfile={() => setIsProfileModalOpen(true)}
              />
              {/* Messages will go here */}
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Messages UI
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <p className="text-2xl text-gray-500">Select a chat to start messaging</p>
              <MessageCirclePlus className="text-gray-400" size={80} />
            </div>
          )}
        </div>
      </div>

      {/* Group Modal */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        chat={selectedChat}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default ChatPage;
