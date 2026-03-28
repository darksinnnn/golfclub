import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';

// GET: Fetch charities (public — uses service role to bypass RLS)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key'),
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );
    const featured = request.nextUrl.searchParams.get('featured');

    let query = supabase.from('charities').select('*').order('featured', { ascending: false }).order('name');
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ charities: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch charities';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Admin - Create charity
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, website, featured, image_url } = body;

    if (!name) {
      return NextResponse.json({ error: 'Charity name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('charities')
      .insert({ name, description, category, website, featured: featured || false, image_url })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ charity: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create charity';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Admin - Update charity
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Charity ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('charities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ charity: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update charity';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Admin - Delete charity
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const charityId = request.nextUrl.searchParams.get('id');
    if (!charityId) {
      return NextResponse.json({ error: 'Charity ID required' }, { status: 400 });
    }

    const { error } = await supabase.from('charities').delete().eq('id', charityId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete charity';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
