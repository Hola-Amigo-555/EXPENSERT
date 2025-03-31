
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface PaymentMethodsSectionProps {
  paymentMethods: string[];
  onPaymentMethodsUpdate: (methods: string[]) => void;
}

const PaymentMethodsSection = ({ paymentMethods, onPaymentMethodsUpdate }: PaymentMethodsSectionProps) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newMethodName, setNewMethodName] = useState("");
  const [editingMethod, setEditingMethod] = useState({ index: -1, name: "" });

  const handleAddMethod = () => {
    const trimmedName = newMethodName.trim();
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Payment method name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethods.includes(trimmedName)) {
      toast({
        title: "Error",
        description: "Payment method already exists",
        variant: "destructive"
      });
      return;
    }

    const updatedMethods = [...paymentMethods, trimmedName];
    onPaymentMethodsUpdate(updatedMethods);
    setNewMethodName("");
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Payment method added successfully"
    });
  };

  const handleEditMethod = () => {
    const trimmedName = editingMethod.name.trim();
    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Payment method name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethods.includes(trimmedName) && trimmedName !== paymentMethods[editingMethod.index]) {
      toast({
        title: "Error",
        description: "Payment method already exists",
        variant: "destructive"
      });
      return;
    }

    const updatedMethods = [...paymentMethods];
    updatedMethods[editingMethod.index] = trimmedName;
    onPaymentMethodsUpdate(updatedMethods);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Payment method updated successfully"
    });
  };

  const handleDeleteMethod = (index: number) => {
    const methodToDelete = paymentMethods[index];
    
    if (window.confirm(`Are you sure you want to delete "${methodToDelete}"?`)) {
      const updatedMethods = paymentMethods.filter((_, i) => i !== index);
      onPaymentMethodsUpdate(updatedMethods);
      
      toast({
        title: "Success",
        description: "Payment method deleted successfully"
      });
    }
  };

  const startEditMethod = (index: number) => {
    setEditingMethod({ index, name: paymentMethods[index] });
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Manage your payment methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {paymentMethods.length} payment methods
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Method
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {paymentMethods.map((method, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <Badge variant="outline" className="font-normal">
                {method}
              </Badge>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => startEditMethod(index)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteMethod(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Payment Method Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Enter the name of the new payment method
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input 
                placeholder="e.g., Credit Card, PayPal" 
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMethod}>Add Method</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Method Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payment Method</DialogTitle>
              <DialogDescription>
                Update the name of the payment method
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input 
                value={editingMethod.name}
                onChange={(e) => setEditingMethod({...editingMethod, name: e.target.value})}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditMethod}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsSection;
