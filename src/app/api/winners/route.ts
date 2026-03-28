import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch winners
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const drawId = request.nextUrl.searchParams.get('drawId');
    const all = request.nextUrl.searchParams.get('all');

    let query = supabase.from('winners').select('*, profiles:user_id(full_name, email), draws:draw_id(draw_date, month, year)');

    if (all === 'true') {
      // Admin: fetch all winners
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    } else if (drawId) {
      query = query.eq('draw_id', drawId);
    } else {
      query = query.eq('user_id', user.id);
    }

    const { data: winners, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ winners });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch winners';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Admin - Verify winner / Update proof URL
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { winnerId, action, proof_url } = body;

    if (!winnerId) {
      return NextResponse.json({ error: 'Winner ID required' }, { status: 400 });
    }

    // User uploading proof
    if (proof_url) {
      const { data, error } = await supabase
        .from('winners')
        .update({ proof_url, updated_at: new Date().toISOString() })
        .eq('id', winnerId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ winner: data });
    }

    // Admin actions (approve, reject, mark_paid)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const updateData: Record<string, string> = { updated_at: new Date().toISOString() };

    if (action === 'approve') {
      updateData.verification_status = 'approved';
    } else if (action === 'reject') {
      updateData.verification_status = 'rejected';
    } else if (action === 'mark_paid') {
      updateData.payment_status = 'paid';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('winners')
      .update(updateData)
      .eq('id', winnerId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ winner: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update winner';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
