#!/usr/bin/env node
/**
 * Yandex Webmaster Tools specific indexing script
 * Usage: npm run seo:yandex
 */

const YANDEX_URLS = [
  'https://www.pflegebuddy.app/de',
  'https://www.pflegebuddy.app/de/learn',
  'https://www.pflegebuddy.app/de/ranked',
  'https://www.pflegebuddy.app/de/review',
  'https://www.pflegebuddy.app/de/profile',
  'https://www.pflegebuddy.app/de/shop',
  'https://www.pflegebuddy.app/de/kontakt',
  'https://www.pflegebuddy.app/de/ueber-uns',
  'https://www.pflegebuddy.app/de/faq',
  'https://www.pflegebuddy.app/sitemap.xml'
];

const SITEMAP_URL = 'https://www.pflegebuddy.app/sitemap.xml';

async function submitToYandex() {
  console.log('🟠 YANDEX SEO BOOST: Triggering fastest search engine...\n');

  // Yandex Sitemap Ping
  try {
    const yandexPingUrl = `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
    const response = await fetch(yandexPingUrl);
    console.log(`✅ Yandex sitemap ping: ${response.status}`);
    console.log('   → Yandex typically indexes 1-2 days faster than Google!');
  } catch (error) {
    console.error('❌ Yandex sitemap ping error:', error);
  }

  console.log('\n📝 MANUAL YANDEX ACTIONS:');
  console.log('🟠 Yandex Webmaster: https://webmaster.yandex.com/');
  console.log('\n🔄 Indexing → Reindex pages:');
  
  YANDEX_URLS.forEach(url => {
    if (!url.includes('sitemap')) {
      console.log(`   • Add URL: ${url}`);
      console.log(`     → Click "Check URL"`);
      console.log(`     → Click "Add to reindexing queue"`);
      console.log('');
    }
  });

  console.log('📊 YANDEX ADVANTAGES:');
  console.log('• ⚡ Fastest indexing: Often 1-2 days');
  console.log('• 🌍 Strong in Eastern Europe, growing in Germany');
  console.log('• 🔍 Less competition = potentially better rankings');
  console.log('• 🤖 Advanced AI understanding of content');
  console.log('• 📱 Great mobile search experience');

  console.log('\n🎯 YANDEX-SPECIFIC OPTIMIZATIONS:');
  console.log('✅ Yandex verification meta tag added: f34d8314aa876df9');
  console.log('• Consider Yandex.Metrica for analytics');
  console.log('• Yandex.Money integration for payments (if applicable)');
  console.log('• Optimize for Russian/CIS market if expanding');

  console.log('\n📋 YANDEX WEBMASTER CHECKLIST:');
  console.log('□ Site verification (✅ Done)');
  console.log('□ Sitemap submitted');
  console.log('□ URLs added to reindexing queue');
  console.log('□ Check "Indexing" → "Site quality"');
  console.log('□ Monitor "Search Queries" for new traffic');

  console.log('\n⏱️ EXPECTED TIMELINE:');
  console.log('• 6-12 hours: Yandex discovers new pages');
  console.log('• 1-2 days: Full indexing complete');
  console.log('• 3-5 days: Rankings stabilize');
  console.log('• 1-2 weeks: Potential featured snippets');

  console.log('\n🚀 PRO TIP:');
  console.log('Yandex often shows immediate results in "site:pflegebuddy.app"');
  console.log('Check tomorrow with: site:pflegebuddy.app kontakt');
}

submitToYandex().catch(console.error);
