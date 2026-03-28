import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { generateRandomNumbers, generateAlgorithmicNumbers, processDraw, calculatePrizePerWinner } from '@/lib/draw-engine';

// GET: Fetch draws
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const status = request.nextUrl.searchParams.get('status');

    let query = supabase.from('draws').select('*, prize_pool(*)').order('draw_date', { ascending: false });
    if (status) {
      query = query.eq('status', status);
    }

    const { data: draws, error } = await query;
    if (error) throw error;

    return NextResponse.json({ draws });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch draws';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Admin - Create, simulate, or publish a draw
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, drawId, logicType, month, year } = body;

    if (action === 'create') {
      // Create a new draw
      const drawDate = new Date(year, month - 1, 28); // Last week of month
      const { data: draw, error } = await supabase
        .from('draws')
        .insert({
          draw_date: drawDate.toISOString().split('T')[0],
          month,
          year,
          status: 'pending',
          logic_type: logicType || 'random',
        })
        .select()
        .single();

      if (error) throw error;

      // Calculate prize pool
      const { count: activeSubscribers } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const totalPool = (activeSubscribers || 0) * 5;

      // Get previous jackpot rollover
      const { data: prevPool } = await supabase
        .from('prize_pool')
        .select('jackpot_rollover')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const rollover = prevPool?.jackpot_rollover || 0;

      await supabase.from('prize_pool').insert({
        draw_id: draw.id,
        total_pool: totalPool + rollover,
        five_match_share: totalPool * 0.40 + rollover,
        four_match_share: totalPool * 0.35,
        three_match_share: totalPool * 0.25,
        jackpot_rollover: 0,
        active_subscribers: activeSubscribers || 0,
      });

      // Auto-enter all active subscribers
      const { data: subscribers } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active');

      if (subscribers) {
        for (const sub of subscribers) {
          const { data: scores } = await supabase
            .from('scores')
            .select('score')
            .eq('user_id', sub.user_id)
            .order('created_at', { ascending: false })
            .limit(5);

          const numbers = scores?.map((s) => s.score) || [];
          if (numbers.length > 0) {
            await supabase.from('draw_entries').insert({
              draw_id: draw.id,
              user_id: sub.user_id,
              numbers,
            });
          }
        }
      }

      // Update total entries
      const { count: entriesCount } = await supabase
        .from('draw_entries')
        .select('*', { count: 'exact', head: true })
        .eq('draw_id', draw.id);

      await supabase.from('draws').update({ total_entries: entriesCount || 0 }).eq('id', draw.id);

      return NextResponse.json({ draw });
    }

    if (action === 'simulate' || action === 'publish') {
      if (!drawId) {
        return NextResponse.json({ error: 'Draw ID required' }, { status: 400 });
      }

      const { data: draw } = await supabase.from('draws').select('*').eq('id', drawId).single();
      if (!draw) {
        return NextResponse.json({ error: 'Draw not found' }, { status: 404 });
      }

      // Generate winning numbers
      let winningNumbers: number[];
      if (draw.logic_type === 'algorithmic') {
        const { data: allScores } = await supabase.from('scores').select('score');
        winningNumbers = generateAlgorithmicNumbers(allScores?.map((s) => s.score) || []);
      } else {
        winningNumbers = generateRandomNumbers();
      }

      // Get all entries
      const { data: entries } = await supabase
        .from('draw_entries')
        .select('*')
        .eq('draw_id', drawId);

      // Process matches
      const result = processDraw(
        entries?.map((e) => ({ userId: e.user_id, numbers: e.numbers })) || [],
        winningNumbers
      );

      // Get prize pool
      const { data: pool } = await supabase
        .from('prize_pool')
        .select('*')
        .eq('draw_id', drawId)
        .single();

      // Calculate winners
      const fiveMatches = result.matches.filter((m) => m.matchCount === 5);
      const fourMatches = result.matches.filter((m) => m.matchCount === 4);
      const threeMatches = result.matches.filter((m) => m.matchCount === 3);

      const newStatus = action === 'publish' ? 'published' : 'simulated';

      // Update draw with winning numbers
      await supabase.from('draws').update({
        winning_numbers: winningNumbers,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }).eq('id', drawId);

      // Clear previous simulation winners if re-simulating
      await supabase.from('winners').delete().eq('draw_id', drawId);

      // Insert winners
      if (pool) {
        const fivePrize = calculatePrizePerWinner(pool.five_match_share, fiveMatches.length);
        const fourPrize = calculatePrizePerWinner(pool.four_match_share, fourMatches.length);
        const threePrize = calculatePrizePerWinner(pool.three_match_share, threeMatches.length);

        const winnerInserts = [
          ...fiveMatches.map((m) => ({
            draw_id: drawId,
            user_id: m.userId,
            match_type: 5,
            matched_numbers: m.matchedNumbers,
            prize_amount: fivePrize,
            verification_status: 'pending',
            payment_status: 'pending',
          })),
          ...fourMatches.map((m) => ({
            draw_id: drawId,
            user_id: m.userId,
            match_type: 4,
            matched_numbers: m.matchedNumbers,
            prize_amount: fourPrize,
            verification_status: 'pending',
            payment_status: 'pending',
          })),
          ...threeMatches.map((m) => ({
            draw_id: drawId,
            user_id: m.userId,
            match_type: 3,
            matched_numbers: m.matchedNumbers,
            prize_amount: threePrize,
            verification_status: 'pending',
            payment_status: 'pending',
          })),
        ];

        if (winnerInserts.length > 0) {
          await supabase.from('winners').insert(winnerInserts);
        }

        // Handle jackpot rollover if no 5-match winner
        if (fiveMatches.length === 0) {
          await supabase.from('prize_pool').update({
            jackpot_rollover: pool.five_match_share,
          }).eq('id', pool.id);
        }
      }

      return NextResponse.json({
        draw: { ...draw, winning_numbers: winningNumbers, status: newStatus },
        results: {
          winningNumbers,
          fiveMatches: fiveMatches.length,
          fourMatches: fourMatches.length,
          threeMatches: threeMatches.length,
          totalWinners: result.matches.length,
        },
      });
    }

    if (action === 'delete') {
      if (!drawId) return NextResponse.json({ error: 'Draw ID required' }, { status: 400 });
      
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Cascade delete is usually handled by DB, but we can just delete the draw row 
      // utilizing the adminClient to bypass any RLS protections stopping admins
      const { error } = await adminClient.from('draws').delete().eq('id', drawId);
      if (error) throw error;
      
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('API /api/draws POST error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process draw';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
