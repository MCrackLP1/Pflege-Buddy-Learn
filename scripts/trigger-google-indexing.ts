#!/usr/bin/env node
/**
 * Script to trigger Google indexing for new pages
 * Usage: npm run trigger-indexing
 */

const PAGES_TO_INDEX = [
  'https://www.pflegebuddy.app/de/kontakt',
  'https://www.pflegebuddy.app/de/ueber-uns',
  'https://www.pflegebuddy.app/sitemap.xml'
];

async function pingGoogle() {
  console.log('🚀 Triggering Google to crawl new pages...\n');

  for (const url of PAGES_TO_INDEX) {
    try {
      // Method 1: Ping Sitemap (works for sitemap.xml)
      if (url.includes('sitemap.xml')) {
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(url)}`;
        const response = await fetch(pingUrl);
        console.log(`✅ Sitemap ping: ${response.status} - ${url}`);
        continue;
      }

      // Method 2: Manual check (you need to do this in Search Console UI)
      console.log(`📝 Manual action needed in Search Console:`);
      console.log(`   → Go to: https://search.google.com/search-console`);
      console.log(`   → URL Inspection: ${url}`);
      console.log(`   → Click "Request Indexing"`);
      console.log('');

    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error);
    }
  }

  console.log('\n🎯 Next steps:');
  console.log('1. Run this script daily for 3-5 days');
  console.log('2. Check Search Console for indexing status');
  console.log('3. Monitor Google search results for new sitelinks');
  console.log('\n📊 Expected timeline:');
  console.log('• 1-3 days: Pages discovered by Google');
  console.log('• 3-7 days: Pages indexed and searchable');  
  console.log('• 1-2 weeks: Sitelinks may appear in search results');
}

// Run the script
pingGoogle().catch(console.error);
