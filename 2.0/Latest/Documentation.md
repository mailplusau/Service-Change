Scheduled Price Change Workflow
===============================
This document describes the workflow for a scheduled price change. The workflow is as follows:

Scheduled Price Change System involves 7 scripts
1. Financial Team Client Script
    mp_cl_price_change_financial_2.js
2. Financial Team Suitelet Script
    mp_sl_price_change_financial_2.js
3. IT Team Client Script
    mp_cl_price_change_it_2.js
4. IT Team Suitelet Script
    mp_sl_price_change_it_2.js
5. Price Increase Send Email Scheduled Script
    mp_ss_price_change_send_email_2.js
6. Scheduled Service Change Scheduled Script
    mp_ss_scheduled_service_change_2.js
7. Commencement Register Service Price Verses Financial Tab Price Scheduled Script
    mp_ss_comm_vs_financial_price.js

Financial Team Page
----------------------------

This page is used to create a new scheduled price increase in netsuite. Creates an finance allocated record, which also produces a service change and commencement register record. The script is triggered when the user clicks on the "New" button on the Scheduled Price Change System list view. The script is also triggered when the user clicks on the "Edit" button on the Scheduled Price Change System list view. The script is also triggered when the user clicks on the "View" button on the Scheduled Price Change System list view.


IT Team Page
----------------------------

This page is used to process/submit a new scheduled price increase in netsuite. It edits records created on finance page and sets status to scheduled. It can also be used to schedule new price increases for associated customers other services or remove finance allocated price increases to un-schedule them.

Price Increase Send Email Scheduled Script
----------------------------
Send out emails to customers. Also sets status to "Sent" on the Finance Allocated record.


Scheduled Service Change Scheduled Script
----------------------------
This script is used to process the commencement register records. Edits existing services with service change information. Also sets finance allocate record status to "Inactive".

Commencement Register Service Price Verses Financial Tab Price Scheduled Script
----------------------------

Lastly, this script is used to check the service price verses the financial tab price. If the service price is different to the financial tab price, it will update the service price to the financial tab price.

[]: # Path: Service-Change/2.0/Latest/Documentation.md