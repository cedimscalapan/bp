import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./e2e',use:{baseURL:'http://127.0.0.1:5180',browserName:'chromium',channel:'msedge',headless:true},webServer:{command:'npm run dev -- --port 5180',url:'http://127.0.0.1:5180',reuseExistingServer:true},workers:1});
