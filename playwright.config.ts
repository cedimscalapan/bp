import { defineConfig } from '@playwright/test';
export default defineConfig({timeout:60000,testDir:'./e2e',use:{baseURL:'http://127.0.0.1:5182',browserName:'chromium',channel:'msedge',headless:true},webServer:{command:'npm run build && npm run preview -- --port 5182',url:'http://127.0.0.1:5182',reuseExistingServer:true},workers:1});
