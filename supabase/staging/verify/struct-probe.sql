-- READ-ONLY structural probe: auth trigger, storage bucket config + policies, event triggers. Metadata only (no rows, no files).
select 'auth-trigger' cat, g.tgname::text k, pg_get_triggerdef(g.oid) || ' | enabled=' || g.tgenabled::text v
  from pg_trigger g where g.tgrelid = 'auth.users'::regclass and not g.tgisinternal
union all select 'function', 'public.handle_new_user', md5(replace(pg_get_functiondef('public.handle_new_user()'::regprocedure), E'\r', '')) || ' secdef=' || p.prosecdef || ' owner=' || pg_get_userbyid(p.proowner) || ' config=' || coalesce(array_to_string(p.proconfig, ';'), '')
  from pg_proc p where p.oid = 'public.handle_new_user()'::regprocedure
union all select 'function', 'public.rls_auto_enable', md5(replace(pg_get_functiondef('public.rls_auto_enable()'::regprocedure), E'\r', '')) || ' secdef=' || p.prosecdef || ' owner=' || pg_get_userbyid(p.proowner) || ' rettype=' || p.prorettype::regtype::text || ' config=' || coalesce(array_to_string(p.proconfig, ';'), '')
  from pg_proc p where p.oid = 'public.rls_auto_enable()'::regprocedure
union all select 'bucket', b.id, concat_ws(' | ', 'name=' || b.name, 'public=' || b.public, 'file_size_limit=' || coalesce(b.file_size_limit::text, 'null'),
         'allowed_mime_types=' || coalesce(b.allowed_mime_types::text, 'null'), 'avif_autodetection=' || coalesce(b.avif_autodetection::text, 'null'),
         'owner_set=' || (b.owner is not null or b.owner_id is not null)::text)
  from storage.buckets b
union all select 'bucket-columns', 'storage.buckets', string_agg(column_name || ':' || data_type, ',' order by ordinal_position)
  from information_schema.columns where table_schema = 'storage' and table_name = 'buckets'
union all select 'storage-policy', tablename || '.' || policyname, concat_ws(' | ', permissive, roles::text, cmd, 'using=' || coalesce(qual, ''), 'check=' || coalesce(with_check, ''))
  from pg_policies where schemaname = 'storage'
union all select 'storage-rls', c.relname, c.relrowsecurity::text || '/' || c.relforcerowsecurity::text
  from pg_class c where c.relnamespace = 'storage'::regnamespace and c.relkind = 'r' and c.relname in ('objects', 'buckets')
union all select 'storage-objects', 'count in article-images (count only)', (select count(*)::text from storage.objects where bucket_id = 'article-images')
union all select 'event-trigger', e.evtname::text, concat_ws(' | ', 'event=' || e.evtevent, 'fn=' || e.evtfoid::regproc::text, 'owner=' || pg_get_userbyid(e.evtowner), 'enabled=' || e.evtenabled::text, 'tags=' || coalesce(e.evttags::text, 'all'))
  from pg_event_trigger e
union all select 'ext-owns-fn', 'rls_auto_enable owned by an extension?', exists (select 1 from pg_depend d where d.classid = 'pg_proc'::regclass and d.objid = 'public.rls_auto_enable()'::regprocedure and d.deptype = 'e')::text
order by 1, 2;
