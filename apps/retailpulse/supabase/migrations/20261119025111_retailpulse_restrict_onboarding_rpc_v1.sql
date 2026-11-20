
revoke all on function public.create_business_for_current_user(text, text) from public;
revoke all on function public.create_business_for_current_user(text, text) from anon;
grant execute on function public.create_business_for_current_user(text, text) to authenticated;
