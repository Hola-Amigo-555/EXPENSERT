
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const SecuritySection = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match",
      });
      return;
    }
    
    // Get current user
    const userDataJSON = localStorage.getItem('expenseTrackerUser');
    if (!userDataJSON) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User data not found",
      });
      return;
    }
    
    const userData = JSON.parse(userDataJSON);
    
    // Get users array
    const usersJSON = localStorage.getItem('expenseTrackerUsers');
    if (!usersJSON) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Users data not found",
      });
      return;
    }
    
    const users = JSON.parse(usersJSON);
    const userIndex = users.findIndex((u: any) => u.id === userData.id);
    
    if (userIndex === -1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not found in database",
      });
      return;
    }
    
    // Verify current password
    if (users[userIndex].password !== currentPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Current password is incorrect",
      });
      return;
    }
    
    // Update password
    users[userIndex].password = newPassword;
    localStorage.setItem('expenseTrackerUsers', JSON.stringify(users));
    
    setIsOpen(false);
    resetForm();
    
    toast({
      title: "Success",
      description: "Password changed successfully",
    });
  };
  
  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-muted-foreground">
                Update your password
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsOpen(true)}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your security credentials.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => {
                setIsOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecuritySection;
