-- Expanded country avatars. Run after the existing social setup.
begin;
create or replace function public.glossix_avatar_set(p_avatar text) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Please sign in first'; end if;
 if p_avatar is null or p_avatar not in ('fox','cat','dog','owl','panda','lion','penguin','turtle','rabbit','frog','shark','butterfly','trex','triceratops','stegosaurus','brontosaurus','pterodactyl','raptor','dragon','unicorn','phoenix','kraken','griffin','pegasus','flag-ru','flag-it','flag-gb','flag-fr','flag-jp','flag-br','flag-us','flag-ca','flag-au','flag-nz','flag-ie','flag-de','flag-es','flag-pt','flag-nl','flag-be','flag-ch','flag-at','flag-dk','flag-se','flag-no','flag-fi','flag-pl','flag-ua','flag-gr','flag-tr','flag-cn','flag-kr','flag-in','flag-pk','flag-id','flag-ph','flag-th','flag-vn','flag-sg','flag-mx','flag-ar','flag-cl','flag-co','flag-za','flag-eg','flag-ng','flag-ke','flag-ma','flag-sa','flag-ae','flag-is','flag-cz','flag-hu','flag-ro','wolf','tiger','snow-leopard','red-panda','ankylosaurus','spinosaurus','parasaurolophus','dilophosaurus','kirin','basilisk','hippogriff','fenrir') then raise exception 'Choose an available avatar'; end if;
 update glossix_private.profiles set avatar_id=p_avatar where user_id=auth.uid();
 if not found then raise exception 'Create your profile first'; end if;
 return public.glossix_profile();
end $$;
revoke all on function public.glossix_avatar_set(text) from public,anon,authenticated;
grant execute on function public.glossix_avatar_set(text) to authenticated;
commit;
