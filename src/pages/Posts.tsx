
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import JournalView from "@/components/journal/JournalView";
import { Loader2, MessageCircle, Heart, BookOpen } from "lucide-react";

interface JournalPost {
  id: string;
  title: string;
  content: any;
  user_id: string;
  created_at: string;
  updated_at: string;
  username?: string;
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
}

const Posts = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState<JournalPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewingJournal, setViewingJournal] = useState<JournalPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      
      // Check if user is admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, username')
        .eq('id', session.user.id)
        .single();
        
      setIsAdmin(profileData?.role === 'admin');
      
      // Store username in user object for comment creation
      if (session.user && profileData) {
        session.user.user_metadata = {
          ...session.user.user_metadata,
          username: profileData.username
        };
        setUser(session.user);
      }
    };
    
    checkAuth();
    loadJournals();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      } else if (session) {
        setUser(session.user);
        
        // Check admin status on auth change
        const fetchUserProfile = async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, username')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(profileData?.role === 'admin');
          
          // Store username in user object for comment creation
          if (session.user && profileData) {
            session.user.user_metadata = {
              ...session.user.user_metadata,
              username: profileData.username
            };
            setUser(session.user);
          }
        };
        
        fetchUserProfile();
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
        toast({
          title: "Failed to load journals",
          description: "Please try refreshing the page.",
          variant: "destructive"
        });
        return;
      }
      
      // Load usernames for journal authors
      const userIds = [...new Set(data.map((journal: any) => journal.user_id))];
      let usernamesMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);
          
        if (profiles) {
          usernamesMap = profiles.reduce((acc: Record<string, string>, profile: any) => {
            acc[profile.id] = profile.username || "Anonymous";
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
        username: usernamesMap[journal.user_id] || "Anonymous",
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
      
      // Get usernames for comments
      const userIds = [...new Set(data.map(comment => comment.user_id))];
      let usernamesMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);
          
        if (profiles) {
          usernamesMap = profiles.reduce((acc: Record<string, string>, profile: any) => {
            acc[profile.id] = profile.username || "Anonymous";
            return acc;
          }, {});
        }
      }
      
      const commentsWithUsernames = data.map(comment => ({
        ...comment,
        username: usernamesMap[comment.user_id] || "Anonymous"
      }));
      
      setComments(commentsWithUsernames);
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handlePostComment = async () => {
    if (!viewingJournal || !newComment.trim() || !user) return;
    
    setIsCommenting(true);
    
    try {
      // Create the comment data
      const commentData = {
        journal_id: viewingJournal.id,
        user_id: user.id,
        content: newComment.trim()
      };
      
      console.log("Posting comment with data:", commentData);
      
      const { data, error } = await supabase
        .from("comments")
        .insert(commentData)
        .select();
        
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Comment posted, response:", data);
      
      if (data && data.length > 0) {
        // Get username from user metadata or fetch it again if needed
        let username = user.user_metadata?.username;
        
        // If username not available in metadata, fetch from profiles
        if (!username) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();
            
          username = profileData?.username || "Anonymous";
        }
        
        const newCommentObj = {
          ...data[0],
          username: username
        } as Comment;
        
        console.log("Adding comment to UI:", newCommentObj);
        
        setComments([newCommentObj, ...comments]);
        setNewComment("");
        
        // Update comment count in journals list
        setJournals(journals.map(journal => 
          journal.id === viewingJournal.id 
            ? { ...journal, comments: (journal.comments || 0) + 1 } 
            : journal
        ));
        
        toast({
          title: "Comment posted",
          description: "Your comment has been added successfully."
        });
      }
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        title: "Failed to post comment",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
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
            ? { ...journal, comments: Math.max((journal.comments || 0) - 1, 0) } 
            : journal
        ));
      }
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully."
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Failed to delete comment",
        description: "There was an error deleting your comment.",
        variant: "destructive"
      });
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading journals...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Published Journals</h1>
          <p className="text-gray-600">Read and comment on community journals</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="default" onClick={() => navigate('/app')}>
              Admin Dashboard
            </Button>
          )}
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Log Out
          </Button>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto">
        {journals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No published journals found.</p>
            {isAdmin && (
              <Button onClick={() => navigate('/app')}>Create Your First Journal</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {journals.map((journal) => (
              <Card 
                key={journal.id} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setViewingJournal(journal)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{journal.title}</CardTitle>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarFallback>{journal.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span>{journal.username}</span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-500">
                  <p>Published: {formatDate(journal.updated_at)}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1 text-red-400" />
                      {journal.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1 text-blue-400" />
                      {journal.comments}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm">Read Journal</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Journal Viewing Dialog */}
      {viewingJournal && (
        <Dialog open={!!viewingJournal} onOpenChange={(open) => !open && setViewingJournal(null)}>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-0 z-50 flex flex-col items-center">
              <div className="container max-w-7xl h-full flex flex-col py-6">
                <div className="relative bg-white rounded-lg shadow-lg flex flex-col max-h-[calc(100vh-3rem)] overflow-hidden">
                  {/* Header with controls */}
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-semibold">{viewingJournal.title}</h2>
                      <p className="text-sm text-gray-500">
                        By {viewingJournal.username} · {formatDate(viewingJournal.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setViewingJournal(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content area */}
                  <div className={`flex ${isFullscreen ? 'flex-col' : 'flex-row'} h-full overflow-hidden`}>
                    {/* Journal content */}
                    <div className={`${isFullscreen ? 'h-full' : 'w-3/5'} overflow-auto p-6`}>
                      <div className="bg-journal-background p-6 rounded-lg shadow-sm min-h-[300px]">
                        <JournalView content={viewingJournal.content} />
                      </div>
                    </div>
                    
                    {/* Comments area */}
                    <div className={`${isFullscreen ? 'h-64' : 'w-2/5'} border-l overflow-auto`}>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                          <MessageCircle className="h-5 w-5 mr-2" />
                          Comments
                        </h3>
                        
                        {/* Add comment form */}
                        <div className="mb-6">
                          <Textarea 
                            placeholder="Write a comment..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                            className="resize-none mb-2"
                          />
                          <Button 
                            onClick={handlePostComment} 
                            disabled={!newComment.trim() || isCommenting}
                            className="flex items-center"
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
                        <div className="space-y-4">
                          {comments.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
                          ) : (
                            comments.map((comment) => (
                              <div key={comment.id} className="border-b pb-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                      <AvatarFallback>{comment.username?.substring(0, 2) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{comment.username || 'User'}</p>
                                      <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                                    </div>
                                  </div>
                                  
                                  {comment.user_id === user?.id && (
                                    <Button 
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="h-8 w-8 p-0"
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
                                        className="text-gray-400 hover:text-red-500"
                                      >
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                      </svg>
                                    </Button>
                                  )}
                                </div>
                                <p className="text-gray-700 ml-10">{comment.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Posts;
