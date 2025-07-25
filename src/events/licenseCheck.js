// const { Client } = require('discord.js');
// const SteinStore = require('stein-js-client');
// const store = new SteinStore('https://api.steinhq.com/v1/storages/67d2c1d4c088333365816d61');
//
// // Track which licenses have been processed during this session
//
// async function checkLicenses(client) {
//     try {
//         const licenses = await store.read('[API] PilotLicense');
//         const currentTime = new Date().getTime();
//
//         for (const license of licenses) {  // Each iteration gets a single license object
//             // Convert the expiry string to a Date object
//             const expiryDate = new Date(license.Expiry.split(',')[0].split('/').reverse().join('-'));
//
//             if (expiryDate < new Date() && license.Status !== 'Expired') {
//                 await store.edit('[API] PilotLicense', {
//                     search: { Name: license.Name },  // This matches the specific license we're currently processing
//                     set: { Status: 'Expired' }
//                 });
//
//                 try {
//                     if (license.Did && license.Did.length > 0) {
//                         const user = await client.users.fetch(license.Did);  // Uses the Did from the current license
//                         await user.send(`<:SheetMoment:1136068085682552832> Your pilot license has expired! Please use /flighttest to request a new one.`);
//                     }
//                 } catch (error) {
//                     console.error(`Failed to notify user ${license.Name}:`, error);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error('License check error:', error);
//     }
// }
//
// module.exports = {
//     name: 'ready',
//     once: true,
//     execute(client) {
//         // Run initial check after a short delay to ensure bot is fully ready
//         setTimeout(() => {
//             checkLicenses(client);
//             // Start the hourly interval after the first check
//             setInterval(() => checkLicenses(client), 3600000);
//         }, 1000);
//     }
// };