
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }
    
    setIsLoading(true);

    // Simulate registration with the old Auth implementation
    setTimeout(() => {
      try {
        // Get users from localStorage
        const usersJSON = localStorage.getItem('expenseTrackerUsers');
        const users = usersJSON ? JSON.parse(usersJSON) : [];
        
        // Check if user already exists
        const userExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (userExists) {
          throw new Error('Email already in use');
        }
        
        // Create new user
        const newUser = {
          id: uuidv4(),
          name,
          email,
          password,
          avatar: null,
          createdAt: new Date().toISOString()
        };
        
        // Add to users array
        users.push(newUser);
        localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
        
        toast({
          title: "Success",
          description: "Account created successfully",
        });
        
        // Force navigation to login page
        window.location.href = "/login";
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Registration failed",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full p-6 border-0 shadow-none">
      <form onSubmit={handleRegister}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-primary underline">
          Sign in
        </Link>
      </div>
    </Card>
  );
};

export default Register;
