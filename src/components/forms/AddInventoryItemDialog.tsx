import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Wand2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Supplier } from "@/hooks/useInventoryData";
import { useToast } from "@/hooks/use-toast";
import { debounce } from "lodash";

const formSchema = z.object({
  item_code: z.string().min(1, "Item code is required"),
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  current_stock: z.coerce.number().min(0, "Stock must be 0 or greater"),
  min_stock: z.coerce.number().min(0, "Min stock must be 0 or greater"),
  max_stock: z.coerce.number().min(1, "Max stock must be greater than 0"),
  price_per_unit: z.coerce.number().min(0, "Price must be 0 or greater"),
  supplier_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddInventoryItemDialogProps {
  onAdd: (data: FormData) => Promise<void>;
  suppliers: Supplier[];
  checkItemCodeExists: (code: string) => Promise<boolean>;
  generateNextItemCode: () => Promise<string>;
}

export function AddInventoryItemDialog({ onAdd, suppliers, checkItemCodeExists, generateNextItemCode }: AddInventoryItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeValidation, setCodeValidation] = useState<{
    status: 'idle' | 'checking' | 'available' | 'taken';
    message?: string;
  }>({ status: 'idle' });
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_code: "",
      name: "",
      category: "",
      description: "",
      unit: "Pieces",
      current_stock: 0,
      min_stock: 10,
      max_stock: 100,
      price_per_unit: 0,
      supplier_id: "",
    },
  });

  const validateItemCode = useCallback(
    debounce(async (code: string) => {
      if (!code.trim()) {
        setCodeValidation({ status: 'idle' });
        return;
      }
      
      setCodeValidation({ status: 'checking' });
      
      try {
        const exists = await checkItemCodeExists(code);
        if (exists) {
          setCodeValidation({ 
            status: 'taken', 
            message: 'This item code is already in use' 
          });
        } else {
          setCodeValidation({ 
            status: 'available', 
            message: 'Item code is available' 
          });
        }
      } catch (error) {
        setCodeValidation({ status: 'idle' });
      }
    }, 500),
    [checkItemCodeExists]
  );

  const handleGenerateCode = async () => {
    try {
      const newCode = await generateNextItemCode();
      form.setValue('item_code', newCode);
      setCodeValidation({ 
        status: 'available', 
        message: 'Auto-generated code is available' 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate item code",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (codeValidation.status === 'taken') {
      toast({
        title: "Invalid Item Code",
        description: "Please use a different item code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        ...data,
        supplier_id: data.supplier_id === "none" ? undefined : data.supplier_id,
        status: 'active'
      } as any);
      form.reset();
      setCodeValidation({ status: 'idle' });
      setOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Lab Equipment",
    "Radiology Supplies",
    "Medical Instruments",
    "Consumables",
    "Chemicals",
    "Safety Equipment",
    "Office Supplies",
    "Maintenance",
    "Other"
  ];

  const units = [
    "Pieces",
    "Bottles",
    "Boxes",
    "Sheets",
    "Liters",
    "Kilograms",
    "Meters",
    "Sets",
    "Packs"
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory system
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="item_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Code</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <div className="relative flex-1">
                          <Input 
                            placeholder="e.g., INV001" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              field.onChange(value);
                              validateItemCode(value);
                            }}
                            className={
                              codeValidation.status === 'available' ? 'pr-10 border-green-500' :
                              codeValidation.status === 'taken' ? 'pr-10 border-red-500' : 'pr-10'
                            }
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {codeValidation.status === 'checking' && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {codeValidation.status === 'available' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {codeValidation.status === 'taken' && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateCode}
                        title="Auto-generate item code"
                      >
                        <Wand2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {codeValidation.message && (
                      <p className={`text-sm ${
                        codeValidation.status === 'available' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {codeValidation.message}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., X-Ray Film" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Item description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="current_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Stock</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price_per_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Unit (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Supplier</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || codeValidation.status === 'checking' || codeValidation.status === 'taken'}
              >
                {loading ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}