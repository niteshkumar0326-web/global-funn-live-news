
create or replace function public.create_business_for_current_user(p_name text, p_language text default 'en')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_business_id uuid;
  v_name text := trim(coalesce(p_name, ''));
  v_language text := coalesce(p_language, 'en');
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'Business name must be between 2 and 120 characters' using errcode = '22023';
  end if;
  if v_language not in ('en', 'hi') then
    raise exception 'Unsupported language' using errcode = '22023';
  end if;

  insert into public.businesses(name, preferred_language)
  values (v_name, v_language)
  returning id into v_business_id;

  insert into public.business_memberships(business_id, user_id, role, active)
  values (v_business_id, v_user_id, 'owner', true);

  insert into public.audit_events(business_id, actor_id, action, entity_type, entity_id, safe_metadata)
  values (v_business_id, v_user_id, 'business.created', 'business', v_business_id, jsonb_build_object('source','owner_onboarding'));

  return v_business_id;
end;
$$;

revoke all on function public.create_business_for_current_user(text, text) from public;
grant execute on function public.create_business_for_current_user(text, text) to authenticated;
