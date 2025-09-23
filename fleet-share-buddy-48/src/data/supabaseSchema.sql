-- EcoShare Database Schema for Rule Implementation
-- This schema implements all the rules defined in the system

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users table with verification fields (Rule 1.1)
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  name text not null,
  phone text,
  identity_number text, -- CCCD/CMND
  identity_verified boolean default false,
  license_number text, -- Giấy phép lái xe
  license_verified boolean default false,
  license_expires_at timestamp with time zone,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Groups table
create table groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  owner_id uuid references users(id) not null,
  max_members integer default 5, -- Rule 4.1: Max 5 members
  min_ownership_percentage decimal default 15.0, -- Rule 4.1: Min 15% ownership
  fund_balance decimal default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Member ownership table (Rule 1.2, 4.1)
create table member_ownership (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  group_id uuid references groups(id) not null,
  ownership_percentage decimal not null check (ownership_percentage >= 15 and ownership_percentage <= 100),
  status text default 'active' check (status in ('active', 'suspended', 'removed')),
  joined_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, group_id)
);

-- Vehicles table
create table vehicles (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) not null,
  name text not null,
  model text,
  license_plate text,
  status text default 'available' check (status in ('available', 'in-use', 'maintenance')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Vehicle schedules table (Rule 2)
create table vehicle_schedules (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) not null,
  vehicle_id uuid references vehicles(id) not null,
  user_id uuid references users(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  actual_return_time timestamp with time zone,
  status text default 'pending' check (status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  priority integer default 0,
  conflict_resolution text check (conflict_resolution in ('ownership', 'usage_history', 'first_come')),
  is_emergency boolean default false,
  emergency_evidence text[], -- URLs to evidence files
  staff_approved boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Usage history tracking (Rule 2.3)
create table usage_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  group_id uuid references groups(id) not null,
  vehicle_id uuid references vehicles(id) not null,
  total_hours decimal default 0,
  total_days decimal default 0,
  consecutive_days_used integer default 0,
  last_usage_date timestamp with time zone,
  updated_at timestamp with time zone default now(),
  unique(user_id, group_id, vehicle_id)
);

-- Payment debts table (Rule 3)
create table payment_debts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  group_id uuid references groups(id) not null,
  amount decimal not null,
  type text not null check (type in ('maintenance', 'insurance', 'damage', 'fine', 'fuel')),
  due_date timestamp with time zone not null,
  overdue_days integer default 0,
  status text default 'pending' check (status in ('pending', 'overdue', 'paid')),
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Group decisions table (Rule 4)
create table group_decisions (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references groups(id) not null,
  title text not null,
  description text,
  type text not null check (type in ('ownership_change', 'member_addition', 'major_expense', 'rule_change')),
  initiated_by uuid references users(id) not null,
  required_approval_percentage decimal default 70.0, -- Rule 4.2
  current_approval_percentage decimal default 0,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'emergency_bypassed')),
  deadline timestamp with time zone not null,
  emergency_bypass_reason text,
  emergency_evidence text[],
  staff_approved boolean default false,
  bypassed_by uuid references users(id),
  bypassed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Group votes table
create table group_votes (
  id uuid default uuid_generate_v4() primary key,
  decision_id uuid references group_decisions(id) not null,
  user_id uuid references users(id) not null,
  decision text not null check (decision in ('approve', 'reject', 'abstain')),
  ownership_percentage decimal not null,
  comment text,
  voted_at timestamp with time zone default now(),
  unique(decision_id, user_id)
);

-- Rule violations table (All rules)
create table rule_violations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  group_id uuid references groups(id) not null,
  rule_code text not null, -- e.g., "2.3", "2.4", "4.1"
  violation_type text not null check (violation_type in ('schedule', 'payment', 'vehicle_damage', 'serious', 'conflict')),
  description text not null,
  penalty_amount decimal,
  penalty_type text not null check (penalty_type in ('warning', 'fine', 'suspension', 'expulsion')),
  status text default 'pending' check (status in ('pending', 'confirmed', 'appealed', 'resolved', 'dismissed')),
  evidence_urls text[],
  appeal_reason text,
  resolved_by uuid references users(id),
  created_at timestamp with time zone default now(),
  resolved_at timestamp with time zone,
  updated_at timestamp with time zone default now()
);

-- Conflict tracking table (Rule 2.5)
create table schedule_conflicts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  group_id uuid references groups(id) not null,
  vehicle_id uuid references vehicles(id) not null,
  conflict_date timestamp with time zone not null,
  resolved_method text check (resolved_method in ('ownership', 'usage_history', 'first_come')),
  created_at timestamp with time zone default now()
);

-- Activity logs table (Rule 5.1)
create table activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id),
  group_id uuid references groups(id),
  action text not null,
  entity_type text not null, -- 'schedule', 'payment', 'vote', etc.
  entity_id uuid not null,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Functions and triggers for rule enforcement

-- Function to check schedule conflicts (Rule 2.2, 2.5)
create or replace function check_schedule_conflict()
returns trigger as $$
declare
  conflict_count integer;
  ownership_record record;
  conflicting_schedule record;
begin
  -- Check for overlapping schedules
  select * into conflicting_schedule
  from vehicle_schedules
  where vehicle_id = NEW.vehicle_id
    and status in ('confirmed', 'active')
    and id != coalesce(NEW.id, uuid_nil())
    and (
      (NEW.start_time >= start_time and NEW.start_time < end_time)
      or (NEW.end_time > start_time and NEW.end_time <= end_time)
      or (NEW.start_time <= start_time and NEW.end_time >= end_time)
    );

  if found then
    -- Get ownership percentages to resolve conflict
    select mo1.ownership_percentage as new_ownership,
           mo2.ownership_percentage as existing_ownership
    into ownership_record
    from member_ownership mo1, member_ownership mo2
    where mo1.user_id = NEW.user_id
      and mo1.group_id = NEW.group_id
      and mo2.user_id = conflicting_schedule.user_id
      and mo2.group_id = NEW.group_id;

    -- Apply Rule 2.2: Resolve by ownership percentage
    if ownership_record.new_ownership > ownership_record.existing_ownership then
      -- New booking has priority, cancel existing
      update vehicle_schedules 
      set status = 'cancelled', updated_at = now()
      where id = conflicting_schedule.id;
      
      NEW.conflict_resolution = 'ownership';
    else
      -- Existing booking has priority, reject new
      raise exception 'Lịch bị xung đột. Thành viên khác có độ ưu tiên cao hơn.';
    end if;

    -- Track conflict for Rule 2.5 violation checking
    insert into schedule_conflicts (user_id, group_id, vehicle_id, conflict_date, resolved_method)
    values (NEW.user_id, NEW.group_id, NEW.vehicle_id, now(), NEW.conflict_resolution);

    -- Check if user has too many conflicts this month
    select count(*) into conflict_count
    from schedule_conflicts
    where user_id = NEW.user_id
      and group_id = NEW.group_id
      and conflict_date >= date_trunc('month', now());

    if conflict_count > 5 then
      -- Create Rule 2.5 violation
      insert into rule_violations (user_id, group_id, rule_code, violation_type, description, penalty_type, status)
      values (NEW.user_id, NEW.group_id, '2.5', 'conflict', 
              'Đặt lịch xung đột quá 5 lần trong tháng', 'suspension', 'pending');
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Trigger for schedule conflict checking
create trigger check_schedule_conflict_trigger
  before insert or update on vehicle_schedules
  for each row
  execute function check_schedule_conflict();

-- Function to update overdue days for payments (Rule 3.4)
create or replace function update_overdue_payments()
returns void as $$
begin
  update payment_debts
  set overdue_days = extract(days from now() - due_date),
      status = case 
        when extract(days from now() - due_date) > 0 then 'overdue'
        else status
      end,
      updated_at = now()
  where status = 'pending' and due_date < now();

  -- Create violations for overdue payments > 15 days
  insert into rule_violations (user_id, group_id, rule_code, violation_type, description, penalty_amount, penalty_type, status)
  select 
    pd.user_id,
    pd.group_id,
    '3.4',
    'payment',
    format('Thanh toán chậm trễ %s ngày', pd.overdue_days),
    pd.overdue_days * 50000, -- 50k per day
    'suspension',
    'pending'
  from payment_debts pd
  left join rule_violations rv on rv.user_id = pd.user_id 
    and rv.group_id = pd.group_id 
    and rv.rule_code = '3.4' 
    and rv.status in ('pending', 'confirmed')
  where pd.overdue_days > 15 
    and pd.status = 'overdue'
    and rv.id is null; -- Don't create duplicate violations
end;
$$ language plpgsql;

-- Function to log all activities (Rule 5.1)
create or replace function log_activity()
returns trigger as $$
begin
  insert into activity_logs (user_id, group_id, action, entity_type, entity_id, details)
  values (
    coalesce(NEW.user_id, OLD.user_id),
    coalesce(NEW.group_id, OLD.group_id),
    TG_OP,
    TG_TABLE_NAME,
    coalesce(NEW.id, OLD.id),
    case TG_OP
      when 'INSERT' then to_jsonb(NEW)
      when 'UPDATE' then jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      when 'DELETE' then to_jsonb(OLD)
    end
  );
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Apply activity logging to all relevant tables
create trigger log_vehicle_schedules_activity
  after insert or update or delete on vehicle_schedules
  for each row execute function log_activity();

create trigger log_payment_debts_activity
  after insert or update or delete on payment_debts
  for each row execute function log_activity();

create trigger log_group_votes_activity
  after insert or update or delete on group_votes
  for each row execute function log_activity();

create trigger log_member_ownership_activity
  after insert or update or delete on member_ownership
  for each row execute function log_activity();

-- Create indexes for performance
create index idx_vehicle_schedules_time_conflict on vehicle_schedules (vehicle_id, start_time, end_time) where status in ('confirmed', 'active');
create index idx_payment_debts_overdue on payment_debts (user_id, group_id, due_date) where status in ('pending', 'overdue');
create index idx_rule_violations_user_group on rule_violations (user_id, group_id, status);
create index idx_schedule_conflicts_monthly on schedule_conflicts (user_id, group_id, conflict_date);
create index idx_activity_logs_entity on activity_logs (entity_type, entity_id, created_at);

-- Row Level Security (RLS) policies
alter table users enable row level security;
alter table groups enable row level security;
alter table member_ownership enable row level security;
alter table vehicles enable row level security;
alter table vehicle_schedules enable row level security;
alter table payment_debts enable row level security;
alter table group_decisions enable row level security;
alter table group_votes enable row level security;
alter table rule_violations enable row level security;
alter table activity_logs enable row level security;

-- Users can read/update their own data
create policy "Users can manage own data" on users
  for all using (auth.uid() = id);

-- Members can access their group data
create policy "Members can access group data" on groups
  for select using (
    id in (
      select group_id from member_ownership 
      where user_id = auth.uid() and status = 'active'
    )
  );

-- Schedule a recurring job to update overdue payments
-- Note: This would typically be handled by pg_cron extension or external cron job
-- select cron.schedule('update_overdue_payments', '0 6 * * *', 'select update_overdue_payments();');