import { ArrowUpIcon, BeakerIcon, ClockIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../Toast';
import AgentInfo from './ChatAgentInfo';
import RecentConversations from './ChatRecentConversations';
import RecommendedQuestions from './ChatRecommendedQuestions';
import { ChatHomePageSkeleton } from './ChatSkeletons';
import SlidingPanel from './ChatSlidingPanel';
import KnowledgeBaseDetail from './KnowledgeBaseDetail';
import NewChatPrompt from './NewChatPrompt';

function ChatHomePage({ onChatStart, selectedAgentId }) {
    const [chatDetails, setChatDetails] = useState(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userProfile } = useUser();
    const { showToast } = useToast();

    const [isAgentInfoOpen, setIsAgentInfoOpen] = useState(false);
    const [isRecentConversationsOpen, setIsRecentConversationsOpen] = useState(false);
    const [recentConversations, setRecentConversations] = useState([]);
    const [shouldLoadConversations, setShouldLoadConversations] = useState(false);

    const [hasRecentConversation, setHasRecentConversation] = useState(true);

    const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState(null);

    const fetchChatDetails = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const url = selectedAgentId
                ? `/console/api/chat/agent/${selectedAgentId}`
                : '/console/api/chat/agent';
            const response = await axios.get(url);
            setChatDetails(response.data);
            setHasRecentConversation(response.data.has_recent_conversation);
        } catch (error) {
            console.error('Failed to fetch chat details:', error);
            setError('对话内容获取失败');
            showToast('对话内容获取失败', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedAgentId, showToast]);

    useEffect(() => {
        fetchChatDetails();
    }, [fetchChatDetails]);

    const handleSendMessage = async () => {
        if (inputMessage && inputMessage.trim() !== '' && !isSubmitting) {
            setIsSubmitting(true);
            setIsWaitingForResponse(true);
            onChatStart(chatDetails.agent_info, inputMessage.trim(), null);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '上午好';
        if (hour < 18) return '下午好';
        return '晚上好';
    };

    const handleKnowledgeBaseClick = (knowledgeBaseId) => {
        setSelectedKnowledgeBaseId(knowledgeBaseId);
    };

    const handleBackFromKnowledgeBaseDetail = () => {
        setSelectedKnowledgeBaseId(null);
    };

    const handleConversationClick = useCallback(async (chatId) => {
        console.log('Conversation clicked:', chatId);
    }, []);

    const handleConversationUpdate = useCallback((updatedConversation) => {
        setRecentConversations(prevConversations =>
            prevConversations.map(conv =>
                conv.id === updatedConversation.id ? updatedConversation : conv
            )
        );
    }, []);

    const handleConversationDelete = useCallback(async (deletedConversationId) => {
        // 实现对话删除功能
        setRecentConversations(prevConversations =>
            prevConversations.filter(conv => conv.id !== deletedConversationId)
        );
    }, []);

    // Add this new state for recommended questions
    const [recommendedQuestions] = useState([
        "您能解释一下人工智能的基本原理吗？",
        "机器学习和深度学习有什么区别？",
        "如何在日常生活中应用人工智能技术？",
        "人工智能对未来就业市场有什么影响？"
    ]);

    // Add this new function to handle recommended question clicks
    const handleRecommendedQuestionClick = (question) => {
        setInputMessage(question);
        handleSendMessage();
    };

    const handleRecentConversationsClick = () => {
        setIsRecentConversationsOpen(true);
        setShouldLoadConversations(true);
    };

    if (loading) {
        return <ChatHomePageSkeleton />;
    }

    if (!hasRecentConversation) {
        return <NewChatPrompt onSelectAgent={(agentId) => {
            fetchChatDetails(agentId);
        }} setLoading={setLoading} />;
    }

    if (selectedKnowledgeBaseId) {
        return (
            <KnowledgeBaseDetail
                id={selectedKnowledgeBaseId}
                onBack={handleBackFromKnowledgeBaseDetail}
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-bg-primary">
            {/* Header */}
            <header className="flex items-center justify-end py-2 px-3 bg-bg-primary">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsAgentInfoOpen(true)}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-secondary transition-colors duration-200 group"
                        title="智能体信息"
                    >
                        <BeakerIcon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-200" />
                    </button>
                    <button
                        onClick={handleRecentConversationsClick}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg-secondary transition-colors duration-200 group"
                        title="最近会话"
                    >
                        <ClockIcon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors duration-200" />
                    </button>
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-start px-6 pt-16 pb-32">
                <div className="w-full max-w-3xl">
                    <h2 className="text-5xl font-bold mb-10 text-center text-primary">
                        {`${getGreeting()}，${userProfile?.name || '用户'}！`}
                    </h2>

                    <div className="relative mb-8">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !isSubmitting && !isWaitingForResponse) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder={`请输入您想问 ${chatDetails?.agent_info?.name || '智能助手'} 的问题...`}
                            className="w-full h-32 p-4 bg-bg-primary rounded-xl border border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 text-sm resize-none pr-12"
                            disabled={isSubmitting || isWaitingForResponse}
                        />
                        <button
                            onClick={handleSendMessage}
                            className={`absolute right-3 bottom-3 p-2 rounded-full ${isSubmitting || isWaitingForResponse || !inputMessage.trim()
                                ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-dark'
                                } transition-colors duration-200 flex items-center justify-center`}
                            disabled={isSubmitting || isWaitingForResponse || !inputMessage.trim()}
                        >
                            <ArrowUpIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 更新 RecommendedQuestions 组件的位置和样式 */}
                    <RecommendedQuestions
                        questions={recommendedQuestions}
                        onQuestionClick={handleRecommendedQuestionClick}
                    />
                </div>
            </div>

            {/* Sliding Panels */}
            <SlidingPanel
                isOpen={isAgentInfoOpen}
                onClose={() => setIsAgentInfoOpen(false)}
                title="智能体信息"
            >
                <AgentInfo
                    agentInfo={chatDetails?.agent_info}
                    onKnowledgeBaseClick={handleKnowledgeBaseClick}
                />
            </SlidingPanel>

            <SlidingPanel
                isOpen={isRecentConversationsOpen}
                onClose={() => setIsRecentConversationsOpen(false)}
                title="最近会话"
            >
                <RecentConversations
                    agentId={chatDetails?.agent_info?.id}
                    currentConversationId={null}
                    onConversationClick={handleConversationClick}
                    onConversationUpdate={handleConversationUpdate}
                    onConversationDelete={handleConversationDelete}
                    recentConversations={recentConversations}
                    setRecentConversations={setRecentConversations}
                    shouldLoadConversations={shouldLoadConversations}
                />
            </SlidingPanel>
        </div>
    );
}

export default ChatHomePage;
