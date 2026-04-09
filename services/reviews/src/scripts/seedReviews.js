require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

// Fake user IDs to act as review authors (matches seeded postgres users by concept)
const USER_IDS = [
  'seed-user-001', 'seed-user-002', 'seed-user-003', 'seed-user-004',
  'seed-user-005', 'seed-user-006', 'seed-user-007', 'seed-user-008',
  'seed-user-009', 'seed-user-010', 'seed-user-011', 'seed-user-012',
  'seed-user-013', 'seed-user-014', 'seed-user-015', 'seed-user-016',
  'seed-user-017', 'seed-user-018', 'seed-user-019', 'seed-user-020',
];

// Reviews per company: [rating, title, comment, flag_reason?]
const REVIEW_TEMPLATES = {
  'Sparkle Pro Cleaning': [
    [5, 'Absolutely spotless!', 'The team arrived on time and left my flat in perfect condition. Would book again without hesitation.'],
    [5, 'Outstanding service', 'Very professional cleaners. Every corner was addressed and they were discreet throughout.'],
    [4, 'Really good clean', 'Thorough job overall. A small area near the skirting was missed but I mentioned it and they fixed it on the spot.'],
    [5, 'Best cleaners in Manchester', 'Used them three times now — consistently excellent. Worth every penny.'],
    [3, 'Decent but pricey', 'Clean was good but for the price I expected a bit more attention to detail in the bathroom.'],
  ],
  'Crystal Clear Services': [
    [5, 'Transformed our office', 'Hired them for our London office after a refurb. The result was incredible — team was efficient and thorough.'],
    [4, 'Very professional', 'Good communication, arrived on time. The windows are the cleanest they\'ve ever been.'],
    [5, 'Highly recommended', 'Deep clean before our lease inspection. Got our full deposit back thanks to these guys.'],
    [2, 'Disappointing deep clean', 'Expected more for the deep clean package. Kitchen was done well but bathrooms felt rushed.', 'Potential misleading service description'],
    [4, 'Solid commercial cleaner', 'Regular weekly clean for our office — reliable and consistent quality.'],
  ],
  'Fresh Start Cleaners': [
    [4, 'Great value', 'Really affordable and the standard is good. Perfect for regular weekly cleans.'],
    [3, 'Hit and miss', 'Some weeks are great, others feel rushed. Would prefer more consistency.'],
    [5, 'Lovely team', 'The cleaners are always friendly and do a great job. My house feels fresh every week.'],
    [4, 'Good domestic service', 'Reliable and punctual. Minor quibble — they ran out of their own supplies once and asked to use mine.'],
  ],
  'Gleam & Shine Ltd': [
    [5, 'Exceptional commercial clean', 'Our warehouse has never looked this good. The team handled every inch professionally.'],
    [5, 'Top-tier industrial cleaning', 'Used for a post-construction clean. Absolutely first class — would use again for any large-scale job.'],
    [4, 'Very thorough', 'Comprehensive job across all three floors of our office block. A couple of areas needed a second pass but overall great.'],
    [5, 'Reliable and efficient', 'Monthly contract with these guys for two years. Never had a complaint from our staff. Highly recommended.'],
  ],
  'Green Touch Cleaning': [
    [5, 'Love the eco approach', 'Finally a cleaner that uses proper green products. My flat smells fresh without harsh chemicals.'],
    [4, 'Great eco-friendly option', 'Thorough clean using non-toxic products. My kids and pets are safe — that means a lot.'],
    [3, 'Products are good, pace is slow', 'Appreciated the eco products but the team took longer than expected. Result was good though.'],
  ],
  'Swift Maid Services': [
    [5, 'Same-day miracle', 'Booked at 9am, team arrived by noon. Place was immaculate for my guests that evening. Lifesaver!'],
    [4, 'Quick and reliable', 'Fast response and a solid clean. Not the deepest scrub but exactly what I needed for a regular tidy.'],
    [5, 'Brilliant service', 'Third time using Swift Maid. Always on time, always great. Highly recommend for regular domestic cleans.'],
    [2, 'Rushed job', 'Felt like they were trying to get in and out too fast. Left some visible dust on shelves.', 'Suspected fake positive reviews on external platform'],
  ],
  'Highland Domestic Cleaning': [
    [5, 'Wonderful cleaners', 'Used them for end-of-tenancy. Landlord was very happy — no deductions from our deposit.'],
    [4, 'Very good domestic clean', 'Friendly staff and a thorough job. Will definitely use again.'],
    [5, 'Excellent Edinburgh cleaner', 'Regular cleaner has been coming for 6 months. Consistent quality every time.'],
    [3, 'Carpet clean was average', 'Main house clean was great but carpet cleaning left some stains still visible. Expected better.'],
  ],
  'Midlands Deep Clean': [
    [5, 'Industrial clean done right', 'Our factory floor had years of grime. Midlands Deep Clean tackled it in one day. Remarkable.'],
    [5, 'Professional and thorough', 'Used for a commercial kitchen deep clean. Passed our health inspection with flying colours.'],
    [4, 'Good service', 'Reliable and well-equipped. Took on a difficult job and delivered.'],
    [5, 'Outstanding results', 'After a flooding incident we needed an emergency clean and sanitise. They came within hours and did a brilliant job.'],
  ],
};

(async () => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();

  const companiesCol = db.collection('companies');
  const reviewsCol   = db.collection('reviews');

  // Fetch seeded companies by name to get their real _ids
  const companyNames = Object.keys(REVIEW_TEMPLATES);
  const companies = await companiesCol
    .find({ name: { $in: companyNames } }, { projection: { _id: 1, name: 1 } })
    .toArray();

  if (companies.length === 0) {
    console.error('No companies found — run seedCompanies.js first');
    await client.close();
    process.exit(1);
  }

  const idMap = {};
  for (const c of companies) idMap[c.name] = c._id.toString();

  let inserted = 0;
  let skipped  = 0;
  let userIdx  = 0;

  const statuses = ['published', 'published', 'published', 'published', 'flagged']; // weighted

  for (const [companyName, reviews] of Object.entries(REVIEW_TEMPLATES)) {
    const company_id = idMap[companyName];
    if (!company_id) {
      console.warn(`  ⚠ Company not found in DB: ${companyName}`);
      continue;
    }

    for (const [rating, title, comment, flag_reason] of reviews) {
      const user_id = USER_IDS[userIdx % USER_IDS.length];
      userIdx++;

      let status = flag_reason ? 'flagged' : 'published';
      const now = new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000); // random date within 90 days

      try {
        await reviewsCol.insertOne({
          company_id,
          user_id,
          rating,
          title,
          comment,
          status,
          flag_reason: flag_reason || null,
          created_at: now,
          updated_at: now,
        });
        inserted++;
      } catch (err) {
        if (err.code === 11000) skipped++; // duplicate user+company combo
        else throw err;
      }
    }
  }

  console.log(`✓ Reviews seeded — ${inserted} inserted, ${skipped} skipped (duplicate user/company)`);
  await client.close();
})().catch((err) => { console.error(err.message); process.exit(1); });
