SHIPGLOBAL CALL + RATING MERGED PROJECT

This version merges the editable call/rating flow with the saved-in-Rating-section project.

Included:
- ShipGlobal sidebar and Vendor interface
- Incoming call popup at bottom-right
- Caller/vendor value 12345 demo
- Accept/Receive starts timer
- Caller value is sent to Customers > Vendors > Find a Vendor
- Matching vendor overview opens automatically
- Minimize/restore call popup
- Reject or End Call closes call popup and opens Rating popup
- Good / Better rating saves
- Hover Bad shows four issue types
- Every call rating is saved as a separate localStorage record
- Rating section shows all customers, total calls, rated calls and average rating
- Search by contact number
- View Details shows every rating/call
- Monthly call summary and customer monthly call count
- Call date/time, duration, agent, vendor ID, reason and call information

DATA STORAGE:
The demo uses browser localStorage with key:
shipglobal_call_ratings

PRODUCTION:
Replace the localStorage save/read functions with your backend API/database.

RUN:
1. Extract this ZIP.
2. Open the extracted folder in VS Code.
3. Open index.html.
4. Use Live Server.

MAIN FILES:
index.html
common/js/cti-demo.js
common/js/rating-page.js
common/js/customer-pages.js
modules/customers/vendors/vendors.js
common/css/rating-page.css
common/css/cti-demo.css

RATING FILTERING UPDATE:
Vendor Overview > Rating now shows only records whose Vendor ID AND contact number both match the vendor currently open. This keeps 12345/8409767926 data separate from every other vendor/contact.
