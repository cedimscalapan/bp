import { defineConfig } from '@playwright/test';
export default defineConfig({timeout:60000,testDir:'./e2e',use:{baseURL:'http://127.0.0.1:5183',browserName:'chromium',channel:'msedge',headless:true},webServer:{timeout:120000,command:'npm run preview -- --port 5183',url:'http://127.0.0.1:5183',reuseExistingServer:true},workers:1});
