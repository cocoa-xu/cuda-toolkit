const { MirrorDownloader } = require('./lib/mirror-downloader');
const path = require('path');
const os = require('os');

async function testMirrorDownloader() {
  console.log('Testing Mirror Downloader with concurrent downloads and progress bars...\n');
  
  // Use a temporary directory for testing
  const testDir = path.join(os.tmpdir(), 'cuda-mirror-test');
  
  const downloader = new MirrorDownloader({
    rootDir: testDir,
    maxConcurrent: 3,
    showProgress: true
  });

  // Test with multiple smaller URLs to see concurrent progress bars
  const testUrls = [
    'https://httpbin.org/bytes/1048576',  // 1MB
    'https://httpbin.org/bytes/2097152',  // 2MB  
    'https://httpbin.org/bytes/524288',   // 512KB
  ];
  
  console.log(`Testing with ${testUrls.length} concurrent downloads`);
  console.log(`Root directory: ${testDir}`);
  console.log('This will demonstrate the new multi-line progress bars\n');

  try {
    const results = await downloader.downloadAll(testUrls);
    console.log(`\n✅ Success! Downloaded ${results.length} files`);
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result}`);
    });
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testMirrorDownloader();
}