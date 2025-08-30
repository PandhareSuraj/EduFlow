-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  college_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'Pieces',
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 10,
  max_stock INTEGER NOT NULL DEFAULT 100,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  supplier_id UUID REFERENCES public.suppliers(id),
  last_restocked DATE,
  status TEXT NOT NULL DEFAULT 'active',
  college_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_transactions table
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_code TEXT NOT NULL UNIQUE DEFAULT ('TXN' || LPAD(EXTRACT(EPOCH FROM NOW())::bigint::text, 10, '0')),
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  transaction_type TEXT NOT NULL, -- 'issue', 'return', 'restock', 'adjustment'
  quantity INTEGER NOT NULL,
  department TEXT,
  issued_to TEXT,
  purpose TEXT,
  remarks TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  processed_by UUID REFERENCES auth.users(id),
  college_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for suppliers
CREATE POLICY "Users can manage suppliers from their college" 
ON public.suppliers FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view suppliers from their college" 
ON public.suppliers FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- Create RLS policies for inventory_items
CREATE POLICY "Users can manage inventory items from their college" 
ON public.inventory_items FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view inventory items from their college" 
ON public.inventory_items FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- Create RLS policies for inventory_transactions
CREATE POLICY "Users can manage inventory transactions from their college" 
ON public.inventory_transactions FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view inventory transactions from their college" 
ON public.inventory_transactions FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- Create triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_transactions_updated_at
BEFORE UPDATE ON public.inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-fill college_id
CREATE TRIGGER auto_fill_suppliers_college_id
BEFORE INSERT ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_inventory_items_college_id
BEFORE INSERT ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_inventory_transactions_college_id
BEFORE INSERT ON public.inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

-- Create function to update inventory stock after transactions
CREATE OR REPLACE FUNCTION public.update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stock based on transaction type
  IF NEW.transaction_type = 'issue' THEN
    UPDATE public.inventory_items 
    SET current_stock = current_stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.item_id;
  ELSIF NEW.transaction_type = 'return' OR NEW.transaction_type = 'restock' THEN
    UPDATE public.inventory_items 
    SET current_stock = current_stock + NEW.quantity,
        updated_at = now(),
        last_restocked = CASE WHEN NEW.transaction_type = 'restock' THEN CURRENT_DATE ELSE last_restocked END
    WHERE id = NEW.item_id;
  ELSIF NEW.transaction_type = 'adjustment' THEN
    UPDATE public.inventory_items 
    SET current_stock = NEW.quantity,
        updated_at = now()
    WHERE id = NEW.item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update stock automatically
CREATE TRIGGER update_inventory_stock_trigger
AFTER INSERT ON public.inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_stock();