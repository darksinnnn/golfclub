import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createAdminClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'),
    (process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key')
  );
};

// GET: Fetch user's scores
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId') || user.id;

    const adminClient = getAdminClient();
    const { data: scores, error } = await adminClient
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ scores });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch scores';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Add a new score
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { score, date_played } = body;

    // Validate score range
    if (!score || score < 1 || score > 45) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 45 (Stableford format)' },
        { status: 400 }
      );
    }

    if (!date_played) {
      return NextResponse.json(
        { error: 'Date played is required' },
        { status: 400 }
      );
    }

    const adminClient = getAdminClient();

    // 1. Ensure the user profile exists, if the Supabase Auth trigger didn't fire
    const { data: profile } = await adminClient.from('profiles').select('id').eq('id', user.id).single();
    if (!profile) {
      await adminClient.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: 'user'
      });
    }

    // The DB trigger handles the 5-score limit automatically, 
    // but we can also manually enforce it if the trigger is missing
    const { data: userScores } = await adminClient
      .from('scores')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (userScores && userScores.length >= 5) {
      // Delete the oldest ones to keep only 4 before inserting the 5th
      const scoresToDelete = userScores.slice(4);
      for (const oldScore of scoresToDelete) {
        await adminClient.from('scores').delete().eq('id', oldScore.id);
      }
    }

    const { data, error } = await adminClient
      .from('scores')
      .insert({
        user_id: user.id,
        score,
        date_played,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ score: data });
  } catch (error: unknown) {
    console.error('Score insertion API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to add score';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove a score
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scoreId = request.nextUrl.searchParams.get('id');
    if (!scoreId) {
      return NextResponse.json({ error: 'Score ID required' }, { status: 400 });
    }

    const adminClient = getAdminClient();

    const { error } = await adminClient
      .from('scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete score';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
