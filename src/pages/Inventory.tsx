import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, AlertTriangle, TrendingUp, TrendingDown, Edit, RefreshCw } from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { AddInventoryItemDialog } from "@/components/forms/AddInventoryItemDialog";
import { AddTransactionDialog } from "@/components/forms/AddTransactionDialog";
import { format } from "date-fns";
import { PermissionWrapper } from "@/components/permissions/RoleGuard";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    items,
    transactions,
    suppliers,
    stats,
    loading,
    addItem,
    addTransaction,
    checkItemCodeExists,
    generateNextItemCode,
    refreshData
  } = useInventoryData();

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (item: any) => {
    if (item.current_stock === 0) return { status: 'Out of Stock', variant: 'destructive' as const };
    if (item.current_stock <= item.min_stock) return { status: 'Critical', variant: 'destructive' as const };
    if (item.current_stock <= item.min_stock * 1.5) return { status: 'Low Stock', variant: 'secondary' as const };
    return { status: 'In Stock', variant: 'default' as const };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">Loading inventory data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage lab equipment and supplies</p>
        </div>
        <div className="flex gap-2">
          <PermissionWrapper permission="INVENTORY_MANAGE">
            <AddInventoryItemDialog
              onAdd={addItem}
              suppliers={suppliers}
              checkItemCodeExists={checkItemCodeExists}
              generateNextItemCode={generateNextItemCode}
            />
          </PermissionWrapper>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentTransactions}</div>
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
                  <Input 
                    placeholder="Search inventory..." 
                    className="pl-10" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <AddTransactionDialog onAdd={addTransaction} items={items} />
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
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.item_code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={
                              item.current_stock <= item.min_stock ? 'text-red-600 font-medium' : ''
                            }>
                              {item.current_stock}
                            </span>
                            <span className="text-muted-foreground text-sm">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.min_stock} / {item.max_stock}
                        </TableCell>
                        <TableCell>₹{item.price_per_unit}</TableCell>
                        <TableCell>{item.supplier?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <AddTransactionDialog 
                              onAdd={addTransaction} 
                              items={items}
                              triggerButton={
                                <Button size="sm">Restock</Button>
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                      <TableCell className="font-medium">{transaction.transaction_code}</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.transaction_type === 'issue' ? 'secondary' : 
                          transaction.transaction_type === 'return' ? 'outline' :
                          transaction.transaction_type === 'restock' ? 'default' : 'destructive'
                        }>
                          {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.item.name}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{transaction.department || 'N/A'}</TableCell>
                      <TableCell>{transaction.issued_to || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{transaction.purpose || 'N/A'}</TableCell>
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