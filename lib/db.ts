import Database from "better-sqlite3-multiple-ciphers"
import path from "path"

// Database file will be stored in the project root
const dbPath = path.join(process.cwd(), "data", "bookings.db")

// Initialize database connection
let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs")
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    db = new Database(dbPath)
    // Apply SQLCipher encryption key — must be set before any other operation
    const encKey = process.env.DB_ENCRYPTION_KEY
    if (!encKey) throw new Error("DB_ENCRYPTION_KEY environment variable is not set")
    db.pragma(`cipher='sqlcipher'`)
    db.pragma(`key="${encKey}"`)
    db.pragma("journal_mode = WAL") // Better performance for concurrent reads

    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        vehicle TEXT NOT NULL,
        vehicle_reg TEXT,
        vehicle_year TEXT,
        issue TEXT NOT NULL,
        preferred_date TEXT,
        preferred_time TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Migrate existing databases - add new columns if they don't exist
    try { db.exec(`ALTER TABLE bookings ADD COLUMN vehicle_reg TEXT`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN vehicle_year TEXT`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN confirmed_date TEXT`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN confirmed_time TEXT`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN cancel_token TEXT`) } catch {}

    // Create invoices table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        customer_address TEXT,
        vehicle TEXT,
        labour_items TEXT NOT NULL DEFAULT '[]',
        parts_items TEXT NOT NULL DEFAULT '[]',
        notes TEXT,
        vat_enabled INTEGER DEFAULT 0,
        vat_rate REAL DEFAULT 20,
        status TEXT DEFAULT 'draft',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Migrate invoices table if needed
    try { db.exec(`ALTER TABLE invoices ADD COLUMN notes TEXT`) } catch {}
    try { db.exec(`ALTER TABLE invoices ADD COLUMN vat_rate REAL DEFAULT 20`) } catch {}
    try { db.exec(`ALTER TABLE invoices ADD COLUMN invoice_date TEXT`) } catch {}

    // Create customers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Create customer_vehicles table
    db.exec(`
      CREATE TABLE IF NOT EXISTS customer_vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        make_model TEXT NOT NULL,
        reg TEXT,
        year TEXT,
        notes TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `)

    // Create quotes table
    db.exec(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_number TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT,
        customer_address TEXT,
        vehicle TEXT,
        labour_items TEXT NOT NULL DEFAULT '[]',
        parts_items TEXT NOT NULL DEFAULT '[]',
        notes TEXT,
        vat_enabled INTEGER DEFAULT 0,
        vat_rate REAL DEFAULT 20,
        status TEXT DEFAULT 'draft',
        invoice_date TEXT,
        customer_id INTEGER,
        converted_invoice_id INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Migrate bookings and invoices to support customer_id
    try { db.exec(`ALTER TABLE bookings ADD COLUMN customer_id INTEGER`) } catch {}
    try { db.exec(`ALTER TABLE invoices ADD COLUMN customer_id INTEGER`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN address TEXT`) } catch {}
    // Service reminder opt-in
    try { db.exec(`ALTER TABLE customers ADD COLUMN service_reminder INTEGER DEFAULT 0`) } catch {}
    try { db.exec(`ALTER TABLE customers ADD COLUMN service_reminder_sent_at TEXT`) } catch {}

    // Create email_log table
    db.exec(`
      CREATE TABLE IF NOT EXISTS email_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        to_address TEXT NOT NULL,
        subject TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'sent',
        error TEXT,
        sent_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // New migrations
    try { db.exec(`ALTER TABLE bookings ADD COLUMN notes TEXT`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN work_done TEXT`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN confirm_token TEXT`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN customer_confirmed INTEGER DEFAULT 0`) } catch {}
    try { db.exec(`ALTER TABLE invoices ADD COLUMN paid_at TEXT`) } catch {}
    try { db.exec(`ALTER TABLE invoices ADD COLUMN payment_method TEXT`) } catch {}
    try { db.exec(`ALTER TABLE quotes ADD COLUMN confirm_token TEXT`) } catch {}
    try { db.exec(`ALTER TABLE quotes ADD COLUMN accepted_at TEXT`) } catch {}
    // Service reminder override date (for pre-existing customers not yet in the system)
    try { db.exec(`ALTER TABLE customers ADD COLUMN last_service_override TEXT`) } catch {}
    // Mileage and health report on invoices
    try { db.exec(`ALTER TABLE invoices ADD COLUMN mileage INTEGER`) } catch {}
    try { db.exec(`ALTER TABLE invoices ADD COLUMN health_report TEXT`) } catch {}
    // Labour discount (percentage, 0 = no discount)
    try { db.exec(`ALTER TABLE invoices ADD COLUMN labour_discount REAL DEFAULT 0`) } catch {}
    // Last known mileage on vehicles
    try { db.exec(`ALTER TABLE customer_vehicles ADD COLUMN last_mileage INTEGER`) } catch {}
    // IP address on bookings (for form submission logging)
    try { db.exec(`ALTER TABLE bookings ADD COLUMN ip_address TEXT`) } catch {}
    // Link bookings to quotes so job sheet shows what work was quoted
    try { db.exec(`ALTER TABLE bookings ADD COLUMN quote_id INTEGER`) } catch {}
    // Link invoices back to bookings for job sheet view
    try { db.exec(`ALTER TABLE invoices ADD COLUMN booking_id INTEGER`) } catch {}
    // Reminder + review request tracking
    try { db.exec(`ALTER TABLE bookings ADD COLUMN reminder_sent INTEGER DEFAULT 0`) } catch {}
    try { db.exec(`ALTER TABLE bookings ADD COLUMN review_request_sent INTEGER DEFAULT 0`) } catch {}
    // Job photos (JSON array of /uploads/jobs/... paths)
    try { db.exec(`ALTER TABLE bookings ADD COLUMN photos TEXT DEFAULT '[]'`) } catch {}

    // Create page_views table for analytics
    db.exec(`
      CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        ip_address TEXT,
        referrer TEXT,
        user_agent TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)
    try { db.exec(`ALTER TABLE page_views ADD COLUMN ip_address TEXT`) } catch {}
    // Index for fast analytics queries and deduplication
    db.exec(`CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)`)
    db.exec(`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)`)
    db.exec(`CREATE INDEX IF NOT EXISTS idx_page_views_ip_path ON page_views(ip_address, path, created_at)`)

    // Create site_settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        label TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        group_name TEXT NOT NULL DEFAULT 'General'
      )
    `)

    // Seed default site settings if empty
    const settingsCount = (db.prepare("SELECT COUNT(*) as c FROM site_settings").get() as {c:number}).c
    if (settingsCount === 0) {
      const ins = db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES (?,?,?,?,?)`)
      const defaults: [string, string, string, string, string][] = [
        ["phone",               "07463 451967",                            "Phone Number",            "Shown in FAQ, emails, and contact sections",          "Business Info"],
        ["email",               "contact@jamiesautocare.com",              "Contact Email",           "Shown in FAQ, emails, and booking confirmations",     "Business Info"],
        ["google_review_link",  "https://g.page/r/CQLwdcluH0kMEBM/review",  "Google Review Link",      "URL used in review request emails and shown in the site footer", "Business Info"],
        ["trustpilot_review_link", "https://ie.trustpilot.com/evaluate/jamiesautocare.com", "Trustpilot Review Link", "URL for customers to leave a Trustpilot review — shown in the site footer", "Business Info"],
        ["google_maps_link",    "",                                        "Google Maps Link",        "Optional Google Maps URL for your business listing",  "Business Info"],
        ["faq_coverage_text",   "Edinburgh and the wider Lothians & Borders region", "FAQ Coverage Description", "The text shown in the FAQ answer about which areas are covered", "Content"],
        ["labour_guarantee",    "14 days",   "Labour Guarantee",         "Labour guarantee wording shown in FAQ and invoices",             "Content"],
        ["parts_warranty",      "12,000 miles or 12 months (whichever comes first)", "Parts Warranty",           "Parts warranty wording shown in invoices and emails",           "Content"],
        ["callout_fee_note",    "A call-out / travel charge may apply depending on location. This will always be made clear before your appointment is confirmed.", "Call-Out Fee Note", "Shown in the FAQ answer about call-out fees", "Content"],
        ["payment_methods",     "We accept cash and card payments on the day. Payment is due once the work is complete.", "Payment Methods Note", "Shown in the FAQ answer about payment", "Content"],
        ["booking_advance_days","1",  "Minimum Booking Advance (days)", "Minimum number of days in advance a customer must book online. Default is 1.", "Booking"],
        ["reminder_interval_days","300","Service Reminder Interval (days)","How many days after last service to send an annual reminder. Default is 300 (~10 months).", "Booking"],
      ]
      for (const [key, value, label, description, group_name] of defaults) {
        ins.run(key, value, label, description, group_name)
      }
    }

    // Migrate existing settings: update old labour_guarantee value; add parts_warranty if missing
    db.prepare(`UPDATE site_settings SET value = '14 days' WHERE key = 'labour_guarantee' AND value = '3 months or 3,000 miles (whichever comes first)'`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('parts_warranty', '12,000 miles or 12 months (whichever comes first)', 'Parts Warranty', 'Parts warranty wording shown in invoices and emails', 'Content')`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('google_review_link', 'https://g.page/r/CQLwdcluH0kMEBM/review', 'Google Review Link', 'URL used in review request emails and shown in the site footer', 'Business Info')`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('trustpilot_review_link', 'https://ie.trustpilot.com/evaluate/jamiesautocare.com', 'Trustpilot Review Link', 'URL for customers to leave a Trustpilot review — shown in the site footer', 'Business Info')`).run()
    // Social media & directory profiles
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('whatsapp_number', '', 'WhatsApp Number', 'Your WhatsApp number in international format e.g. 447463451967 (no + or spaces). Shows a chat button on the website.', 'Social & Directories')`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('facebook_url', '', 'Facebook Page URL', 'Full URL to your Facebook business page e.g. https://facebook.com/jamiesautocare', 'Social & Directories')`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('instagram_url', '', 'Instagram Profile URL', 'Full URL to your Instagram profile e.g. https://instagram.com/jamiesautocare', 'Social & Directories')`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('tiktok_url', '', 'TikTok Profile URL', 'Full URL to your TikTok profile e.g. https://tiktok.com/@jamiesautocare', 'Social & Directories')`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('yell_url', '', 'Yell.com Profile URL', 'Full URL to your Yell business listing', 'Social & Directories')`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('checkatrade_url', '', 'Checkatrade Profile URL', 'Full URL to your Checkatrade profile', 'Social & Directories')`).run()
    db.prepare(`INSERT OR IGNORE INTO site_settings (key, value, label, description, group_name) VALUES ('mybuilder_url', '', 'MyBuilder Profile URL', 'Full URL to your MyBuilder profile (if applicable)', 'Social & Directories')`).run()

    // Create service_areas table
    db.exec(`
      CREATE TABLE IF NOT EXISTS service_areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        county TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        nearby_areas TEXT NOT NULL DEFAULT '[]',
        active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Seed service areas from static data if empty
    const areasCount = (db.prepare("SELECT COUNT(*) as c FROM service_areas").get() as {c:number}).c
    if (areasCount === 0) {
      const insArea = db.prepare(`INSERT OR IGNORE INTO service_areas (name, slug, county, description, nearby_areas, active, sort_order) VALUES (?,?,?,?,?,1,?)`)
      const seedAreas: [string, string, string, string, string, number][] = [
        ["Musselburgh",     "musselburgh",     "East Lothian", "Covering all of Musselburgh and surrounding streets including Fisherrow, Pinkie, and Stoneyhill.",      '["Portobello","Prestonpans","Tranent","Dalkeith"]',      1],
        ["Dalkeith",        "dalkeith",        "Midlothian",   "Full mobile mechanic coverage across Dalkeith including Eskbank, Woodburn, and Hardengreen.",           '["Bonnyrigg","Newtongrange","Gorebridge","Musselburgh"]', 2],
        ["Bonnyrigg",       "bonnyrigg",       "Midlothian",   "Serving Bonnyrigg and the surrounding Midlothian area including Lasswade and Broomieknowe.",            '["Dalkeith","Loanhead","Penicuik","Gorebridge"]',        3],
        ["Penicuik",        "penicuik",        "Midlothian",   "Mobile mechanic covering Penicuik, Valleyfield, and the surrounding Midlothian villages.",              '["Bonnyrigg","Loanhead","Gorebridge","Edinburgh"]',      4],
        ["Loanhead",        "loanhead",        "Midlothian",   "Covering Loanhead and nearby areas including Straiton and Burdiehouse.",                                '["Bonnyrigg","Penicuik","Edinburgh","Dalkeith"]',        5],
        ["Portobello",      "portobello",      "Edinburgh",    "Mobile mechanic serving Portobello, Joppa, and the east Edinburgh coastline.",                          '["Musselburgh","Leith","Edinburgh","Prestonpans"]',      6],
        ["Leith",           "leith",           "Edinburgh",    "Covering Leith, Newhaven, Granton, and the north Edinburgh waterfront area.",                           '["Edinburgh","Portobello","South Queensferry","Musselburgh"]', 7],
        ["South Queensferry","south-queensferry","Edinburgh",  "Mobile mechanic covering South Queensferry, Kirkliston, and the Queensferry area.",                    '["Edinburgh","Broxburn","Linlithgow","Leith"]',          8],
        ["Livingston",      "livingston",      "West Lothian", "Serving Livingston including Dedridge, Craigshill, Knightsridge, and all surrounding areas.",           '["Broxburn","Bathgate","Linlithgow","Edinburgh"]',       9],
        ["Bathgate",        "bathgate",        "West Lothian", "Mobile mechanic covering Bathgate, Armadale, Whitburn, and surrounding West Lothian areas.",            '["Livingston","Broxburn","Linlithgow","Falkirk area"]',  10],
        ["Broxburn",        "broxburn",        "West Lothian", "Serving Broxburn, Uphall, and East Calder across West Lothian.",                                        '["Livingston","South Queensferry","Edinburgh","Bathgate"]', 11],
        ["Prestonpans",     "prestonpans",     "East Lothian", "Mobile mechanic covering Prestonpans, Tranent, and the East Lothian coast.",                            '["Musselburgh","Haddington","Tranent","Portobello"]',    12],
        ["Haddington",      "haddington",      "East Lothian", "Serving Haddington, Gifford, and the surrounding East Lothian countryside.",                           '["Tranent","Prestonpans","Musselburgh","North Berwick"]', 13],
        ["Gorebridge",      "gorebridge",      "Midlothian",   "Mobile mechanic covering Gorebridge, Newtongrange, and surrounding Midlothian villages.",               '["Dalkeith","Bonnyrigg","Penicuik","Pathhead"]',         14],
        ["Linlithgow",      "linlithgow",      "West Lothian", "Covering Linlithgow and Bo\'ness area in West Lothian.",                                                 '["Bathgate","Broxburn","South Queensferry","Falkirk"]',  15],
      ]
      for (const row of seedAreas) insArea.run(...row)
    }

    // Create booking_availability table
    db.exec(`
      CREATE TABLE IF NOT EXISTS booking_availability (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        enabled INTEGER DEFAULT 1,
        slots TEXT DEFAULT '["09:00","11:00","13:00","15:00"]',
        available_days TEXT DEFAULT '[1,2,3,4,5]',
        closed_dates TEXT DEFAULT '[]',
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `)
    // Seed default row if empty
    db.exec(`INSERT OR IGNORE INTO booking_availability (id) VALUES (1)`)
    // Per-day slot overrides, e.g. {"6": ["10:00","12:00"]} for Saturday
    try { db.exec(`ALTER TABLE booking_availability ADD COLUMN day_slots TEXT DEFAULT '{}'`) } catch {}

    // Create recurring_expenses table
    db.exec(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        day_of_month INTEGER NOT NULL DEFAULT 1,
        receipt_ref TEXT,
        notes TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Create mileage_log table
    db.exec(`
      CREATE TABLE IF NOT EXISTS mileage_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        booking_id INTEGER,
        customer_name TEXT,
        from_location TEXT NOT NULL,
        to_location TEXT NOT NULL,
        miles REAL NOT NULL,
        round_trip INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Create expenses table
    db.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        receipt_ref TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Create service_presets table
    db.exec(`
      CREATE TABLE IF NOT EXISTS service_presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('labour','part')),
        description TEXT NOT NULL,
        hours REAL DEFAULT 1,
        rate REAL DEFAULT 0,
        qty REAL DEFAULT 1,
        unit_price REAL DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Create blog_posts table
    db.exec(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        published INTEGER DEFAULT 0,
        published_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Create pricing_items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS pricing_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        note TEXT,
        sort_order INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Seed initial pricing items if empty
    const pricingCount = (db.prepare("SELECT COUNT(*) as c FROM pricing_items").get() as {c: number}).c
    if (pricingCount === 0) {
      const insertPricing = db.prepare(`
        INSERT INTO pricing_items (category, name, price, note, sort_order, active)
        VALUES (@category, @name, @price, @note, @sort_order, @active)
      `)
      const seedPricing = [
        { category: "Servicing", name: "Interim Service", price: "from £89", note: "oil, filter, 25-point check", sort_order: 1, active: 1 },
        { category: "Servicing", name: "Full Service", price: "from £149", note: "oil, filters, plugs, full inspection", sort_order: 2, active: 1 },
        { category: "Servicing", name: "Oil & Filter Change", price: "from £59", note: null, sort_order: 3, active: 1 },
        { category: "Brakes", name: "Front Brake Pads (supply & fit)", price: "from £79", note: "per axle", sort_order: 1, active: 1 },
        { category: "Brakes", name: "Rear Brake Pads (supply & fit)", price: "from £79", note: "per axle", sort_order: 2, active: 1 },
        { category: "Brakes", name: "Front Brake Discs & Pads (supply & fit)", price: "from £149", note: "per axle", sort_order: 3, active: 1 },
        { category: "Brakes", name: "Rear Brake Discs & Pads (supply & fit)", price: "from £149", note: "per axle", sort_order: 4, active: 1 },
        { category: "Diagnostics & Electrical", name: "Vehicle Diagnostic Scan", price: "from £49", note: null, sort_order: 1, active: 1 },
        { category: "Diagnostics & Electrical", name: "Battery Test & Replacement", price: "from £29", note: "+ cost of battery", sort_order: 2, active: 1 },
        { category: "Diagnostics & Electrical", name: "Alternator / Starter Testing", price: "from £39", note: null, sort_order: 3, active: 1 },
        { category: "Suspension & Steering", name: "Shock Absorber / Strut (supply & fit)", price: "from £129", note: "per corner", sort_order: 1, active: 1 },
        { category: "Suspension & Steering", name: "Drop Link Replacement", price: "from £59", note: "per side", sort_order: 2, active: 1 },
        { category: "Suspension & Steering", name: "Anti-Roll Bar Bush", price: "from £49", note: "per side", sort_order: 3, active: 1 },
        { category: "General", name: "Call Out Fee", price: "from £0", note: "included in most jobs, may apply for remote areas", sort_order: 1, active: 1 },
        { category: "General", name: "Labour Rate", price: "£60/hour", note: null, sort_order: 2, active: 1 },
      ]
      for (const item of seedPricing) {
        insertPricing.run(item)
      }
    }

    // Seed initial blog posts if empty
    const blogCount = (db.prepare("SELECT COUNT(*) as c FROM blog_posts").get() as {c: number}).c
    if (blogCount === 0) {
      const insertPost = db.prepare(`
        INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at)
        VALUES (@title, @slug, @excerpt, @content, @published, @published_at)
      `)
      const seedPosts = [
        {
          title: "How to Know When Your Brakes Need Replacing",
          slug: "when-do-brakes-need-replacing",
          excerpt: "Your brakes are one of the most important safety systems on your vehicle. Here's how to spot the warning signs before they become a problem.",
          content: `Your brakes are without doubt one of the most critical safety systems on your vehicle. Knowing when they need attention can save you money — and potentially your life.

<p><strong>Squealing or squeaking noises</strong> are usually the first sign. Brake pads have a small metal indicator built in that starts to squeal when the pad material wears thin. If you hear a high-pitched noise when you press the brake pedal, don't ignore it — get them checked soon.</p>

<p><strong>Grinding sounds</strong> are more serious. If you've gone past the squealing stage, you'll hear a grinding or scraping noise. This means metal is rubbing on metal, which damages your discs as well as your pads. The repair bill increases significantly at this point, so acting on squealing early really does pay off.</p>

<p><strong>Longer stopping distances</strong> are a major red flag. If your car takes noticeably longer to stop than it used to, your braking system may be compromised. This could be worn pads, glazed discs, or even a brake fluid issue — all of which need immediate attention.</p>

<p><strong>Vibration through the pedal</strong> often points to warped brake discs. Discs can warp from excessive heat or uneven wear. You'll typically feel a pulsing sensation through the brake pedal when stopping. Warped discs affect braking efficiency and should be replaced.</p>

<p><strong>The brake warning light</strong> on your dashboard shouldn't be dismissed. It can indicate low brake fluid, worn pads, or an ABS fault. A diagnostic scan will identify exactly what's triggering it.</p>

<p><strong>Pulling to one side</strong> under braking suggests uneven pad wear or a sticking calliper. Your vehicle should stop in a straight line — if it pulls left or right, there's an imbalance that needs correcting.</p>

<p>As a rule of thumb, have your brakes inspected at every service. Catching wear early means pads-only replacement rather than pads and discs, which makes a noticeable difference to the cost. If you have any doubt, it's always better to get them checked.</p>`,
          published: 1,
          published_at: new Date().toISOString(),
        },
        {
          title: "What Happens During a Full Car Service?",
          slug: "what-happens-during-a-full-service",
          excerpt: "Many drivers aren't sure what a full service actually involves. We break down exactly what gets checked, changed, and inspected.",
          content: `A full service is one of the most thorough health checks you can give your vehicle, yet many drivers aren't quite sure what's actually included. Here's a breakdown of what happens during a full car service at Jamie's Auto Care.

<p><strong>Engine oil and filter change</strong> is the cornerstone of any service. Fresh oil lubricates the engine's moving parts, reduces friction, and helps prevent premature wear. The old filter is replaced at the same time to ensure the new oil stays clean.</p>

<p><strong>Air filter replacement</strong> keeps the engine breathing properly. A blocked air filter restricts airflow, reducing performance and fuel efficiency. Replacing it is a simple but important job.</p>

<p><strong>Spark plug inspection or replacement</strong> ensures reliable ignition. Worn spark plugs cause misfires, poor fuel economy, and hard starting. On a full service, plugs are either inspected and tested or replaced depending on mileage and condition.</p>

<p><strong>Brake inspection</strong> covers pad thickness, disc condition, and calliper operation. Brake fluid level and condition are also checked — brake fluid absorbs moisture over time and should be replaced every two years regardless of mileage.</p>

<p><strong>Tyre check</strong> includes tread depth, tyre pressure, and visual inspection for damage or uneven wear. Tyre condition directly affects safety, handling, and fuel economy.</p>

<p><strong>Fluid top-ups</strong> include coolant, power steering fluid (where applicable), windscreen washer fluid, and brake fluid. Keeping fluids at the correct level prevents breakdowns and component damage.</p>

<p><strong>Lights check</strong> ensures all headlights, indicators, brake lights, and fog lights are functioning correctly. A faulty light is an MOT failure and a road safety issue.</p>

<p><strong>Battery test</strong> using a digital tester checks the battery's health and charging state. Batteries tend to fail without warning, so testing regularly is worthwhile — especially before winter.</p>

<p>At the end of the service, you'll receive a clear summary of what was done and anything that may need attention in the near future.</p>`,
          published: 1,
          published_at: new Date().toISOString(),
        },
        {
          title: "Mobile Mechanic vs Garage: Which Is Right for You?",
          slug: "mobile-mechanic-vs-garage",
          excerpt: "Choosing between a mobile mechanic and a traditional garage? We look at the pros and cons of each to help you decide.",
          content: `When your car needs attention, you have two main options: book it into a traditional garage, or call a mobile mechanic. Both have their place — here's how to decide which is right for your situation.

<p><strong>The biggest advantage of a mobile mechanic is convenience.</strong> Instead of dropping your car off at a garage and arranging alternative transport, a mobile mechanic comes to you — at home, at work, or wherever the vehicle is parked. For busy people, this alone is worth a significant amount.</p>

<p><strong>No recovery truck needed</strong> is another major benefit. If your car won't start or isn't safe to drive, a mobile mechanic can diagnose and often fix the problem on the spot. You avoid the cost and hassle of a breakdown service and tow.</p>

<p><strong>Transparency</strong> is something many customers appreciate about mobile mechanics. You can watch the work being done, ask questions, and see exactly what's happening with your vehicle. There's no black box element where you drop it off and hope for the best.</p>

<p><strong>Cost can be lower with a mobile mechanic</strong> because overheads are significantly reduced. No premises, no large team of staff — savings that are often passed on to the customer. That said, a reputable garage and a reputable mobile mechanic should be similarly competitive on price for most standard jobs.</p>

<p><strong>When a traditional garage might be better:</strong> Some jobs genuinely require specialist equipment that can't be brought to you. Major engine rebuilds, MOT tests (which legally must be done at an authorised test centre), bodywork and paint repairs, and complex gearbox work are examples where a garage is the right choice.</p>

<p><strong>The verdict:</strong> For the vast majority of common repairs — brakes, servicing, diagnostics, suspension, electrical faults, tyres — a qualified mobile mechanic offers a genuinely better experience than a traditional garage. The convenience factor is hard to beat, and with a fully qualified technician, the quality of work is no different.</p>

<p>If you're unsure whether your job suits a mobile mechanic, just give us a call — we'll be honest about whether we can help or whether a garage is the better option.</p>`,
          published: 1,
          published_at: new Date().toISOString(),
        },
      ]
      for (const post of seedPosts) insertPost.run(post)
    }

    // Seed default service presets if empty
    const presetCount = (db.prepare("SELECT COUNT(*) as c FROM service_presets").get() as {c: number}).c
    if (presetCount === 0) {
      const insertPreset = db.prepare(`
        INSERT INTO service_presets (name, type, description, hours, rate, qty, unit_price, sort_order)
        VALUES (@name, @type, @description, @hours, @rate, @qty, @unit_price, @sort_order)
      `)
      const seedPresets = [
        { name: "Full Service",        type: "labour", description: "Carry out full vehicle service", hours: 2,   rate: 60, qty: 1, unit_price: 0,  sort_order: 1 },
        { name: "Oil & Filter Change", type: "labour", description: "Drain and replace engine oil and filter", hours: 1, rate: 60, qty: 1, unit_price: 0, sort_order: 2 },
        { name: "Brake Pads (Front)",  type: "labour", description: "Supply and fit front brake pads", hours: 1.5, rate: 60, qty: 1, unit_price: 0, sort_order: 3 },
        { name: "Brake Pads (Rear)",   type: "labour", description: "Supply and fit rear brake pads",  hours: 1.5, rate: 60, qty: 1, unit_price: 0, sort_order: 4 },
        { name: "Diagnostic",          type: "labour", description: "Full vehicle diagnostic scan",    hours: 0.5, rate: 60, qty: 1, unit_price: 0, sort_order: 5 },
        { name: "Tyre Fitting",        type: "labour", description: "Remove and fit tyre (per wheel)", hours: 0.5, rate: 60, qty: 1, unit_price: 0, sort_order: 6 },
        { name: "Call Out Fee",        type: "labour", description: "Call out / travel charge",        hours: 1,   rate: 40, qty: 1, unit_price: 0, sort_order: 7 },
        { name: "Engine Oil 5W-30 5L", type: "part",   description: "Engine oil 5W-30 5L",            hours: 0,   rate: 0,  qty: 1, unit_price: 25, sort_order: 1 },
        { name: "Oil Filter",          type: "part",   description: "Oil filter",                      hours: 0,   rate: 0,  qty: 1, unit_price: 8,  sort_order: 2 },
        { name: "Air Filter",          type: "part",   description: "Air filter",                      hours: 0,   rate: 0,  qty: 1, unit_price: 12, sort_order: 3 },
      ]
      for (const p of seedPresets) insertPreset.run(p)
    }

    // Create portfolio_items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        vehicle TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        image_before TEXT NOT NULL DEFAULT '',
        image_after TEXT NOT NULL DEFAULT '',
        testimonial TEXT NOT NULL DEFAULT '',
        customer TEXT NOT NULL DEFAULT '',
        active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)
    // Seed from previous hardcoded items if table is empty
    const portCount = (db.prepare("SELECT COUNT(*) as c FROM portfolio_items").get() as {c:number}).c
    if (portCount === 0) {
      const insPort = db.prepare(`INSERT INTO portfolio_items (title, vehicle, description, image_before, image_after, sort_order) VALUES (?,?,?,?,?,?)`)
      const seedPort: [string, string, string, string, string, number][] = [
        ["Rear Brake Service", "VW Polo",     "Full rear brake pad and disc replacement carried out at the customer's home.",                              "/images/polo-rear-1-before.jpg",   "/images/polo-rear-1-after.jpg",   1],
        ["Rear Brake Service", "VW Polo",     "Rear brake pads and discs replaced. Brakes inspected and tested after fitting.",                           "/images/polo-rear-2-before.jpg",   "/images/polo-rear-2-after.jpg",   2],
        ["Rear Brake Service", "VW Scirocco", "Rear brake discs and pads replaced on this Scirocco. Clean result and full brake test completed.",          "/images/scirocco-rear-before.jpg", "/images/scirocco-rear-after.jpg", 3],
        ["Drop Link Replacement", "",          "Worn drop link identified and replaced. Resolved knocking from the front suspension.",                     "/images/drop-link-before.jpg",     "/images/drop-link-after.jpg",     4],
        ["Front Strut Replacement", "",        "Front strut replaced due to wear. Steering and suspension feel restored after fitting.",                   "/images/front-strut-before.jpg",   "/images/front-strut-after.jpg",   5],
      ]
      for (const row of seedPort) insPort.run(...row)
    }

    // Create admin_users table for multi-user auth
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'staff',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    // Seed default admin account (admin / admin) if no users exist
    const adminCount = (db.prepare("SELECT COUNT(*) as c FROM admin_users").get() as {c:number}).c
    if (adminCount === 0) {
      const { pbkdf2Sync, randomBytes } = require("crypto")
      const salt = randomBytes(16).toString("hex")
      const hash = pbkdf2Sync("admin", salt, 100000, 64, "sha512").toString("hex")
      db.prepare(`INSERT INTO admin_users (username, password_hash, role) VALUES ('admin', ?, 'admin')`).run(`${salt}:${hash}`)
    }

    // ── Demo data (only on a completely fresh install with no bookings) ──────
    const bookingCount = (db.prepare("SELECT COUNT(*) as c FROM bookings").get() as {c:number}).c
    if (bookingCount === 0) {
      // Demo customers via bookings
      const today = new Date()
      const fmt = (d: Date) => d.toISOString().split("T")[0]
      const past   = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d) }
      const future = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d) }

      const insBooking = db.prepare(`
        INSERT INTO bookings (name, phone, email, vehicle, vehicle_reg, vehicle_year, issue,
          preferred_date, preferred_time, address, status, confirm_token, quote_id)
        VALUES (@name, @phone, @email, @vehicle, @vehicle_reg, @vehicle_year, @issue,
          @preferred_date, @preferred_time, @address, @status, @confirm_token, NULL)
      `)

      insBooking.run({ name: "Demo Customer", phone: "07700 900001", email: "demo@example.com", vehicle: "Ford Focus", vehicle_reg: "AB12 CDE", vehicle_year: "2018", issue: "Oil and filter service overdue. Warning light on dash.", preferred_date: future(3), preferred_time: "09:00", address: "12 Demo Street, Edinburgh, EH1 1AA", status: "confirmed", confirm_token: "demo-token-1" })
      insBooking.run({ name: "Test User", phone: "07700 900002", email: "test@example.com", vehicle: "VW Golf", vehicle_reg: "EF34 GHI", vehicle_year: "2020", issue: "Front brake pads worn — grinding noise when stopping.", preferred_date: future(7), preferred_time: "11:00", address: "45 Test Lane, Dalkeith, EH22 2BB", status: "pending", confirm_token: "demo-token-2" })
      insBooking.run({ name: "Sample Person", phone: "07700 900003", email: "sample@example.com", vehicle: "Toyota Yaris", vehicle_reg: "JK56 LMN", vehicle_year: "2016", issue: "Full service + diagnostic scan for engine management light.", preferred_date: past(5), preferred_time: "13:00", address: "7 Sample Road, Penicuik, EH26 3CC", status: "completed", confirm_token: "demo-token-3" })
      insBooking.run({ name: "Example Client", phone: "07700 900004", email: "example@example.com", vehicle: "BMW 3 Series", vehicle_reg: "OP78 QRS", vehicle_year: "2019", issue: "Battery replacement and tyre pressure check.", preferred_date: past(10), preferred_time: "09:00", address: "22 Example Avenue, Bonnyrigg, EH19 4DD", status: "completed", confirm_token: "demo-token-4" })

      // Demo invoices linked to completed bookings
      const labourItems = JSON.stringify([{ description: "Oil & Filter Service", hours: 1, rate: 60 }])
      const partsItems  = JSON.stringify([{ description: "Engine Oil 5W-30 5L", qty: 1, unitPrice: 25 }, { description: "Oil Filter", qty: 1, unitPrice: 8 }])
      const labourItems2 = JSON.stringify([{ description: "Front Brake Pads Supply & Fit", hours: 1.5, rate: 60 }])
      const partsItems2  = JSON.stringify([{ description: "Front Brake Pads", qty: 1, unitPrice: 45 }])

      db.prepare(`
        INSERT INTO invoices (invoice_number, customer_name, customer_email, customer_phone, vehicle,
          labour_items, parts_items, vat_enabled, vat_rate, status, payment_method, notes, created_at)
        VALUES ('INV-0001', 'Sample Person', 'sample@example.com', '07700 900003', 'Toyota Yaris JK56 LMN',
          ?, ?, 0, 20, 'paid', 'cash', 'Demo invoice — oil & filter service', ?)
      `).run(labourItems, partsItems, past(5))

      db.prepare(`
        INSERT INTO invoices (invoice_number, customer_name, customer_email, customer_phone, vehicle,
          labour_items, parts_items, vat_enabled, vat_rate, status, payment_method, notes, created_at)
        VALUES ('INV-0002', 'Example Client', 'example@example.com', '07700 900004', 'BMW 3 Series OP78 QRS',
          ?, ?, 0, 20, 'paid', 'card', 'Demo invoice — brake pads', ?)
      `).run(labourItems2, partsItems2, past(10))

      db.prepare(`
        INSERT INTO invoices (invoice_number, customer_name, customer_email, customer_phone, vehicle,
          labour_items, parts_items, vat_enabled, vat_rate, status, notes, created_at)
        VALUES ('INV-0003', 'Demo Customer', 'demo@example.com', '07700 900001', 'Ford Focus AB12 CDE',
          ?, '[]', 0, 20, 'sent', 'Demo invoice — awaiting payment', ?)
      `).run(JSON.stringify([{ description: "Full Service", hours: 2, rate: 60 }]), future(3))
    }
    // ── End demo data ─────────────────────────────────────────────────────────
  }
  return db
}

export type AdminUser = {
  id: number
  username: string
  password_hash: string
  role: "admin" | "staff"
  is_active: number
  created_at: string
}

export function getAdminUserByUsername(username: string): AdminUser | null {
  const db = getDb()
  return db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username) as AdminUser | null
}

export function listAdminUsers(): AdminUser[] {
  const db = getDb()
  return db.prepare("SELECT id, username, role, is_active, created_at FROM admin_users ORDER BY created_at ASC").all() as AdminUser[]
}

export function createAdminUser(username: string, passwordHash: string, role: "admin" | "staff"): void {
  const db = getDb()
  db.prepare("INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)").run(username, passwordHash, role)
}

export function updateAdminUserPassword(id: number, passwordHash: string): void {
  const db = getDb()
  db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").run(passwordHash, id)
}

export function updateAdminUserRole(id: number, role: "admin" | "staff"): void {
  const db = getDb()
  db.prepare("UPDATE admin_users SET role = ? WHERE id = ?").run(role, id)
}

export function toggleAdminUserActive(id: number): void {
  const db = getDb()
  db.prepare("UPDATE admin_users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?").run(id)
}

export function deleteAdminUser(id: number): void {
  const db = getDb()
  db.prepare("DELETE FROM admin_users WHERE id = ?").run(id)
}

export type Booking = {
  id: number
  name: string
  phone: string
  email: string
  vehicle: string
  vehicle_reg: string | null
  vehicle_year: string | null
  issue: string
  preferred_date: string | null
  preferred_time: string | null
  status: string
  created_at: string
  confirmed_date: string | null
  confirmed_time: string | null
  cancel_token: string | null
  address: string | null
  notes: string | null
  ip_address: string | null
  work_done: string | null
  confirm_token: string | null
  customer_confirmed: number
  customer_id: number | null
  quote_id: number | null
  reminder_sent: number
  review_request_sent: number
  photos: string | null
}

export type Invoice = {
  id: number
  invoice_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_address: string | null
  vehicle: string | null
  labour_items: string
  parts_items: string
  notes: string | null
  vat_enabled: number
  vat_rate: number
  status: string
  invoice_date: string | null
  paid_at: string | null
  payment_method: string | null
  customer_id: number | null
  mileage: number | null
  health_report: string | null
  labour_discount: number | null
  booking_id: number | null
  created_at: string
}

export type Quote = {
  id: number
  quote_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  customer_address: string | null
  vehicle: string | null
  labour_items: string
  parts_items: string
  notes: string | null
  vat_enabled: number
  vat_rate: number
  status: string
  invoice_date: string | null
  customer_id: number | null
  converted_invoice_id: number | null
  confirm_token: string | null
  accepted_at: string | null
  created_at: string
}

// Create a new booking
export function createBooking(data: {
  name: string
  phone: string
  email: string
  vehicle: string
  vehicle_reg: string | null
  vehicle_year: string | null
  issue: string
  preferred_date: string | null
  preferred_time: string | null
  address: string | null
  quote_id?: number | null
}): Booking {
  const db = getDb()
  const confirm_token = require("crypto").randomBytes(24).toString("hex")
  const stmt = db.prepare(`
    INSERT INTO bookings (name, phone, email, vehicle, vehicle_reg, vehicle_year, issue, preferred_date, preferred_time, address, status, confirm_token, quote_id)
    VALUES (@name, @phone, @email, @vehicle, @vehicle_reg, @vehicle_year, @issue, @preferred_date, @preferred_time, @address, 'pending', @confirm_token, @quote_id)
  `)

  const result = stmt.run({
    name: data.name,
    phone: data.phone,
    email: data.email,
    vehicle: data.vehicle,
    vehicle_reg: data.vehicle_reg,
    vehicle_year: data.vehicle_year,
    issue: data.issue,
    preferred_date: data.preferred_date,
    preferred_time: data.preferred_time,
    address: data.address,
    confirm_token,
    quote_id: data.quote_id ?? null,
  })

  return getBookingById(result.lastInsertRowid as number)!
}

// Confirm a booking via token (customer-facing)
export function confirmBookingByToken(token: string): { success: boolean; alreadyConfirmed?: boolean } {
  const db = getDb()
  const booking = db.prepare("SELECT * FROM bookings WHERE confirm_token = ?").get(token) as Booking | null
  if (!booking) return { success: false }
  if (booking.customer_confirmed) return { success: true, alreadyConfirmed: true }
  if (booking.status === "cancelled") return { success: false }
  // Mark customer as confirmed and auto-promote to confirmed status if a date is set
  db.prepare(`
    UPDATE bookings
    SET customer_confirmed = 1,
        status = CASE WHEN confirmed_date IS NOT NULL AND status = 'pending' THEN 'confirmed' ELSE status END
    WHERE confirm_token = ?
  `).run(token)
  return { success: true, alreadyConfirmed: false }
}

// Get booking by confirm token
export function getBookingByConfirmToken(token: string): Booking | null {
  const db = getDb()
  return db.prepare("SELECT * FROM bookings WHERE confirm_token = ?").get(token) as Booking | null
}

// Get all bookings ordered by creation date
export function getAllBookings(): Booking[] {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC")
  return stmt.all() as Booking[]
}

// Get a single booking by ID
export function getBookingById(id: number): Booking | null {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM bookings WHERE id = ?")
  return stmt.get(id) as Booking | null
}

// Update booking status
export function updateBookingStatus(id: number, status: string): boolean {
  const db = getDb()
  const stmt = db.prepare("UPDATE bookings SET status = ? WHERE id = ?")
  const result = stmt.run(status, id)
  return result.changes > 0
}

export function updateBookingDetails(id: number, data: {
  name: string
  phone: string
  email: string
  vehicle: string
  vehicle_reg: string | null
  vehicle_year: string | null
  issue: string
  address: string | null
  confirmed_date: string | null
  confirmed_time: string | null
}): boolean {
  const db = getDb()
  const result = db.prepare(`
    UPDATE bookings SET
      name = @name, phone = @phone, email = @email,
      vehicle = @vehicle, vehicle_reg = @vehicle_reg, vehicle_year = @vehicle_year,
      issue = @issue, address = @address,
      confirmed_date = @confirmed_date, confirmed_time = @confirmed_time
    WHERE id = @id
  `).run({ ...data, id })
  return result.changes > 0
}

// Delete a booking
export function deleteBooking(id: number): boolean {
  const db = getDb()
  const stmt = db.prepare("DELETE FROM bookings WHERE id = ?")
  const result = stmt.run(id)
  return result.changes > 0
}

// Generate next invoice number for given year: JAC-YYYY-XXXX
function generateInvoiceNumber(year: number): string {
  const db = getDb()
  const pattern = `JAC-${year}-%`
  const row = db.prepare(
    "SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(pattern) as { invoice_number: string } | undefined

  let nextSeq = 1
  if (row) {
    const parts = row.invoice_number.split("-")
    const lastSeq = parseInt(parts[2], 10)
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1
    }
  }
  return `JAC-${year}-${String(nextSeq).padStart(4, "0")}`
}

// Create a new invoice
export function createInvoice(data: {
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  customer_address?: string | null
  vehicle?: string | null
  labour_items?: string
  parts_items?: string
  notes?: string | null
  vat_enabled?: number
  vat_rate?: number
  status?: string
  invoice_date?: string | null
  mileage?: number | null
  health_report?: string | null
  labour_discount?: number | null
  booking_id?: number | null
}): Invoice {
  const db = getDb()
  const dateForNumber = data.invoice_date ? new Date(data.invoice_date) : new Date()
  const year = dateForNumber.getFullYear()
  const invoice_number = generateInvoiceNumber(year)

  const stmt = db.prepare(`
    INSERT INTO invoices (
      invoice_number, customer_name, customer_email, customer_phone,
      customer_address, vehicle, labour_items, parts_items, notes,
      vat_enabled, vat_rate, status, invoice_date, mileage, health_report, labour_discount, booking_id
    ) VALUES (
      @invoice_number, @customer_name, @customer_email, @customer_phone,
      @customer_address, @vehicle, @labour_items, @parts_items, @notes,
      @vat_enabled, @vat_rate, @status, @invoice_date, @mileage, @health_report, @labour_discount, @booking_id
    )
  `)

  const result = stmt.run({
    invoice_number,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone ?? null,
    customer_address: data.customer_address ?? null,
    vehicle: data.vehicle ?? null,
    labour_items: data.labour_items ?? "[]",
    parts_items: data.parts_items ?? "[]",
    notes: data.notes ?? null,
    vat_enabled: data.vat_enabled ?? 0,
    vat_rate: data.vat_rate ?? 20,
    status: data.status ?? "draft",
    invoice_date: data.invoice_date ?? null,
    mileage: data.mileage ?? null,
    health_report: data.health_report ?? null,
    labour_discount: data.labour_discount ?? null,
    booking_id: data.booking_id ?? null,
  })

  return getInvoiceById(result.lastInsertRowid as number)!
}

// Get all invoices ordered by creation date
export function getAllInvoices(): Invoice[] {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM invoices ORDER BY created_at DESC")
  return stmt.all() as Invoice[]
}

// Get a single invoice by ID
export function getInvoiceById(id: number): Invoice | null {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM invoices WHERE id = ?")
  return stmt.get(id) as Invoice | null
}

export function getInvoiceByBookingId(bookingId: number): Invoice | null {
  const db = getDb()
  return db.prepare("SELECT * FROM invoices WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1").get(bookingId) as Invoice | null
}

// Update invoice status
export function updateInvoiceStatus(id: number, status: string, paymentMethod?: string | null): boolean {
  const db = getDb()
  const paidAt = status === "paid" ? new Date().toISOString() : null
  const method = status === "paid" ? (paymentMethod ?? null) : null
  const stmt = db.prepare("UPDATE invoices SET status = ?, paid_at = ?, payment_method = ? WHERE id = ?")
  const result = stmt.run(status, paidAt, method, id)
  return result.changes > 0
}

// Update job work done notes on a booking
export function updateBookingWorkDone(id: number, workDone: string): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE bookings SET work_done = ? WHERE id = ?").run(workDone, id)
  return result.changes > 0
}

// Update all editable fields on an invoice
// Note: health_report is managed separately via the upload API and is never touched here
export function updateInvoice(id: number, data: {
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  customer_address?: string | null
  vehicle?: string | null
  labour_items?: string
  parts_items?: string
  notes?: string | null
  vat_enabled?: number
  vat_rate?: number
  invoice_date?: string | null
  mileage?: number | null
  labour_discount?: number | null
  // health_report intentionally omitted — managed via upload API only
}): boolean {
  const db = getDb()
  const result = db.prepare(`
    UPDATE invoices SET
      customer_name    = @customer_name,
      customer_email   = @customer_email,
      customer_phone   = @customer_phone,
      customer_address = @customer_address,
      vehicle          = @vehicle,
      labour_items     = @labour_items,
      parts_items      = @parts_items,
      notes            = @notes,
      vat_enabled      = @vat_enabled,
      vat_rate         = @vat_rate,
      invoice_date     = @invoice_date,
      mileage          = @mileage,
      labour_discount  = @labour_discount
    WHERE id = @id
  `).run({
    id,
    customer_name:    data.customer_name,
    customer_email:   data.customer_email,
    customer_phone:   data.customer_phone    ?? null,
    customer_address: data.customer_address  ?? null,
    vehicle:          data.vehicle           ?? null,
    labour_items:     data.labour_items      ?? "[]",
    parts_items:      data.parts_items       ?? "[]",
    notes:            data.notes             ?? null,
    vat_enabled:      data.vat_enabled       ?? 0,
    vat_rate:         data.vat_rate          ?? 20,
    invoice_date:     data.invoice_date      ?? null,
    mileage:          data.mileage           ?? null,
    labour_discount:  data.labour_discount   ?? null,
  })
  return result.changes > 0
}

// Delete an invoice
export function deleteInvoice(id: number): boolean {
  const db = getDb()
  const stmt = db.prepare("DELETE FROM invoices WHERE id = ?")
  const result = stmt.run(id)
  return result.changes > 0
}

// ─── Customer types ───────────────────────────────────────────────────────────

export type Customer = {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
  service_reminder: number        // 0 = off, 1 = opted in
  service_reminder_sent_at: string | null
  last_service_override: string | null  // manual override date (YYYY-MM-DD) for pre-existing customers
}

export type CustomerWithCounts = Customer & {
  booking_count: number
  invoice_count: number
}

export type CustomerVehicle = {
  id: number
  customer_id: number
  make_model: string
  reg: string | null
  year: string | null
  notes: string | null
}

// ─── Customer CRUD ────────────────────────────────────────────────────────────

export function createCustomer(data: {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  notes?: string | null
}): Customer {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO customers (name, email, phone, address, notes)
    VALUES (@name, @email, @phone, @address, @notes)
  `)
  const result = stmt.run({
    name: data.name,
    email: data.email ?? "",
    phone: data.phone ?? null,
    address: data.address ?? null,
    notes: data.notes ?? null,
  })
  return getCustomerById(result.lastInsertRowid as number)!
}

export function getAllCustomers(): CustomerWithCounts[] {
  const db = getDb()
  const stmt = db.prepare(`
    SELECT
      c.*,
      COUNT(DISTINCT b.id) AS booking_count,
      COUNT(DISTINCT i.id) AS invoice_count
    FROM customers c
    LEFT JOIN bookings b ON b.customer_id = c.id
    LEFT JOIN invoices i ON i.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `)
  return stmt.all() as CustomerWithCounts[]
}

export function getCustomerById(id: number): Customer | null {
  const db = getDb()
  const stmt = db.prepare("SELECT * FROM customers WHERE id = ?")
  return stmt.get(id) as Customer | null
}

export function updateCustomer(
  id: number,
  data: {
    name: string
    email: string
    phone?: string | null
    address?: string | null
    notes?: string | null
  }
): boolean {
  const db = getDb()
  const stmt = db.prepare(`
    UPDATE customers SET name = @name, email = @email, phone = @phone, address = @address, notes = @notes
    WHERE id = @id
  `)
  const result = stmt.run({
    id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    address: data.address ?? null,
    notes: data.notes ?? null,
  })
  return result.changes > 0
}

export function deleteCustomer(id: number): boolean {
  const db = getDb()
  // Remove vehicles first
  db.prepare("DELETE FROM customer_vehicles WHERE customer_id = ?").run(id)
  // Unlink bookings and invoices
  db.prepare("UPDATE bookings SET customer_id = NULL WHERE customer_id = ?").run(id)
  db.prepare("UPDATE invoices SET customer_id = NULL WHERE customer_id = ?").run(id)
  const result = db.prepare("DELETE FROM customers WHERE id = ?").run(id)
  return result.changes > 0
}

// ─── Customer Vehicles ────────────────────────────────────────────────────────

export function addVehicle(
  customerId: number,
  data: {
    make_model: string
    reg?: string | null
    year?: string | null
    notes?: string | null
  }
): CustomerVehicle {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO customer_vehicles (customer_id, make_model, reg, year, notes)
    VALUES (@customer_id, @make_model, @reg, @year, @notes)
  `)
  const result = stmt.run({
    customer_id: customerId,
    make_model: data.make_model,
    reg: data.reg ?? null,
    year: data.year ?? null,
    notes: data.notes ?? null,
  })
  return db.prepare("SELECT * FROM customer_vehicles WHERE id = ?").get(result.lastInsertRowid) as CustomerVehicle
}

export function deleteVehicle(id: number): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM customer_vehicles WHERE id = ?").run(id)
  return result.changes > 0
}

export function getCustomerVehicles(customerId: number): CustomerVehicle[] {
  const db = getDb()
  return db.prepare("SELECT * FROM customer_vehicles WHERE customer_id = ? ORDER BY id ASC").all(customerId) as CustomerVehicle[]
}

// ─── Linking ──────────────────────────────────────────────────────────────────

export function linkBookingToCustomer(bookingId: number, customerId: number): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE bookings SET customer_id = ? WHERE id = ?").run(customerId, bookingId)
  return result.changes > 0
}

export function linkInvoiceToCustomer(invoiceId: number, customerId: number): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE invoices SET customer_id = ? WHERE id = ?").run(customerId, invoiceId)
  return result.changes > 0
}

// ─── Customer history ─────────────────────────────────────────────────────────

export function getCustomerBookings(customerId: number): Booking[] {
  const db = getDb()
  return db.prepare("SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC").all(customerId) as Booking[]
}

export function getCustomerInvoices(customerId: number): Invoice[] {
  const db = getDb()
  return db.prepare("SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC").all(customerId) as Invoice[]
}

// ─── Unlinked helpers ─────────────────────────────────────────────────────────

export function getUnlinkedBookings(): Booking[] {
  const db = getDb()
  return db.prepare("SELECT * FROM bookings WHERE customer_id IS NULL ORDER BY created_at DESC").all() as Booking[]
}

export function getUnlinkedInvoices(): Invoice[] {
  const db = getDb()
  return db.prepare("SELECT * FROM invoices WHERE customer_id IS NULL ORDER BY created_at DESC").all() as Invoice[]
}

// ─── Scheduling ───────────────────────────────────────────────────────────────

// Update confirmed date/time on a booking and generate a cancel token
export function updateBookingDateTime(id: number, confirmed_date: string, confirmed_time: string): string {
  const db = getDb()
  const cancel_token = require("crypto").randomBytes(24).toString("hex")
  db.prepare(
    "UPDATE bookings SET confirmed_date = ?, confirmed_time = ?, cancel_token = ?, status = 'confirmed' WHERE id = ?"
  ).run(confirmed_date, confirmed_time, cancel_token, id)
  return cancel_token
}

// Look up a booking by its cancel token
export function getBookingByCancelToken(token: string): Booking | null {
  const db = getDb()
  return db.prepare("SELECT * FROM bookings WHERE cancel_token = ?").get(token) as Booking | null
}

// Cancel a booking via token (only if not already cancelled and appointment is >0 hours away)
export function cancelBookingByToken(token: string): { success: boolean; reason?: string } {
  const db = getDb()
  const booking = db.prepare("SELECT * FROM bookings WHERE cancel_token = ?").get(token) as Booking | null
  if (!booking) return { success: false, reason: "not_found" }
  if (booking.status === "cancelled") return { success: false, reason: "already_cancelled" }
  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE cancel_token = ?").run(token)
  return { success: true }
}

// Get count of confirmed bookings per time slot for a given date
export function getSlotBookingCounts(date: string): Record<string, number> {
  const db = getDb()
  const rows = db.prepare(`
    SELECT confirmed_time, COUNT(*) as count
    FROM bookings
    WHERE confirmed_date = ? AND status = 'confirmed' AND confirmed_time IS NOT NULL
    GROUP BY confirmed_time
  `).all(date) as Array<{ confirmed_time: string; count: number }>

  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.confirmed_time] = row.count
  }
  return counts
}

// Get all confirmed bookings for a date range (for calendar view)
export function getConfirmedBookingsByDateRange(startDate: string, endDate: string): Booking[] {
  const db = getDb()
  return db.prepare(`
    SELECT * FROM bookings
    WHERE confirmed_date >= ? AND confirmed_date <= ? AND status = 'confirmed'
    ORDER BY confirmed_date ASC, confirmed_time ASC
  `).all(startDate, endDate) as Booking[]
}

// ─── Service Presets ──────────────────────────────────────────────────────────

export type ServicePreset = {
  id: number
  name: string
  type: 'labour' | 'part'
  description: string
  hours: number
  rate: number
  qty: number
  unit_price: number
  sort_order: number
  created_at: string
}

export function getAllServicePresets(): ServicePreset[] {
  const db = getDb()
  return db.prepare(
    "SELECT * FROM service_presets ORDER BY type ASC, sort_order ASC, name ASC"
  ).all() as ServicePreset[]
}

export function createServicePreset(data: Omit<ServicePreset, 'id' | 'created_at'>): ServicePreset {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO service_presets (name, type, description, hours, rate, qty, unit_price, sort_order)
    VALUES (@name, @type, @description, @hours, @rate, @qty, @unit_price, @sort_order)
  `)
  const result = stmt.run(data)
  return db.prepare("SELECT * FROM service_presets WHERE id = ?").get(result.lastInsertRowid) as ServicePreset
}

export function updateServicePreset(id: number, data: Omit<ServicePreset, 'id' | 'created_at'>): boolean {
  const db = getDb()
  const result = db.prepare(`
    UPDATE service_presets SET
      name = @name, type = @type, description = @description,
      hours = @hours, rate = @rate, qty = @qty,
      unit_price = @unit_price, sort_order = @sort_order
    WHERE id = @id
  `).run({ ...data, id })
  return result.changes > 0
}

export function deleteServicePreset(id: number): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM service_presets WHERE id = ?").run(id)
  return result.changes > 0
}

// ─── Service Reminders ────────────────────────────────────────────────────────

export function setServiceReminder(customerId: number, enabled: boolean): boolean {
  const db = getDb()
  const result = db.prepare(
    "UPDATE customers SET service_reminder = ? WHERE id = ?"
  ).run(enabled ? 1 : 0, customerId)
  return result.changes > 0
}

export function markReminderSent(customerId: number): void {
  const db = getDb()
  db.prepare(
    "UPDATE customers SET service_reminder_sent_at = datetime('now') WHERE id = ?"
  ).run(customerId)
}

// Find customers opted into reminders whose last service was N+ days ago
// and haven't received a reminder in the last N days.
// Uses last_service_override date when set (for pre-existing customers).
export function getCustomersDueReminder(): (Customer & { last_service_date: string })[] {
  const db = getDb()
  const intervalRow = db.prepare("SELECT value FROM site_settings WHERE key = 'reminder_interval_days'").get() as { value: string } | undefined
  const days = parseInt(intervalRow?.value || "300", 10) || 300
  const interval = `-${days} days`
  return db.prepare(`
    SELECT c.*,
      CASE WHEN c.last_service_override IS NOT NULL
        THEN c.last_service_override
        ELSE MAX(event_date)
      END as last_service_date
    FROM customers c
    LEFT JOIN (
      SELECT customer_id, created_at as event_date
        FROM bookings WHERE status = 'completed' AND customer_id IS NOT NULL
      UNION ALL
      SELECT customer_id, created_at as event_date
        FROM invoices WHERE status = 'paid' AND customer_id IS NOT NULL
    ) events ON events.customer_id = c.id
    WHERE c.service_reminder = 1
    GROUP BY c.id
    HAVING
      (
        CASE WHEN c.last_service_override IS NOT NULL
          THEN c.last_service_override
          ELSE MAX(event_date)
        END
      ) <= datetime('now', ?)
      AND (
        c.service_reminder_sent_at IS NULL
        OR c.service_reminder_sent_at <= datetime('now', ?)
      )
  `).all(interval, interval) as (Customer & { last_service_date: string })[]
}

export function setLastServiceOverride(customerId: number, date: string | null): boolean {
  const db = getDb()
  const result = db.prepare(
    "UPDATE customers SET last_service_override = ? WHERE id = ?"
  ).run(date, customerId)
  return result.changes > 0
}

// ─── Customer lookup by email / phone / vehicle reg ───────────────────────────

export function getCustomerByEmail(email: string): Customer | null {
  if (!email?.trim()) return null
  const db = getDb()
  return db.prepare("SELECT * FROM customers WHERE email = ? AND email != '' LIMIT 1").get(email) as Customer | null
}

export function getCustomerByPhone(phone: string): Customer | null {
  const db = getDb()
  // Normalise by stripping non-digit chars for comparison
  const normalised = phone.replace(/\D/g, "")
  if (normalised.length < 7) return null
  return db.prepare(
    "SELECT * FROM customers WHERE replace(replace(replace(replace(phone,' ',''),'-',''),'(',''),')','') = ? LIMIT 1"
  ).get(normalised) as Customer | null
}

export function getCustomerByVehicleReg(reg: string): Customer | null {
  const db = getDb()
  const normalised = reg.replace(/\s/g, "").toUpperCase()
  if (!normalised) return null
  const row = db.prepare(
    "SELECT customer_id FROM customer_vehicles WHERE replace(upper(reg),' ','') = ? LIMIT 1"
  ).get(normalised) as { customer_id: number } | undefined
  if (!row) return null
  return getCustomerById(row.customer_id)
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

function generateQuoteNumber(year: number): string {
  const db = getDb()
  const pattern = `JAC-Q-${year}-%`
  const row = db.prepare(
    "SELECT quote_number FROM quotes WHERE quote_number LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(pattern) as { quote_number: string } | undefined

  let nextSeq = 1
  if (row) {
    const parts = row.quote_number.split("-")
    const lastSeq = parseInt(parts[3], 10)
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1
    }
  }
  return `JAC-Q-${year}-${String(nextSeq).padStart(4, "0")}`
}

export function createQuote(data: {
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  customer_address?: string | null
  vehicle?: string | null
  labour_items?: string
  parts_items?: string
  notes?: string | null
  vat_enabled?: number
  vat_rate?: number
  status?: string
  invoice_date?: string | null
}): Quote {
  const db = getDb()
  const dateForNumber = data.invoice_date ? new Date(data.invoice_date) : new Date()
  const year = dateForNumber.getFullYear()
  const quote_number = generateQuoteNumber(year)

  const confirm_token = require("crypto").randomBytes(24).toString("hex")

  const stmt = db.prepare(`
    INSERT INTO quotes (
      quote_number, customer_name, customer_email, customer_phone,
      customer_address, vehicle, labour_items, parts_items, notes,
      vat_enabled, vat_rate, status, invoice_date, confirm_token
    ) VALUES (
      @quote_number, @customer_name, @customer_email, @customer_phone,
      @customer_address, @vehicle, @labour_items, @parts_items, @notes,
      @vat_enabled, @vat_rate, @status, @invoice_date, @confirm_token
    )
  `)

  const result = stmt.run({
    quote_number,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone ?? null,
    customer_address: data.customer_address ?? null,
    vehicle: data.vehicle ?? null,
    labour_items: data.labour_items ?? "[]",
    parts_items: data.parts_items ?? "[]",
    notes: data.notes ?? null,
    vat_enabled: data.vat_enabled ?? 0,
    vat_rate: data.vat_rate ?? 20,
    status: data.status ?? "draft",
    invoice_date: data.invoice_date ?? null,
    confirm_token,
  })

  return getQuoteById(result.lastInsertRowid as number)!
}

export function getAllQuotes(): Quote[] {
  const db = getDb()
  return db.prepare("SELECT * FROM quotes ORDER BY created_at DESC").all() as Quote[]
}

export function getQuoteById(id: number): Quote | null {
  const db = getDb()
  return db.prepare("SELECT * FROM quotes WHERE id = ?").get(id) as Quote | null
}

export function getQuotesByCustomerEmail(email: string): Quote[] {
  if (!email?.trim()) return []
  const db = getDb()
  return db.prepare(
    "SELECT * FROM quotes WHERE customer_email = ? AND status IN ('sent','accepted','draft') ORDER BY created_at DESC LIMIT 20"
  ).all(email.trim()) as Quote[]
}

export function updateQuote(id: number, data: {
  customer_name: string
  customer_email: string
  customer_phone?: string | null
  customer_address?: string | null
  vehicle?: string | null
  labour_items?: string
  parts_items?: string
  notes?: string | null
  vat_enabled?: number
  vat_rate?: number
  invoice_date?: string | null
}): boolean {
  const db = getDb()
  const result = db.prepare(`
    UPDATE quotes SET
      customer_name    = @customer_name,
      customer_email   = @customer_email,
      customer_phone   = @customer_phone,
      customer_address = @customer_address,
      vehicle          = @vehicle,
      labour_items     = @labour_items,
      parts_items      = @parts_items,
      notes            = @notes,
      vat_enabled      = @vat_enabled,
      vat_rate         = @vat_rate,
      invoice_date     = @invoice_date
    WHERE id = @id
  `).run({
    id,
    customer_name:    data.customer_name,
    customer_email:   data.customer_email,
    customer_phone:   data.customer_phone    ?? null,
    customer_address: data.customer_address  ?? null,
    vehicle:          data.vehicle           ?? null,
    labour_items:     data.labour_items      ?? "[]",
    parts_items:      data.parts_items       ?? "[]",
    notes:            data.notes             ?? null,
    vat_enabled:      data.vat_enabled       ?? 0,
    vat_rate:         data.vat_rate          ?? 20,
    invoice_date:     data.invoice_date      ?? null,
  })
  return result.changes > 0
}

export function updateQuoteStatus(id: number, status: string): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE quotes SET status = ? WHERE id = ?").run(status, id)
  return result.changes > 0
}

export function deleteQuote(id: number): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM quotes WHERE id = ?").run(id)
  return result.changes > 0
}

export function getQuoteByConfirmToken(token: string): Quote | null {
  const db = getDb()
  return db.prepare("SELECT * FROM quotes WHERE confirm_token = ? LIMIT 1").get(token) as Quote | null
}

export function acceptQuoteByToken(
  token: string,
  preferredDate: string,
  preferredTime: string
): { success: boolean; alreadyAccepted?: boolean; bookingId?: number; cancelToken?: string } {
  const db = getDb()
  const quote = db.prepare("SELECT * FROM quotes WHERE confirm_token = ? LIMIT 1").get(token) as Quote | null
  if (!quote) return { success: false }
  if (quote.accepted_at) return { success: true, alreadyAccepted: true }

  // Mark quote as accepted
  db.prepare("UPDATE quotes SET accepted_at = datetime('now'), status = 'accepted' WHERE id = ?").run(quote.id)

  // Create a pending booking from the quote with confirmed_date set so the approval email can reference it
  const confirm_token = require("crypto").randomBytes(24).toString("hex")
  const cancel_token  = require("crypto").randomBytes(24).toString("hex")
  const r = db.prepare(`
    INSERT INTO bookings (
      name, phone, email, vehicle, issue,
      preferred_date, preferred_time,
      confirmed_date, confirmed_time,
      status, confirm_token, cancel_token
    ) VALUES (
      @name, @phone, @email, @vehicle, @issue,
      @preferred_date, @preferred_time,
      @confirmed_date, @confirmed_time,
      'pending', @confirm_token, @cancel_token
    )
  `).run({
    name:           quote.customer_name,
    phone:          quote.customer_phone || "",
    email:          quote.customer_email,
    vehicle:        quote.vehicle || "",
    issue:          `Accepted quote ${quote.quote_number}${quote.notes ? `: ${quote.notes}` : ""}`,
    preferred_date: preferredDate,
    preferred_time: preferredTime,
    confirmed_date: preferredDate,
    confirmed_time: preferredTime,
    confirm_token,
    cancel_token,
  })

  return { success: true, bookingId: r.lastInsertRowid as number, cancelToken: cancel_token }
}

export function convertQuoteToInvoice(quoteId: number): Invoice | null {
  const db = getDb()
  const quote = getQuoteById(quoteId)
  if (!quote) return null

  // Create invoice from quote data
  const invoice = createInvoice({
    customer_name:    quote.customer_name,
    customer_email:   quote.customer_email,
    customer_phone:   quote.customer_phone,
    customer_address: quote.customer_address,
    vehicle:          quote.vehicle,
    labour_items:     quote.labour_items,
    parts_items:      quote.parts_items,
    notes:            quote.notes,
    vat_enabled:      quote.vat_enabled,
    vat_rate:         quote.vat_rate,
    status:           "draft",
    invoice_date:     quote.invoice_date,
  })

  // Link the invoice back to the quote
  db.prepare("UPDATE quotes SET converted_invoice_id = ?, status = 'converted' WHERE id = ?").run(invoice.id, quoteId)

  return invoice
}

// ─── Email Log ────────────────────────────────────────────────────────────────

export type EmailLogEntry = {
  id: number
  to_address: string
  subject: string
  type: string
  status: string
  error: string | null
  sent_at: string
}

export function logEmail(data: {
  to_address: string
  subject: string
  type: string
  status: "sent" | "failed"
  error?: string | null
}): void {
  try {
    const db = getDb()
    db.prepare(`
      INSERT INTO email_log (to_address, subject, type, status, error)
      VALUES (@to_address, @subject, @type, @status, @error)
    `).run({
      to_address: data.to_address,
      subject: data.subject,
      type: data.type,
      status: data.status,
      error: data.error ?? null,
    })
  } catch {}
}

export function getEmailLog(limit = 200): EmailLogEntry[] {
  const db = getDb()
  return db.prepare(
    "SELECT * FROM email_log ORDER BY sent_at DESC LIMIT ?"
  ).all(limit) as EmailLogEntry[]
}

export function linkQuoteToCustomer(quoteId: number, customerId: number): boolean {
  const db = getDb()
  const result = db.prepare("UPDATE quotes SET customer_id = ? WHERE id = ?").run(customerId, quoteId)
  return result.changes > 0
}

// ─── Mileage Log ──────────────────────────────────────────────────────────────

export type MileageEntry = {
  id: number
  date: string
  booking_id: number | null
  customer_name: string | null
  from_location: string
  to_location: string
  miles: number
  round_trip: number
  notes: string | null
  created_at: string
}

export type Expense = {
  id: number
  date: string
  category: string
  description: string
  amount: number
  receipt_ref: string | null
  notes: string | null
  created_at: string
}

export function getMileageLog(): MileageEntry[] {
  return getDb().prepare('SELECT * FROM mileage_log ORDER BY date DESC, id DESC').all() as MileageEntry[]
}

export function addMileageEntry(data: Omit<MileageEntry, 'id' | 'created_at'>): MileageEntry {
  const db = getDb()
  const result = db.prepare(`INSERT INTO mileage_log (date, booking_id, customer_name, from_location, to_location, miles, round_trip, notes) VALUES (@date, @booking_id, @customer_name, @from_location, @to_location, @miles, @round_trip, @notes)`).run(data)
  return db.prepare('SELECT * FROM mileage_log WHERE id = ?').get(result.lastInsertRowid) as MileageEntry
}

export function deleteMileageEntry(id: number): boolean {
  return getDb().prepare('DELETE FROM mileage_log WHERE id = ?').run(id).changes > 0
}

export function getExpenses(): Expense[] {
  return getDb().prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC').all() as Expense[]
}

export function addExpense(data: Omit<Expense, 'id' | 'created_at'>): Expense {
  const db = getDb()
  const result = db.prepare(`INSERT INTO expenses (date, category, description, amount, receipt_ref, notes) VALUES (@date, @category, @description, @amount, @receipt_ref, @notes)`).run(data)
  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid) as Expense
}

export function deleteExpense(id: number): boolean {
  return getDb().prepare('DELETE FROM expenses WHERE id = ?').run(id).changes > 0
}

export function getBookingsForDate(date: string): Booking[] {
  return getDb().prepare(`SELECT * FROM bookings WHERE (confirmed_date = ? OR (confirmed_date IS NULL AND preferred_date = ?)) AND status NOT IN ('cancelled') ORDER BY confirmed_time, preferred_time`).all(date, date) as Booking[]
}

export function getBookingsByMonth(year: number, month: number): Booking[] {
  const pad = (n: number) => String(n).padStart(2, '0')
  const prefix = `${year}-${pad(month)}`
  return getDb().prepare(`SELECT * FROM bookings WHERE (confirmed_date LIKE ? OR preferred_date LIKE ?) AND status NOT IN ('cancelled') ORDER BY confirmed_date, preferred_date`).all(`${prefix}%`, `${prefix}%`) as Booking[]
}

export function updateBookingNotes(id: number, notes: string): boolean {
  return getDb().prepare('UPDATE bookings SET notes = ? WHERE id = ?').run(notes, id).changes > 0
}

export function getBookingsDueReminder(): Booking[] {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().slice(0, 10)
  return getDb().prepare(`SELECT * FROM bookings WHERE confirmed_date = ? AND status = 'confirmed'`).all(dateStr) as Booking[]
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────

export type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  published: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export function getAllBlogPosts(publishedOnly = false): BlogPost[] {
  const db = getDb()
  if (publishedOnly) {
    return db.prepare("SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC, created_at DESC").all() as BlogPost[]
  }
  return db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC").all() as BlogPost[]
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const db = getDb()
  return db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(slug) as BlogPost | null
}

export function getBlogPostById(id: number): BlogPost | null {
  const db = getDb()
  return db.prepare("SELECT * FROM blog_posts WHERE id = ?").get(id) as BlogPost | null
}

export function createBlogPost(data: {
  title: string
  slug: string
  excerpt: string
  content: string
  published: number
}): BlogPost {
  const db = getDb()
  const published_at = data.published === 1 ? new Date().toISOString() : null
  const result = db.prepare(`
    INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at)
    VALUES (@title, @slug, @excerpt, @content, @published, @published_at)
  `).run({ ...data, published_at })
  return getBlogPostById(result.lastInsertRowid as number)!
}

export function updateBlogPost(
  id: number,
  data: { title: string; slug: string; excerpt: string; content: string; published: number }
): boolean {
  const db = getDb()
  const existing = getBlogPostById(id)
  let published_at = existing?.published_at ?? null
  if (data.published === 1 && !published_at) {
    published_at = new Date().toISOString()
  }
  const result = db.prepare(`
    UPDATE blog_posts SET
      title = @title, slug = @slug, excerpt = @excerpt, content = @content,
      published = @published, published_at = @published_at,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...data, published_at, id })
  return result.changes > 0
}

export function deleteBlogPost(id: number): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM blog_posts WHERE id = ?").run(id)
  return result.changes > 0
}

// ─── Pricing Items ────────────────────────────────────────────────────────────

export type PricingItem = {
  id: number
  category: string
  name: string
  price: string
  note: string | null
  sort_order: number
  active: number
  created_at: string
}

export function getAllPricingItems(): PricingItem[] {
  return getDb().prepare("SELECT * FROM pricing_items ORDER BY category, sort_order").all() as PricingItem[]
}

export function getPricingItemsByCategory(): Record<string, PricingItem[]> {
  const items = getDb().prepare("SELECT * FROM pricing_items WHERE active = 1 ORDER BY category, sort_order").all() as PricingItem[]
  const grouped: Record<string, PricingItem[]> = {}
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  }
  return grouped
}

export function getPricingItemById(id: number): PricingItem | null {
  return getDb().prepare("SELECT * FROM pricing_items WHERE id = ?").get(id) as PricingItem | null
}

export function createPricingItem(data: Omit<PricingItem, 'id' | 'created_at'>): PricingItem {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO pricing_items (category, name, price, note, sort_order, active)
    VALUES (@category, @name, @price, @note, @sort_order, @active)
  `).run(data)
  return getPricingItemById(result.lastInsertRowid as number)!
}

export function updatePricingItem(id: number, data: Omit<PricingItem, 'id' | 'created_at'>): boolean {
  const result = getDb().prepare(`
    UPDATE pricing_items SET
      category = @category, name = @name, price = @price, note = @note,
      sort_order = @sort_order, active = @active
    WHERE id = @id
  `).run({ ...data, id })
  return result.changes > 0
}

export function deletePricingItem(id: number): boolean {
  return getDb().prepare("DELETE FROM pricing_items WHERE id = ?").run(id).changes > 0
}

export function togglePricingItemActive(id: number): boolean {
  return getDb().prepare("UPDATE pricing_items SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?").run(id).changes > 0
}

// ─── Booking Availability ─────────────────────────────────────────────────────

export type BookingAvailability = {
  enabled: number
  slots: string[]           // default slots for Mon–Fri
  available_days: number[]  // 0=Sun … 6=Sat
  closed_dates: string[]    // YYYY-MM-DD blackout dates
  day_slots: Record<string, string[]>  // per-day overrides, e.g. {"6": ["10:00","12:00"]}
}

export function getBookingAvailability(): BookingAvailability {
  const row = getDb().prepare("SELECT * FROM booking_availability WHERE id = 1").get() as {
    enabled: number; slots: string; available_days: string; closed_dates: string; day_slots?: string
  } | undefined
  if (!row) return { enabled: 1, slots: ["09:00","11:00","13:00"], available_days: [1,2,3,4,5,6], closed_dates: [], day_slots: { "6": ["10:00","12:00"] } }
  return {
    enabled: row.enabled,
    slots: JSON.parse(row.slots),
    available_days: JSON.parse(row.available_days),
    closed_dates: JSON.parse(row.closed_dates),
    day_slots: row.day_slots ? JSON.parse(row.day_slots) : {},
  }
}

export function saveBookingAvailability(data: BookingAvailability): void {
  getDb().prepare(`
    UPDATE booking_availability SET
      enabled = @enabled,
      slots = @slots,
      available_days = @available_days,
      closed_dates = @closed_dates,
      day_slots = @day_slots,
      updated_at = datetime('now')
    WHERE id = 1
  `).run({
    enabled: data.enabled,
    slots: JSON.stringify(data.slots),
    available_days: JSON.stringify(data.available_days),
    closed_dates: JSON.stringify(data.closed_dates),
    day_slots: JSON.stringify(data.day_slots ?? {}),
  })
}

// ─── Recurring Expenses ───────────────────────────────────────────────────────

export type RecurringExpense = {
  id: number
  category: string
  description: string
  amount: number
  day_of_month: number
  receipt_ref: string | null
  notes: string | null
  active: number
  created_at: string
}

export function getRecurringExpenses(): RecurringExpense[] {
  return getDb().prepare("SELECT * FROM recurring_expenses ORDER BY day_of_month, description").all() as RecurringExpense[]
}

export function addRecurringExpense(data: Omit<RecurringExpense, 'id' | 'created_at'>): RecurringExpense {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO recurring_expenses (category, description, amount, day_of_month, receipt_ref, notes, active)
    VALUES (@category, @description, @amount, @day_of_month, @receipt_ref, @notes, @active)
  `).run(data)
  return db.prepare("SELECT * FROM recurring_expenses WHERE id = ?").get(result.lastInsertRowid) as RecurringExpense
}

export function toggleRecurringExpense(id: number): boolean {
  return getDb().prepare("UPDATE recurring_expenses SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE id = ?").run(id).changes > 0
}

export function deleteRecurringExpense(id: number): boolean {
  return getDb().prepare("DELETE FROM recurring_expenses WHERE id = ?").run(id).changes > 0
}

// Called by cron: creates an expense entry for each active recurring expense due today
export function applyRecurringExpenses(dateStr: string): Expense[] {
  const db = getDb()
  const dayOfMonth = parseInt(dateStr.split("-")[2], 10)
  const due = db.prepare(
    "SELECT * FROM recurring_expenses WHERE active = 1 AND day_of_month = ?"
  ).all(dayOfMonth) as RecurringExpense[]

  const created: Expense[] = []
  for (const r of due) {
    const expense = addExpense({
      date: dateStr,
      category: r.category,
      description: r.description,
      amount: r.amount,
      receipt_ref: r.receipt_ref,
      notes: r.notes,
    })
    created.push(expense)
  }
  return created
}

// ─── Site Settings ─────────────────────────────────────────────────────────

export type SiteSetting = {
  key: string
  value: string
  label: string
  description: string
  group_name: string
}

export function getAllSiteSettings(): SiteSetting[] {
  return getDb().prepare("SELECT * FROM site_settings ORDER BY group_name, key").all() as SiteSetting[]
}

export function getSiteSetting(key: string): string {
  const row = getDb().prepare("SELECT value FROM site_settings WHERE key = ?").get(key) as { value: string } | undefined
  return row?.value ?? ""
}

export function saveSiteSetting(key: string, value: string): void {
  getDb().prepare("UPDATE site_settings SET value = ? WHERE key = ?").run(value, key)
}

// ─── Service Areas ─────────────────────────────────────────────────────────

export type ServiceArea = {
  id: number
  name: string
  slug: string
  county: string
  description: string
  nearby_areas: string  // JSON string
  active: number
  sort_order: number
  created_at: string
}

export function getAllServiceAreas(): ServiceArea[] {
  return getDb().prepare("SELECT * FROM service_areas ORDER BY sort_order, name").all() as ServiceArea[]
}

export function getActiveServiceAreas(): ServiceArea[] {
  return getDb().prepare("SELECT * FROM service_areas WHERE active = 1 ORDER BY sort_order, name").all() as ServiceArea[]
}

export function getServiceAreaBySlug(slug: string): ServiceArea | null {
  return getDb().prepare("SELECT * FROM service_areas WHERE slug = ? AND active = 1").get(slug) as ServiceArea | null
}

export function createServiceArea(data: {
  name: string; slug: string; county: string; description: string; nearby_areas: string; sort_order: number
}): ServiceArea {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO service_areas (name, slug, county, description, nearby_areas, active, sort_order)
    VALUES (@name, @slug, @county, @description, @nearby_areas, 1, @sort_order)
  `).run(data)
  return db.prepare("SELECT * FROM service_areas WHERE id = ?").get(result.lastInsertRowid) as ServiceArea
}

export function updateServiceArea(id: number, data: {
  name: string; slug: string; county: string; description: string; nearby_areas: string; sort_order: number
}): boolean {
  return getDb().prepare(`
    UPDATE service_areas SET name=@name, slug=@slug, county=@county, description=@description, nearby_areas=@nearby_areas, sort_order=@sort_order WHERE id=@id
  `).run({ ...data, id }).changes > 0
}

export function toggleServiceArea(id: number): boolean {
  return getDb().prepare("UPDATE service_areas SET active = CASE WHEN active=1 THEN 0 ELSE 1 END WHERE id = ?").run(id).changes > 0
}

export function deleteServiceArea(id: number): boolean {
  return getDb().prepare("DELETE FROM service_areas WHERE id = ?").run(id).changes > 0
}

// ── Analytics ──────────────────────────────────────────────────────────────

function normalizePagePath(path: string): string | null {
  const p = path.split("?")[0].replace(/\/$/, "") || "/"
  // Skip tokens/confirmation paths — not meaningful analytics
  if (p.startsWith("/confirm/")) return null
  if (p.startsWith("/cancel/")) return null
  if (p.startsWith("/quote/")) return null
  // Collapse dynamic sub-routes to their parent
  if (p.startsWith("/blog/")) return "/blog"
  if (p.startsWith("/areas/")) return "/areas"
  return p
}

export function recordPageView(path: string, referrer: string | null, userAgent: string | null, ip: string | null): void {
  const db = getDb()
  const normalised = normalizePagePath(path)
  if (!normalised) return  // skip paths we don't want to track

  // Deduplicate: one record per IP per path per day
  if (ip) {
    const today = new Date().toISOString().slice(0, 10)
    const existing = db.prepare(
      "SELECT id FROM page_views WHERE ip_address = ? AND path = ? AND date(created_at) = ? LIMIT 1"
    ).get(ip, normalised, today)
    if (existing) return
  }
  db.prepare("INSERT INTO page_views (path, ip_address, referrer, user_agent) VALUES (?, ?, ?, ?)").run(normalised, ip, referrer, userAgent)
}

export type PageViewStats = {
  totalViews: number
  uniqueVisitors: number
  viewsByDay: { date: string; views: number; visitors: number }[]
  topPages: { path: string; views: number; visitors: number }[]
  topReferrers: { referrer: string; count: number }[]
}

export type RecentPageView = {
  path: string
  ip_address: string | null
  referrer: string | null
  user_agent: string | null
  created_at: string
}

export function getPageViewStats(days = 30): PageViewStats {
  const db = getDb()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const row = db.prepare("SELECT COUNT(*) as views, COUNT(DISTINCT ip_address) as visitors FROM page_views WHERE date(created_at) >= ?").get(since) as { views: number; visitors: number }
  const totalViews = row.views
  const uniqueVisitors = row.visitors

  const viewsByDay = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as views, COUNT(DISTINCT ip_address) as visitors
    FROM page_views WHERE date(created_at) >= ?
    GROUP BY date(created_at) ORDER BY date ASC
  `).all(since) as { date: string; views: number; visitors: number }[]

  const topPages = db.prepare(`
    SELECT path, COUNT(*) as views, COUNT(DISTINCT ip_address) as visitors
    FROM page_views WHERE date(created_at) >= ?
    GROUP BY path ORDER BY views DESC LIMIT 20
  `).all(since) as { path: string; views: number; visitors: number }[]

  const topReferrers = db.prepare(`
    SELECT COALESCE(referrer, 'Direct') as referrer, COUNT(*) as count
    FROM page_views WHERE date(created_at) >= ? AND (referrer IS NULL OR referrer NOT LIKE '%jamiesautocare.com%')
    GROUP BY referrer ORDER BY count DESC LIMIT 10
  `).all(since) as { referrer: string; count: number }[]

  return { totalViews, uniqueVisitors, viewsByDay, topPages, topReferrers }
}

export function getRecentPageViews(limit = 100): RecentPageView[] {
  return getDb().prepare(
    "SELECT path, ip_address, referrer, user_agent, created_at FROM page_views ORDER BY created_at DESC LIMIT ?"
  ).all(limit) as RecentPageView[]
}

export function updateBookingIp(id: number, ip: string): void {
  getDb().prepare("UPDATE bookings SET ip_address = ? WHERE id = ?").run(ip, id)
}

// Returns confirmed bookings whose appointment is tomorrow and reminder not yet sent
export function getBookingsForReminder(): Booking[] {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)
  return getDb().prepare(
    "SELECT * FROM bookings WHERE confirmed_date = ? AND status = 'confirmed' AND (reminder_sent IS NULL OR reminder_sent = 0) AND email != ''"
  ).all(tomorrowStr) as Booking[]
}

export function markBookingReminderSent(id: number): void {
  getDb().prepare("UPDATE bookings SET reminder_sent = 1 WHERE id = ?").run(id)
}

export function markReviewRequestSent(id: number): void {
  getDb().prepare("UPDATE bookings SET review_request_sent = 1 WHERE id = ?").run(id)
}

export type PortfolioItem = {
  id: number
  title: string
  vehicle: string
  description: string
  image_before: string
  image_after: string
  testimonial: string
  customer: string
  active: number
  sort_order: number
  created_at: string
}

export function getPortfolioItems(activeOnly = false): PortfolioItem[] {
  const db = getDb()
  const q = activeOnly
    ? "SELECT * FROM portfolio_items WHERE active = 1 ORDER BY sort_order ASC, id ASC"
    : "SELECT * FROM portfolio_items ORDER BY sort_order ASC, id ASC"
  return db.prepare(q).all() as PortfolioItem[]
}

export function getPortfolioItem(id: number): PortfolioItem | null {
  return getDb().prepare("SELECT * FROM portfolio_items WHERE id = ?").get(id) as PortfolioItem | null
}

export function createPortfolioItem(data: Omit<PortfolioItem, "id" | "created_at">): number {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO portfolio_items (title, vehicle, description, image_before, image_after, testimonial, customer, active, sort_order)
    VALUES (@title, @vehicle, @description, @image_before, @image_after, @testimonial, @customer, @active, @sort_order)
  `).run(data)
  return result.lastInsertRowid as number
}

export function updatePortfolioItem(id: number, data: Partial<Omit<PortfolioItem, "id" | "created_at">>): void {
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(", ")
  getDb().prepare(`UPDATE portfolio_items SET ${fields} WHERE id = @id`).run({ ...data, id })
}

export function deletePortfolioItem(id: number): void {
  getDb().prepare("DELETE FROM portfolio_items WHERE id = ?").run(id)
}
