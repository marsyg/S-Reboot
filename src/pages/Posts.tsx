import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog } from "../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import JournalView from "../components/journal/JournalView";
import { Loader2, MessageCircle, Heart, BookOpen, Share2, X, Expand, ChevronRight, Calendar, User, Edit3 } from "lucide-react";
import { toast } from "../components/ui/sonner";
import { motion, AnimatePresence } from "framer-motion";

interface JournalPost {
  id: string;
  title: string;
  content: any;
  user_id: string;
  created_at: string;
  updated_at: string;
  username?: string;
  full_name?: string;
  likes?: number;
  comments?: number;
}

interface Comment {
  id: string;
  journal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  full_name?: string;
}

const Posts = () => {
  const navigate = useNavigate();
  const { toast: useToastNotification } = useToast();
  const [journals, setJournals] = useState<JournalPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [viewingJournal, setViewingJournal] = useState<JournalPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      console.log("Current user:", session.user);
    };
    
    checkAuth();
    loadJournals();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      } else if (session) {
        setUser(session.user);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Load journals when viewing journal changes
  useEffect(() => {
    if (viewingJournal) {
      loadComments(viewingJournal.id);
    }
  }, [viewingJournal]);

  const loadJournals = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .order("updated_at", { ascending: false });
        
      if (error) {
        toast.error("Failed to load journals. Please try refreshing the page.");
        console.error("Error loading journals:", error);
        return;
      }
      
      // Load usernames and full names for journal authors
      const userIds = [...new Set(data.map((journal: any) => journal.user_id))];
      let usersMap: Record<string, { username?: string, full_name?: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .in("id", userIds);
          
        if (profiles) {
          usersMap = profiles.reduce((acc: Record<string, any>, profile: any) => {
            acc[profile.id] = {
              username: profile.username || "Anonymous",
              full_name: profile.full_name || "Anonymous User"
            };
            return acc;
          }, {});
        }
      }
      
      // Count comments for each journal
      const commentsCountPromises = data.map(async (journal: any) => {
        const { count, error } = await supabase
          .from("comments")
          .select("id", { count: 'exact', head: true })
          .eq("journal_id", journal.id);
          
        return { 
          journalId: journal.id, 
          count: error ? 0 : (count || 0) 
        };
      });
      
      const commentsResults = await Promise.all(commentsCountPromises);
      const commentsCountMap = commentsResults.reduce((acc: Record<string, number>, result) => {
        acc[result.journalId] = result.count;
        return acc;
      }, {});
      
      // Format journals with additional data
      const formattedJournals = data.map((journal: any) => ({
        ...journal,
        username: usersMap[journal.user_id]?.username || "Anonymous",
        full_name: usersMap[journal.user_id]?.full_name || "Anonymous User",
        likes: Math.floor(Math.random() * 50), // Placeholder for demo
        comments: commentsCountMap[journal.id] || 0,
      }));
      
      setJournals(formattedJournals);
    } catch (error) {
      console.error("Error loading journals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (journalId: string) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("journal_id", journalId)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error loading comments:", error);
        return;
      }
      
      // Get usernames and full names for comments
      const userIds = [...new Set(data.map(comment => comment.user_id))];
      let usersMap: Record<string, { username?: string, full_name?: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .in("id", userIds);
          
        if (profiles) {
          usersMap = profiles.reduce((acc: Record<string, any>, profile: any) => {
            acc[profile.id] = {
              username: profile.username || "Anonymous",
              full_name: profile.full_name || "Anonymous User"
            };
            return acc;
          }, {});
        }
      }
      
      const commentsWithUserInfo = data.map(comment => ({
        ...comment,
        username: usersMap[comment.user_id]?.username || "Anonymous",
        full_name: usersMap[comment.user_id]?.full_name || "Anonymous User"
      }));
      
      setComments(commentsWithUserInfo);
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handlePostComment = async () => {
    if (!viewingJournal || !newComment.trim() || !user) return;
    
    setIsCommenting(true);
    
    try {
      const commentData = {
        journal_id: viewingJournal.id,
        user_id: user.id,
        content: newComment.trim()
      };
      
      const { data, error } = await supabase
        .from("comments")
        .insert(commentData)
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get user's full name from metadata
        const full_name = user.user_metadata?.full_name || "Anonymous User";
        const username = user.user_metadata?.username || "Anonymous";
        
        const newCommentObj = {
          ...data[0],
          username,
          full_name
        } as Comment;
        
        setComments([newCommentObj, ...comments]);
        setNewComment("");
        
        // Update comment count in journals list
        setJournals(journals.map(journal => 
          journal.id === viewingJournal.id 
            ? { ...journal, comments: (journal.comments || 0) + 1 } 
            : journal
        ));
        
        toast.success("Your comment has been added successfully.");
      }
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment. Please try again later.");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setComments(comments.filter(comment => comment.id !== commentId));
      
      // Update comment count in journals list
      if (viewingJournal) {
        setJournals(journals.map(journal => 
          journal.id === viewingJournal.id 
            ? { ...journal, comments: (journal.comments || 0) - 1 } 
            : journal
        ));
      }
      
      toast.success("Your comment has been deleted successfully.");
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment. There was an error.");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, 
        duration: 0.5,
        ease: [0.1, 0.25, 0.3, 1]
      }
    })
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <h3 className="text-xl font-medium text-indigo-700 mb-2">Loading journals</h3>
          <p className="text-gray-500">Please wait while we fetch the latest posts</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Published Journals
          </h1>
          <p className="text-gray-600 text-lg">Join the conversation and explore creative thoughts</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm hover:shadow transition-all duration-200 font-medium"
          >
            <User className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.header>
      
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {journals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100"
            >
              <BookOpen className="h-16 w-16 mx-auto text-indigo-300 mb-6" />
              <h3 className="text-2xl font-medium text-gray-900 mb-3">No published journals found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">Be the first to share your thoughts with the community!</p>
            
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {journals.map((journal, index) => (
                <motion.div
                  key={journal.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUpVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group cursor-pointer"
                  onClick={() => setViewingJournal(journal)}
                  onMouseEnter={() => setHoveredCardId(journal.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  <Card className="relative h-full flex flex-col border-indigo-100 overflow-hidden transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:bg-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-purple-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                              {journal.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                              {journal.full_name || journal.username}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(journal.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl transition-colors duration-300 group-hover:text-indigo-700">
                        {journal.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-grow relative z-10">
                      <div className="text-gray-600 mt-2 prose-sm line-clamp-3 group-hover:text-gray-800 transition-colors duration-300">
                        {typeof journal.content === 'string' 
                          ? journal.content 
                          : journal.content?.content?.[0]?.content?.[0]?.text || "No preview available"}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0 border-t border-gray-100 mt-auto relative z-10">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex gap-4">
                          <div className="flex items-center text-pink-500 transition-transform duration-200 group-hover:scale-110">
                            <Heart className={`h-4 w-4 mr-1 ${hoveredCardId === journal.id ? 'animate-pulse' : ''}`} />
                            <span className="text-sm font-medium">{journal.likes}</span>
                          </div>
                          
                          <div className="flex items-center text-blue-500 transition-transform duration-200 group-hover:scale-110">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{journal.comments}</span>
                          </div>
                        </div>
                        
                        <span className="text-xs text-gray-500 flex items-center group-hover:text-indigo-600 transition-colors duration-300">
                          Read more
                          <ChevronRight className="h-4 w-4 ml-1 transform transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Journal Viewing Dialog */}
      <AnimatePresence>
        {viewingJournal && (
          <Dialog open={!!viewingJournal} onOpenChange={(open) => !open && setViewingJournal(null)}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="fixed inset-0 z-50 flex flex-col items-center p-4 sm:p-6"
              >
                <div className="container max-w-7xl h-full flex flex-col">
                  <div className="relative bg-white rounded-xl shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden border border-indigo-100">
                    {/* Header with controls */}
                    <div className="p-4 border-b bg-white/90 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                      <div>
                        <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {viewingJournal.title}
                        </h2>
                        <p className="text-sm text-gray-500">
                          By {viewingJournal.full_name || viewingJournal.username} · {formatDate(viewingJournal.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
                        >
                          <Expand className="h-4 w-4 mr-2" />
                          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setViewingJournal(null)}
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Close
                        </Button>
                      </div>
                    </div>
                    
                    {/* Content area */}
                    <div className={`flex ${isFullscreen ? 'flex-col' : 'flex-row'} h-full overflow-hidden`}>
                      {/* Journal content */}
                      <div className={`${isFullscreen ? 'h-full' : 'w-3/5'} overflow-auto p-6`}>
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-sm min-h-[300px] border border-gray-100"
                        >
                          <JournalView content={viewingJournal.content} />
                        </motion.div>
                      </div>
                      
                      {/* Comments area */}
                      <div className={`${isFullscreen ? 'h-64' : 'w-2/5'} border-l overflow-auto bg-white/80 backdrop-blur-sm`}>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className="p-4"
                        >
                          <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
                            <MessageCircle className="h-5 w-5 mr-2 text-indigo-500" />
                            Comments
                          </h3>
                          
                          {/* Add comment form */}
                          <div className="mb-6">
                            <Textarea 
                              placeholder="Share your thoughts about this journal..." 
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={3}
                              className="resize-none mb-2 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300"
                            />
                            <Button 
                              onClick={handlePostComment} 
                              disabled={!newComment.trim() || isCommenting}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm hover:shadow transition-all duration-300"
                            >
                              {isCommenting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Posting...
                                </>
                              ) : 'Post Comment'}
                            </Button>
                          </div>
                          
                          {/* Comments list */}
                          <AnimatePresence>
                            <div className="space-y-4">
                              {comments.length === 0 ? (
                                <motion.p 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-center text-gray-500 py-6 border border-dashed border-gray-200 rounded-lg"
                                >
                                  No comments yet. Be the first to comment!
                                </motion.p>
                              ) : (
                                <motion.div className="space-y-4">
                                  {comments.map((comment, i) => (
                                    <motion.div 
                                      key={comment.id} 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: i * 0.05 }}
                                      className="border-b pb-4 hover:bg-white/90 transition-colors duration-300 rounded-lg p-3"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center">
                                          <Avatar className="h-8 w-8 mr-2 ring-2 ring-white shadow-sm">
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                                              {(comment.full_name || comment.username)?.substring(0, 2) || 'U'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium text-gray-800">{comment.full_name || comment.username}</p>
                                            <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                                          </div>
                                        </div>
                                        
                                        {comment.user_id === user?.id && (
                                          <Button 
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                                          >
                                            <svg 
                                              xmlns="http://www.w3.org/2000/svg" 
                                              width="16" 
                                              height="16" 
                                              viewBox="0 0 24 24" 
                                              fill="none" 
                                              stroke="currentColor" 
                                              strokeWidth="2" 
                                              strokeLinecap="round" 
                                              strokeLinejoin="round" 
                                              className="text-gray-400"
                                            >
                                              <path d="M3 6h18"></path>
                                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                            </svg>
                                          </Button>
                                        )}
                                      </div>
                                      <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                        className="text-gray-700 ml-10"
                                      >
                                        {comment.content}
                                      </motion.p>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Posts;