# Jamie's Auto Care Website

This is a Next.js project that is built for static export to traditional hosting.

## Development

First, run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To build the static export:

\`\`\`bash
npm run build
\`\`\`

This will create an `out` directory with all static files.

## Deployment

After building, you can deploy the contents of the `out` directory to any static hosting service.

For Verpex hosting:
1. Upload all files from the `out` directory to your public_html folder
2. Make sure to include the .htaccess file
3. Set up the database using the provided SQL
4. Update the PHP files with your database credentials
