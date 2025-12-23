# Chit Fund Management App

A full-stack Next.js application for managing chit funds and lottery draws with MongoDB integration.

## Features

- **Authentication System**: Login with role-based access (Admin/User)
- **Member Management**: Bulk upload members via CSV with auto-generated Member IDs (AGR + 4 digits + Letter)
- **Chit Fund Groups**: Create and manage multiple chit fund groups with customizable parameters
- **Lottery Draw System**: High-end visual spinner using Framer Motion to pick 3 random winners
- **Winner History**: Track all winners across all chit fund groups, organized by month
- **Member Search**: Search members by Mobile or Member ID and view their winning history
- **WhatsApp Integration**: Send WhatsApp messages to winners with their details
- **PDF Export**: Export winner history as PDF for transparency
- **Role-Based Access**: Admin users can manage everything, regular users can view and participate in draws

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Animations**: Framer Motion
- **File Processing**: PapaParse (CSV)
- **PDF Generation**: jsPDF

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure MongoDB**
   - Create a `.env.local` file in the root directory
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=your_mongodb_connection_string_here
     ```

3. **Create Default Users**
   - Run the script to create default admin and user accounts:
     ```bash
     node scripts/create-default-users.js
     ```
   - Default credentials:
     - **Admin**: username: `admin`, password: `admin123`
     - **User**: username: `user`, password: `user123`
   - **Important**: Change these passwords after first login!

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Login**
   - Navigate to `http://localhost:3000`
   - You'll be redirected to `/login` if not authenticated
   - Use the default credentials to login

## Database Schema

### Member Schema
- Name
- Member ID (Auto-generated: AGR + 4 digits + Letter)
- Mobile
- Email
- Location
- Aadhar

### ChitSet Schema
- Name (e.g., "50K Group")
- Total Members (200)
- Draw Date (Day of month: 1-31)
- Monthly Amount
- Active Members (Array of Member IDs)
- Winner History (Array of {MemberID, MemberName, DateWon, Amount})

## API Routes

- `POST /api/members/bulk` - Bulk upload members from CSV
- `GET /api/members` - Fetch all members
- `GET /api/sets` - Fetch all chit fund groups
- `POST /api/sets` - Create a new chit fund group
- `PATCH /api/draw-winner` - Pick 3 random winners and update the set
- `GET /api/search` - Search member by Mobile or Member ID

## CSV Upload Format

The CSV file should have the following columns:
- Name
- Mobile
- Email
- Location
- Aadhar

Example:
```csv
Name,Mobile,Email,Location,Aadhar
John Doe,9876543210,john@example.com,Mumbai,123456789012
Jane Smith,9876543211,jane@example.com,Delhi,123456789013
```

## Usage

1. **Upload Members**: Go to "Upload Members" page and upload a CSV file with 200 members
   - A sample file `sample-200-members.csv` is included in the project
2. **Create Sample Chit Sets**: Go to "Create Sets" page to automatically create 3 pre-configured chit sets:
   - `1L_200_Member_20th_every_Month` (₹1,00,000, Draw on 20th)
   - `10K_200_Member_1st_everyMonth` (₹10,000, Draw on 1st)
   - `50K_200_Member_24th_everyMonth` (₹50,000, Draw on 24th)
   - Note: First 100 members will be common across all 3 sets
3. **Create Custom Chit Fund Group**: Go to "Management" tab and create a new group, selecting active members
4. **View Dashboard**: See all groups with progress bars and next draw dates
5. **Conduct Draw**: On the draw date, go to "Live Draw" tab and click "Start Draw"
6. **Search Members**: Use the "Search Member" page to find members and their winning history
7. **Export History**: Export winner history as PDF from the "Member Ledger" tab

## Database Cleanup

To reset the database and start fresh:

### Via Web UI (Recommended)
1. Go to "Cleanup" page from the navigation bar
2. View current data counts
3. Choose cleanup option:
   - **Delete All**: Removes all members, chit sets, and winner history
   - **Delete Members**: Removes only member records
   - **Delete Chit Sets**: Removes only chit fund groups

### Via Command Line
```bash
# Delete all data
node scripts/cleanup.js all

# Delete only members
node scripts/cleanup.js members

# Delete only chit sets
node scripts/cleanup.js sets

# Or use the shell script
./scripts/cleanup.sh all
```

**Warning**: Cleanup operations cannot be undone. Make sure to backup data if needed.

## Sample Data

A sample CSV file with 200 members is included (`sample-200-members.csv`). To set up the sample chit sets:

1. Upload `sample-200-members.csv` via the Upload Members page
2. Go to the "Create Sets" page (link in navigation)
3. Click "Create All 3 Chit Sets" button
4. The system will automatically:
   - Assign first 100 members to all 3 sets (common members)
   - Assign remaining 100 members to complete each set to 200 members

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── search/           # Search page
│   ├── upload/           # Upload page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main dashboard
│   └── globals.css       # Global styles
├── components/           # React components
├── models/               # Mongoose models
├── lib/                  # Utility functions
└── utils/                # Helper functions
```

## License

MIT

