# PAR Map Data Automation

This folder contains a script to convert the weekly PAR CSV export into the TypeScript format required by the application.

## Usage Instructions

1.  **Prepare the CSV**: Place the latest `Customers PAR Status.csv` export in this `scripts/` folder.
2.  **Run the Conversion**:
    ```bash
    python scripts/csv_to_ts.py
    ```
3.  **Update the Application**:
    -   Open the newly created `scripts/customers_output.ts`.
    -   Copy the entire `raw` array from that file.
    -   Open `src/data/customers.ts`.
    -   Replace the existing `raw` array with the one you copied.
4.  **Update Metadata**:
    -   Update the `WEEK_LABEL` in `src/data/customers.ts` to reflect the current week.
5.  **Verify & Deploy**:
    -   Run `npm run dev` to verify the dots render correctly on the map.
    -   Push your changes to GitHub to trigger a Vercel deployment.
