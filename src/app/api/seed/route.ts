import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const CHARITIES = [
  {
    name: 'The First Tee',
    description: 'Building game changers by empowering young people through golf. Programs reach youth in all 50 states and select international locations, teaching life skills through the game of golf.',
    category: 'Youth Development',
    website: 'https://firsttee.org',
    featured: true,
    total_raised: 12450,
  },
  {
    name: 'Folds of Honor',
    description: 'Providing educational scholarships to spouses and children of America\'s fallen and disabled service-members. Over 44,000 scholarships awarded since 2007.',
    category: 'Military & Veterans',
    website: 'https://foldsofhonor.org',
    featured: true,
    total_raised: 18200,
  },
  {
    name: 'Golf Fore Africa',
    description: 'Bringing clean water, education, and healthcare to communities in need across Africa. Founded by LPGA legend Betsy King, transforming lives one well at a time.',
    category: 'International Aid',
    website: 'https://golfforeafrica.org',
    featured: true,
    total_raised: 9800,
  },
  {
    name: 'Birdies for the Brave',
    description: 'PGA TOUR\'s flagship military appreciation initiative. Supports military homefront groups and provides memorable experiences for military families.',
    category: 'Military & Veterans',
    website: 'https://birdiesforthebrave.org',
    featured: false,
    total_raised: 7600,
  },
  {
    name: 'Drive, Chip & Putt',
    description: 'A free nationwide junior golf development program jointly run by the Masters Tournament, USGA and PGA of America. Building confidence through golf fundamentals.',
    category: 'Youth Development',
    website: 'https://drivechipandputt.com',
    featured: false,
    total_raised: 5400,
  },
  {
    name: 'The Nature Conservancy — Golf',
    description: 'Working with golf courses worldwide to create sustainable habitats, protect water resources, and reduce environmental impact through better course management.',
    category: 'Environment',
    website: 'https://nature.org',
    featured: false,
    total_raised: 4200,
  },
  {
    name: 'Special Olympics Golf',
    description: 'Providing year-round sports training and athletic competition for children and adults with intellectual disabilities through the unifying power of golf.',
    category: 'Disability & Inclusion',
    website: 'https://specialolympics.org',
    featured: true,
    total_raised: 11300,
  },
  {
    name: 'Wounded Warrior Project',
    description: 'Honoring and empowering wounded warriors through golf rehabilitation programs, adaptive clinics, and community building activities for veterans.',
    category: 'Military & Veterans',
    website: 'https://woundedwarriorproject.org',
    featured: false,
    total_raised: 15700,
  },
  {
    name: 'St. Jude Children\'s Research Hospital',
    description: 'Leading the way the world understands, treats and defeats childhood cancer. Every fairway and green can fund life-saving research.',
    category: 'Health & Research',
    website: 'https://stjude.org',
    featured: true,
    total_raised: 22100,
  },
  {
    name: 'Habitat for Humanity Golf',
    description: 'Building homes, communities and hope. Golf events raise critical funds for housing stability and community development worldwide.',
    category: 'Housing & Community',
    website: 'https://habitat.org',
    featured: false,
    total_raised: 8900,
  },
];

export async function POST() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    // Clear existing charities and re-seed
    await supabase.from('charities').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert charities
    const { data, error } = await supabase
      .from('charities')
      .insert(CHARITIES)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Seeded ${data.length} charities successfully.`,
      charities: data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to seed data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
