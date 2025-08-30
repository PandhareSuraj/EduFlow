import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  price_per_unit: number;
  supplier_id?: string;
  last_restocked?: string;
  status: string;
  supplier?: {
    name: string;
  };
}

export interface InventoryTransaction {
  id: string;
  transaction_code: string;
  transaction_type: string;
  quantity: number;
  department?: string;
  issued_to?: string;
  purpose?: string;
  remarks?: string;
  transaction_date: string;
  item: {
    name: string;
  };
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
}

export function useInventoryData() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          item:inventory_items(name)
        `)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions",
        variant: "destructive",
      });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      });
    }
  };

  const addItem = async (itemData: Omit<InventoryItem, 'id' | 'supplier'>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .insert([itemData]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Item added successfully",
      });
      
      await fetchItems();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const updateItem = async (id: string, itemData: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(itemData)
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      
      await fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const addTransaction = async (transactionData: {
    item_id: string;
    transaction_type: string;
    quantity: number;
    department?: string;
    issued_to?: string;
    purpose?: string;
    remarks?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('inventory_transactions')
        .insert([transactionData]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Transaction recorded successfully",
      });
      
      await Promise.all([fetchTransactions(), fetchItems()]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive",
      });
    }
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([supplierData]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
      
      await fetchSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchItems(),
        fetchTransactions(),
        fetchSuppliers()
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const stats = {
    totalItems: items.length,
    lowStockItems: items.filter(item => item.current_stock <= item.min_stock).length,
    totalValue: items.reduce((sum, item) => sum + (item.current_stock * item.price_per_unit), 0),
    recentTransactions: transactions.length
  };

  return {
    items,
    transactions,
    suppliers,
    stats,
    loading,
    addItem,
    updateItem,
    addTransaction,
    addSupplier,
    refreshData: () => Promise.all([fetchItems(), fetchTransactions(), fetchSuppliers()])
  };
}