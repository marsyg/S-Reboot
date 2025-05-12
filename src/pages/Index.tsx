
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Journal from "@/components/Journal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, MessageCircle, Share2, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JournalCard {
  id: string;
  title: string;
  lastEdited: Date;
  user_id?: string;
  username?: string;
  published?: boolean;
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

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [journals, setJournals] = useState<JournalCard[]>([]);
  const [activeJournal, setActiveJournal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  
  useEffect(() => {
    // Check authentication and load journals
    const checkAuthAndLoadJournals = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }
      
      setUser(session.user);
      
      // Load journals from Supabase
      const { data, error } = await supabase
        .from("journals")
        .select("*")
        .order("updated_at", { ascending: false });
        
      if (error) {
        console.error("Error loading journals:", error);
        toast({
          title: "Failed to load journals",
          description: "Please try refreshing the page.",
          variant: "destructive"
        });
      } else {
        // Transform data to match our JournalCard interface
        const formattedJournals = data.map((journal: any) => ({
          id: journal.id,
          title: journal.title,
          lastEdited: new Date(journal.updated_at),
          user_id: journal.user_id,
          published: true,
          likes: Math.floor(Math.random() * 50), // Placeholder for now
          comments: Math.floor(Math.random() * 20), // Placeholder for now
        }));
        
        setJournals(formattedJournals);
      }
      
      setIsLoading(false);
    };
    
    checkAuthAndLoadJournals();
    
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
  }, [navigate, toast]);
  
  useEffect(() => {
    // Load comments if a journal is active
    const loadComments = async () => {
      if (!activeJournal) return;
      
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("journal_id", activeJournal)
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error("Error loading comments:", error);
        } else if (data) {
          const typedComments: Comment[] = data as unknown as Comment[];
          setComments(typedComments);
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    };
    
    loadComments();
  }, [activeJournal]);
  
  const createNewJournal = () => {
    const newJournal = {
      id: uuidv4(),
      title: `Journal ${journals.length + 1}`,
      lastEdited: new Date(),
      user_id: user?.id
    };
    setJournals([...journals, newJournal]);
    setActiveJournal(newJournal.id);
  };
  
  const handlePostComment = async () => {
    if (!activeJournal || !newComment.trim() || !user) return;
    
    setIsCommenting(true);
    
    try {
      // Create the new comment object
      const commentData = {
        journal_id: activeJournal,
        user_id: user.id,
        content: newComment.trim()
      };
      
      const { data, error } = await supabase
        .from("comments")
        .insert(commentData)
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Add the new comment to the list
        const newCommentObj = data[0] as unknown as Comment;
        setComments([newCommentObj, ...comments]);
        setNewComment("");
        
        toast({
          title: "Comment posted",
          description: "Your comment has been added successfully."
        });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Failed to post comment",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsCommenting(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading your journals...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Flowy Scribe</h1>
          <p className="text-gray-600">Your nested journaling workspace</p>
        </div>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>
          Log Out
        </Button>
      </header>
      
      {activeJournal ? (
        <div className="max-w-7xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveJournal(null)}
              className="hover:scale-105 transition-transform"
            >
              Back to All Journals
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
          
          {/* Journal Editor */}
          <Journal 
            initialTitle={journals.find(j => j.id === activeJournal)?.title || "My Journal"} 
          />
          
          {/* Comments Section */}
          <div className="mt-8 bg-white rounded-lg shadow p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Comments
            </h2>
            
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
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 animate-fade-in">
                    <div className="flex items-center mb-2">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{comment.username?.substring(0, 2) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{comment.username || 'User'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Journals</h2>
            <Button 
              onClick={createNewJournal}
              className="hover:scale-105 transition-transform"
            >
              New Journal
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {journals.map((journal, index) => (
              <Card 
                key={journal.id} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-fade-in"
                onClick={() => setActiveJournal(journal.id)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{journal.title}</span>
                    {journal.user_id === user?.id && (
                      <Edit className="h-4 w-4 text-gray-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-500 pb-2">
                  <p>Last edited: {formatDate(journal.lastEdited)}</p>
                  {journal.published && (
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
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveJournal(journal.id);
                    }}
                    className="hover:scale-105 transition-transform"
                  >
                    Open
                  </Button>
                  
                  {journal.user_id === user?.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hover:scale-105 transition-transform"
                    >
                      Share
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
            
            <Card 
              className="border-dashed border-2 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-[200px] animate-fade-in hover:bg-gray-50 transform hover:-translate-y-1"
              onClick={createNewJournal}
              style={{ animationDelay: `${journals.length * 50}ms` }}
            >
              <div className="text-4xl text-gray-400 mb-2 transition-transform hover:scale-110">+</div>
              <div className="text-gray-500">Create New Journal</div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
