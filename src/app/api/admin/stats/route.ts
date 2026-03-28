import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // We don't need to authenticate the request because Middleware already blocked non-admins.
    
    const [users, subs, charities, draws, pool, winners] = await Promise.all([
      adminClient.from('profiles').select('*', { count: 'exact', head: true }),
      adminClient.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      adminClient.from('charities').select('*', { count: 'exact', head: true }),
      adminClient.from('draws').select('*', { count: 'exact', head: true }),
      adminClient.from('prize_pool').select('total_pool'),
      adminClient.from('winners').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    ]);

    const totalPrizePool = pool.data?.reduce((sum, p) => sum + Number(p.total_pool), 0) || 0;

    const charitiesData = await adminClient.from('charities').select('total_raised');
    const totalCharityRaised = charitiesData.data?.reduce((sum, c) => sum + Number(c.total_raised), 0) || 0;

    const stats = {
      totalUsers: users.count || 0,
      activeSubscribers: subs.count || 0,
      totalCharities: charities.count || 0,
      totalDraws: draws.count || 0,
      totalPrizePool,
      totalCharityRaised,
      pendingVerifications: winners.count || 0,
    };

    return NextResponse.json({ stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
