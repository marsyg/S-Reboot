
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Journal from "@/components/Journal";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface JournalCard {
  id: string;
  title: string;
  lastEdited: Date;
}

const Index = () => {
  const [journals, setJournals] = useState<JournalCard[]>([
    { id: uuidv4(), title: "My First Journal", lastEdited: new Date() }
  ]);
  const [activeJournal, setActiveJournal] = useState<string | null>(null);
  
  const createNewJournal = () => {
    const newJournal = {
      id: uuidv4(),
      title: `Journal ${journals.length + 1}`,
      lastEdited: new Date()
    };
    setJournals([...journals, newJournal]);
    setActiveJournal(newJournal.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Flowy Scribe</h1>
        <p className="text-gray-600">Your nested journaling workspace</p>
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
          </div>
          <Journal 
            initialTitle={journals.find(j => j.id === activeJournal)?.title || "My Journal"} 
          />
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
                className="hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-fade-in"
                onClick={() => setActiveJournal(journal.id)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{journal.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-500 pb-2">
                  Last edited: {journal.lastEdited.toLocaleDateString()}
                </CardContent>
                <CardFooter>
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
                </CardFooter>
              </Card>
            ))}
            
            <Card 
              className="border-dashed border-2 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-[200px] animate-fade-in hover:bg-gray-50 transform hover:-translate-y-1"
              onClick={createNewJournal}
              style={{ animationDelay: `${journals.length * 50}ms` }}
            >
              <div className="text-4xl text-gray-400 mb-2 transition-transform group-hover:scale-110">+</div>
              <div className="text-gray-500">Create New Journal</div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
