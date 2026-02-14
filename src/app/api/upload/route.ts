import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const businessId = formData.get('business_id') as string | null;

  if (!file || !businessId) {
    return NextResponse.json({ error: 'file and business_id are required' }, { status: 400 });
  }

  // Verify ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('claimed_by, photos')
    .eq('id', businessId)
    .single();

  if (!business || (business.claimed_by !== user.id && !user.user_metadata?.is_admin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${businessId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('business-photos')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: urlData } = supabase.storage
    .from('business-photos')
    .getPublicUrl(path);

  // Append to business photos array
  const photos = [...(business.photos || []), urlData.publicUrl];
  await supabase
    .from('businesses')
    .update({ photos })
    .eq('id', businessId);

  return NextResponse.json({ url: urlData.publicUrl, photos });
}
