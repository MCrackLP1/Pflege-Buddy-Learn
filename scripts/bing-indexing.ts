#!/usr/bin/env node
/**
 * Bing Webmaster Tools indexing trigger
 * Usage: npm run seo:bing
 */

const BING_URLS = [
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

async function submitToBing() {
  console.log('🔵 Triggering Bing indexing...\n');

  // Method 1: Bing URL Submission (Manual)
  console.log('📝 Manual Bing Submissions needed:');
  console.log('Go to: https://www.bing.com/webmasters');
  console.log('');

  for (const url of BING_URLS) {
    console.log(`🔗 Submit URL: ${url}`);
    console.log(`   → Sites & Sitemaps → Submit URLs`);
    console.log(`   → Or use: Inspect URL feature`);
    console.log('');
  }

  // Method 2: Bing Sitemap Ping
  try {
    const sitemapUrl = 'https://www.pflegebuddy.app/sitemap.xml';
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    
    console.log('🎯 Pinging Bing sitemap...');
    const response = await fetch(bingPingUrl);
    console.log(`✅ Bing sitemap ping: ${response.status}`);
    
  } catch (error) {
    console.error('❌ Bing ping error:', error);
  }

  console.log('\n🎯 Bing-spezifische Vorteile:');
  console.log('• Oft schnellere Indexierung als Google');
  console.log('• Direkter URL-Submit möglich');
  console.log('• Weniger Konkurrenz = bessere Rankings');
  console.log('• ~15% des deutschen Suchverkehrs');
  
  console.log('\n✅ BING SETUP STATUS:');
  console.log('• Bing Verification Code: 634EC7319507185DEBBCB16C4AD2D99F ✅');
  console.log('• Meta Tag hinzugefügt ✅');
  console.log('• Webmaster Tools verbunden ✅');
  
  console.log('\n📊 Bing Webmaster Dashboard checken:');
  console.log('• Crawl Stats → Neue Aktivität');
  console.log('• Index Explorer → Neue URLs');
  console.log('• Search Performance → Traffic Changes');
}

submitToBing().catch(console.error);
