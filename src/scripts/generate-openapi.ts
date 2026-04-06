import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const OPENAPI_JSON_URL: string = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api-json`
  : "http://localhost:5001/api-json";

const BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const TYPES_OUTPUT: string = "src/types/openapi.d.ts";
const CLIENT_OUTPUT: string = "src/api-client";

let hasError = false;

function run(command: string, name: string): void {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ ${name} failed: ${error.message}`);
    } else {
      console.error(`❌ ${name} failed`, error);
    }
    hasError = true;
  }
}

// Generate types
run(
  `npx openapi-typescript ${OPENAPI_JSON_URL} --output ${TYPES_OUTPUT}`,
  "Types generation",
);

// Generate client
run(
  `npx openapi-typescript-codegen --input ${OPENAPI_JSON_URL} --output ${CLIENT_OUTPUT} --client fetch`,
  "Client generation",
);

// Patch OpenAPI.ts
try {
  const openApiFile: string = path.join(CLIENT_OUTPUT, "core", "OpenAPI.ts");
  if (fs.existsSync(openApiFile)) {
    let content: string = fs.readFileSync(openApiFile, "utf-8");

    // Patch BASE
    content = content.replace(/BASE:\s*(['"]).*?\1/, `BASE: '${BASE_URL}'`);

    // // Patch TOKEN
    // // Replace TOKEN: undefined with TOKEN: async () => { const session = await auth(); return session?.accessToken || ''; }
    // if (!content.includes("TOKEN: async () =>")) {
    //   const tokenPatch = `TOKEN: async () => {
    //     const { auth } = await import('@/auth');
    //     const session = await auth();
    //     return session?.accessToken || '';
    // }`;

    //   content = content.replace(/TOKEN:\s*undefined/, tokenPatch);
    // }

    fs.writeFileSync(openApiFile, content, "utf-8");
    // console.log(`✅ Patched OpenAPI.BASE and TOKEN dynamically`);
  } else {
    console.warn(`⚠️ OpenAPI.ts not found at ${openApiFile}, skipping patch`);
  }
} catch (err) {
  if (err instanceof Error) {
    console.error("❌ Failed to patch OpenAPI.ts", err.message);
  } else {
    console.error("❌ Failed to patch OpenAPI.ts", err);
  }
}

if (hasError) {
  process.exit(1);
}
