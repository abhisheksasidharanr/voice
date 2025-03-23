"use client";
import { Suspense, useEffect, useState } from "react";
import { App } from "./components/App";
import Intelligence from "./components/Intelligence";
import { stsConfig } from "./lib/constants";
import {
  isConversationMessage,
  useVoiceBot,
  VoiceBotStatus,
} from "./context/VoiceBotContextProvider";
import { CaretIcon } from "./components/icons/CaretIcon";
import { withBasePath } from "./utils/deepgramUtils";
import Conversation from "./components/Conversation";
import VoiceSelector from "./components/VoiceSelector/VoiceSelector";
import { isMobile } from "react-device-detect";
import MobileMenu from "./components/MobileMenu";
import Latency from "./components/Latency";
import Header from "./components/Header";
import { useDeepgram } from "./context/DeepgramContextProvider";
import BehindTheScenes from "./components/BehindTheScenes";
import Registration from "./components/Registration";
import Farmers from "./components/Farmers";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




export default function Home() {
  const { messages, status } = useVoiceBot();
  const { rateLimited } = useDeepgram();
  const [conversationOpen, setConversationOpen] = useState(false);
  const [behindTheScenesOpen, setBehindTheScenesOpen] = useState(false);
  const [farmersList, setFarmersList] = useState([]);
  const [registrationDetails, setRegistrationDetails] = useState(null);



  const toggleConversation = () => setConversationOpen(!conversationOpen);

  const has4ConversationMessages = messages.filter(isConversationMessage).length > 3;



  const fetchData = async ()=>{    
    const res = await axios.get('https://doc-ai.verbatdemos.com/api/list.php');
    setFarmersList(res?.data?.data);
    
  }

  useEffect(() => {
    
    fetchData();
  }, []);

  return (
    <main className="h-dvh flex flex-col justify-between pb-12 md:pb-0">
      <div className="flex flex-col flex-grow">
        <div className="h-[20vh] md:h-auto flex-shrink-0 ">
          <Suspense>
            <Header logoHref={withBasePath("/")} />
          </Suspense>
        </div>

        <div className="flex flex-grow relative">
          {/* Main Content */}
          <div className="flex-1 flex justify-center items-start md:items-center">
            <div className="md:h-full flex flex-col min-w-[80vw] md:min-w-[30vw] max-w-[80vw] justify-center border border-[#1e1b1b]">
              <div className="flex md:order-last md:mt-4 justify-center">
                <Intelligence />
              </div>
              <Suspense>
                <App
                  defaultStsConfig={stsConfig}
                  className="flex-shrink-0 h-auto items-end"
                  requiresUserActionToInitialize={isMobile}
                  fetchData={fetchData}
                  setRegistrationDetails={setRegistrationDetails}
                />
              </Suspense>
              {/* Desktop Conversation Toggle */}
              {has4ConversationMessages ? (
                <div className="hidden md:flex justify-center mt-auto mb-4 md:mt-4 text-gray-350">
                  <button className="text-[14px] text-gray-350 py-4" onClick={toggleConversation}>
                    See full conversation <CaretIcon className="rotate-90 h-4 w-4" />
                  </button>
                </div>
              ) : null}

              {/* Speech Bubbles */}
              {!has4ConversationMessages &&
                !rateLimited &&
                status !== VoiceBotStatus.SLEEPING &&
                status !== VoiceBotStatus.NONE && (
                  <div>
                    {/* Desktop */}
                    <div className="hidden md:flex justify-center text-gray-450">Try saying:</div>
                    
                    {/* Mobile */}
                    <div className="flex md:hidden justify-center text-gray-450 mt-2">
                      Try saying:
                    </div>
                    
                  </div>
                )}
            </div>
            <div className="md:h-full flex flex-col min-w-[80vw] md:min-w-[30vw] max-w-[80vw] justify-top bg-[#0f0f0f]">
                <div className="h-10 leading-10 font-favorit align-middle text-gray-25 text-center bg-[#171717]">
                  Registration Form
                </div>
                <Registration
                  data = {registrationDetails}
                />
            </div>
            <div className="md:h-full flex flex-col min-w-[80vw] md:min-w-[30vw] max-w-[80vw] justify-top border border-[#1e1b1b]">
                <div className="h-10 leading-10 font-favorit align-middle text-gray-25 text-center border-b border-[#474545]">
                  All Farmers
                </div>
                {farmersList?<Farmers
                  farmerlist = {farmersList}
                  fetchData = {fetchData}
                />:''}
                
            </div>
          </div>

          {/* Right Panel (Desktop only) */}
          <div
            className="hidden md:block p-6 pl-0 max-h-screen overflow-hidden position-absolute absolute left-0 bottom-0"
            style={{ zIndex: 11 }}
          >
            <div className="flex flex-col gap-4">
              {behindTheScenesOpen ? (
                <BehindTheScenes onClose={() => setBehindTheScenesOpen(false)} />
              ) : (
                <>
                  <button
                    className="w-full px-4 py-3 bg-gray-850 hover:bg-gray-800 text-gray-25 rounded-lg transition-colors flex items-center gap-2"
                    onClick={() => setBehindTheScenesOpen(true)}
                  >
                    
                    <span className="font-medium flex-grow text-left">Phases</span>
                    <CaretIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation */}
      {conversationOpen && <Conversation toggleConversation={toggleConversation} />}

      {/* Desktop Bottom Stuff */}
      <div className={`hidden md:flex z-0 absolute bottom-0 left-8 right-[320px] mb-8`}>
        
        <Suspense>
          <Latency />
        </Suspense>
      </div>

      {/* Mobile Bottom Stuff */}
      <div className={`flex flex-col z-0 items-center md:hidden`}>
        {has4ConversationMessages && (
          <div className="flex justify-center mt-auto text-gray-350">
            <button className="text-sm text-gray-350 pb-8" onClick={toggleConversation}>
              See full conversation <CaretIcon className="rotate-90 h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile Voice Selector */}
      <Suspense>
        <VoiceSelector
          className={`absolute md:hidden bottom-0 left-0 pb-[16px] pl-[16px]`}
          collapsible
        />
        <MobileMenu className="fixed md:hidden bottom-4 right-4 text-gray-200" />
      </Suspense>
      <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
    </main>
  );
}
