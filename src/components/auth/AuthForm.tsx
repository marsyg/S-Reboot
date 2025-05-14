
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate authentication - in a real app, this would connect to a backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (mode === "login") {
        // Simulate login success
        toast.success("Successfully logged in!");
        localStorage.setItem("user", JSON.stringify({ email, name: "User" }));
      } else {
        toast.success("Account created successfully!");
        localStorage.setItem("user", JSON.stringify({ 
          email, 
          name,
          username
        }));
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setEmail("");
    setPassword("");
    setName("");
    setUsername("");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Login" : "Create an Account"}</CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Enter your credentials to access your account" 
            : "Fill out the form below to create your account"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="johndoe"
                  required
                />
                <p className="text-xs text-gray-500">
                  This will be displayed with your comments and posts.
                </p>
              </div>
            </>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </Button>
          <Button type="button" variant="ghost" onClick={toggleMode} className="w-full">
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AuthForm;
