const fs = require("fs");
const path = require("path");

// ✅ Allowed extensions
const allowedExtensions = new Set([
  // General files
  "bash","bat","clj","cljc","cljs","cmd","css","csv","edn","go","gql","graphql",
  "html","java","js","json","jsx","kt","kts","less","markdown","md","php","ps1",
  "ps1xml","psd1","psm1","py","r","rb","rda","rdata","rds","rhistory","rmarkdown",
  "rmd","rprofile","rproj","rs","scss","sh","sql","swift","toml","ts","tsv",
  "tsx","txt","wasm","wast","wat","xml","yaml","yml","fontf",

  // Images
  "bmp","eps","gif","ico","jpeg","jpg","png","svg","tif","tiff","webp"
]);

// ✅ Folders to check
const TARGET_DIRS = ["../dist"];

let invalidFiles = [];

// 🔁 Recursive scan
function scanDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else {
      const ext = path.extname(file).slice(1).toLowerCase();

      if (!allowedExtensions.has(ext)) {
        invalidFiles.push(fullPath);
      }
    }
  }
}

// ▶ Run scan on all folders
let checkedAtLeastOne = false;

for (const folder of TARGET_DIRS) {
  const fullPath = path.join(__dirname, folder);

  if (fs.existsSync(fullPath)) {
    console.log(`🔍 Checking folder: ${folder}`);
    checkedAtLeastOne = true;
    scanDir(fullPath);
  }
}

// ❗ If none exist
if (!checkedAtLeastOne) {
  console.error("❌ No build folders found (dist/build/out)");
  process.exit(1);
}

// 🚨 Result
if (invalidFiles.length > 0) {
  console.error("\n❌ Deployment Blocked! Invalid files found:\n");
  invalidFiles.forEach(f => console.error(" -", f));
  process.exit(1);
} else {
  console.log("\n✅ All files are valid in build folders. Ready for deployment!");
}