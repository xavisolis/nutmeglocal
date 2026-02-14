import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServiceClient();

  const { error } = await supabase.rpc('increment_view_count', { business_id: id });

  if (error) {
    // Fallback: manual increment if RPC doesn't exist
    const { data: biz } = await supabase
      .from('businesses')
      .select('view_count')
      .eq('id', id)
      .single();

    if (biz) {
      await supabase
        .from('businesses')
        .update({ view_count: (biz.view_count || 0) + 1 })
        .eq('id', id);
    }
  }

  return NextResponse.json({ success: true });
}
