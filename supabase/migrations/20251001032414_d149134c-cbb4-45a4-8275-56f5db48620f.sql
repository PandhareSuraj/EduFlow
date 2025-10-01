-- Create transport_routes table
CREATE TABLE IF NOT EXISTS public.transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  route_code TEXT,
  starting_point TEXT NOT NULL,
  ending_point TEXT NOT NULL,
  distance NUMERIC,
  duration INTEGER,
  base_fare NUMERIC NOT NULL DEFAULT 0,
  stops JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Create buses table
CREATE TABLE IF NOT EXISTS public.buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number TEXT NOT NULL,
  route_id UUID REFERENCES public.transport_routes(id),
  driver_name TEXT,
  driver_phone TEXT,
  capacity INTEGER NOT NULL,
  vehicle_type TEXT,
  registration_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Create hostel_rooms table
CREATE TABLE IF NOT EXISTS public.hostel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL,
  building TEXT,
  floor INTEGER,
  room_type TEXT NOT NULL DEFAULT 'shared',
  capacity INTEGER NOT NULL DEFAULT 2,
  occupied_beds INTEGER NOT NULL DEFAULT 0,
  rent_amount NUMERIC NOT NULL DEFAULT 0,
  facilities TEXT[],
  status TEXT NOT NULL DEFAULT 'available',
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Create hostel_allocations table
CREATE TABLE IF NOT EXISTS public.hostel_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER REFERENCES public.students(id),
  room_id UUID REFERENCES public.hostel_rooms(id),
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vacate_date DATE,
  semester INTEGER,
  room_fee NUMERIC NOT NULL DEFAULT 0,
  special_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Create hostel_complaints table
CREATE TABLE IF NOT EXISTS public.hostel_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER REFERENCES public.students(id),
  room_id UUID REFERENCES public.hostel_rooms(id),
  complaint_type TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS on all tables
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transport_routes
CREATE POLICY "Users can view transport routes from their college"
  ON public.transport_routes FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage transport routes from their college"
  ON public.transport_routes FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- RLS Policies for buses
CREATE POLICY "Users can view buses from their college"
  ON public.buses FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage buses from their college"
  ON public.buses FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- RLS Policies for hostel_rooms
CREATE POLICY "Users can view hostel rooms from their college"
  ON public.hostel_rooms FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage hostel rooms from their college"
  ON public.hostel_rooms FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- RLS Policies for hostel_allocations
CREATE POLICY "Users can view hostel allocations from their college"
  ON public.hostel_allocations FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage hostel allocations from their college"
  ON public.hostel_allocations FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- RLS Policies for hostel_complaints
CREATE POLICY "Users can view hostel complaints from their college"
  ON public.hostel_complaints FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage hostel complaints from their college"
  ON public.hostel_complaints FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- Create updated_at triggers
CREATE TRIGGER update_transport_routes_updated_at
  BEFORE UPDATE ON public.transport_routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buses_updated_at
  BEFORE UPDATE ON public.buses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hostel_rooms_updated_at
  BEFORE UPDATE ON public.hostel_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hostel_allocations_updated_at
  BEFORE UPDATE ON public.hostel_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hostel_complaints_updated_at
  BEFORE UPDATE ON public.hostel_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();