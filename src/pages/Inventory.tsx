import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

const inventory = [
  {
    id: "INV001",
    name: "X-Ray Film",
    category: "Radiology Supplies",
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unit: "Sheets",
    pricePerUnit: 25,
    supplier: "MedTech Supplies",
    lastRestocked: "2024-01-15",
    status: "In Stock"
  },
  {
    id: "INV002",
    name: "Blood Collection Tubes",
    category: "Lab Equipment",
    currentStock: 25,
    minStock: 100,
    maxStock: 1000,
    unit: "Pieces",
    pricePerUnit: 5,
    supplier: "LabCorp India",
    lastRestocked: "2024-01-10",
    status: "Low Stock"
  },
  {
    id: "INV003",
    name: "Microscope Slides",
    category: "Lab Equipment",
    currentStock: 300,
    minStock: 200,
    maxStock: 800,
    unit: "Pieces",
    pricePerUnit: 2,
    supplier: "Scientific Instruments",
    lastRestocked: "2024-01-20",
    status: "In Stock"
  },
  {
    id: "INV004",
    name: "Ultrasound Gel",
    category: "Radiology Supplies", 
    currentStock: 8,
    minStock: 20,
    maxStock: 100,
    unit: "Bottles",
    pricePerUnit: 150,
    supplier: "MedTech Supplies",
    lastRestocked: "2023-12-25",
    status: "Critical"
  }
];

const transactions = [
  {
    id: "TXN001",
    type: "Issue",
    item: "X-Ray Film",
    quantity: 25,
    department: "Radiology Lab",
    issuedTo: "Dr. Rajesh Sharma",
    date: "2024-01-22",
    purpose: "Student Practical"
  },
  {
    id: "TXN002",
    type: "Return",
    item: "Microscope Slides",
    quantity: 10,
    department: "DMLT Lab",
    issuedTo: "Prof. Priya Patil",
    date: "2024-01-21",
    purpose: "Unused Stock"
  },
  {
    id: "TXN003",
    type: "Issue",
    item: "Blood Collection Tubes",
    quantity: 50,
    department: "DMLT Lab",
    issuedTo: "Mrs. Sunita Desai",
    date: "2024-01-20",
    purpose: "Lab Practice"
  }
];

export default function Inventory() {
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Critical').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.pricePerUnit), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage lab equipment and supplies</p>
        </div>
        <Button className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search inventory..." className="pl-10" />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Stock</CardTitle>
              <CardDescription>Current stock levels and item details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min/Max Stock</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={
                            item.currentStock <= item.minStock ? 'text-red-600 font-medium' : ''
                          }>
                            {item.currentStock}
                          </span>
                          <span className="text-muted-foreground text-sm">{item.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.minStock} / {item.maxStock}
                      </TableCell>
                      <TableCell>₹{item.pricePerUnit}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === 'Critical' ? 'destructive' :
                          item.status === 'Low Stock' ? 'secondary' : 'default'
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button size="sm">Restock</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search transactions..." className="pl-10" />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issue/Return Register</CardTitle>
              <CardDescription>Track all inventory transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'Issue' ? 'secondary' : 'outline'}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.item}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{transaction.department}</TableCell>
                      <TableCell>{transaction.issuedTo}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.purpose}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
              <CardDescription>Generate comprehensive inventory reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Package className="h-6 w-6 mb-2" />
                  Stock Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Low Stock Alert
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Usage Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingDown className="h-6 w-6 mb-2" />
                  Supplier Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}