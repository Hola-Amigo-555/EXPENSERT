
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login with the old Auth implementation
    setTimeout(() => {
      try {
        // Get users from localStorage
        const usersJSON = localStorage.getItem('expenseTrackerUsers');
        const users = usersJSON ? JSON.parse(usersJSON) : [];
        
        // Find user by email
        const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          throw new Error('User not found');
        }
        
        if (user.password !== password) {
          throw new Error('Invalid password');
        }
        
        // Set current user (remove password)
        const userToStore = { ...user };
        delete userToStore.password;
        localStorage.setItem('expenseTrackerUser', JSON.stringify(userToStore));
        
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        
        // Force navigation to dashboard
        navigate("/dashboard", { replace: true });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Login failed",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full p-6 border-0 shadow-none">
      <form onSubmit={handleLogin}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="your.email@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary underline">
          Register
        </Link>
      </div>
    </Card>
  );
};

export default Login;
