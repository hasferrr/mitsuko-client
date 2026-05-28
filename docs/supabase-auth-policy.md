# Supabase Auth Policy

Required flow:

- Sign up: Google only
- Set password: only after the user is already signed in
- Login: Google or email/password

Keep the Email provider enabled so existing users with a password can sign in. Do not expose `supabase.auth.signUp()` in the frontend.

To hard-block email/password account creation, add this as a Supabase Auth **Before User Created** database hook:

```sql
create or replace function public.hook_reject_email_signups(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  provider text;
begin
  provider := event->'user'->'app_metadata'->>'provider';

  if provider = 'email' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'message', 'Email signups are not allowed. Continue with Google first.',
        'http_code', 403
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

grant execute
  on function public.hook_reject_email_signups
  to supabase_auth_admin;

revoke execute
  on function public.hook_reject_email_signups
  from authenticated, anon, public;
```

After creating the function, enable it in Supabase Dashboard:

Authentication -> Hooks -> Before User Created -> select `public.hook_reject_email_signups`.
