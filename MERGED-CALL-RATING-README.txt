SHIPGLOBAL MERGED CALL + RATING FRONTEND

This folder combines the CTI call-popup flow and the Rating section preview.

FLOW:
1. Incoming call popup appears at the bottom-right.
2. Caller/vendor value is 12345 in this demo.
3. Click Accept / Receive -> call timer starts.
4. The caller value is sent to Customers > Vendors > Find a Vendor.
5. The matching vendor overview opens automatically.
6. Click End Call OR Reject -> call popup disappears and the small Rating popup opens.
7. Good / Better saves directly.
8. Hover Bad -> four issue choices appear:
   1. Abuse / Scam inquiry
   2. Provide
   3. Time consuming
   4. Stubborn
9. Selecting a rating saves a separate rating record in browser localStorage.
10. Open Rating in the left sidebar to see all customers, total calls, average rating and last rating.
11. View Details shows every rating/call for the selected contact number.

IMPORTANT:
This is a frontend demo. The current storage is browser localStorage.
For production, replace the localStorage save in common/js/cti-demo.js with your backend/API call.

RUN:
Open index.html with VS Code Live Server.
