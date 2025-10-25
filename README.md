# TryLebs.ai - AI-Powered Virtual Clothing Try-On

Welcome to TryLebs.ai, a cutting-edge virtual try-on platform designed for the Middle East market. This application uses advanced AI technology (Kolors Virtual Try-On) to let users see how clothes look on them before making a purchase.

## Features

- **AI-Powered Virtual Try-On**: Upload a photo of yourself and a clothing item to see how it looks on you
- **Bilingual Support**: Full support for English and Arabic with RTL layout
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **User-Friendly Interface**: Simple drag-and-drop image upload
- **Instant Results**: Get your virtual try-on results in seconds
- **Download Results**: Save your try-on images for later reference

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **AI Model**: Kolors Virtual Try-On (via Hugging Face)
- **API Integration**: Gradio Client
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd trylebs
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Your Photo**: Click or drag-and-drop a clear photo of yourself
2. **Upload Clothing**: Add an image of the clothing item you want to try
3. **Click "Try On"**: The AI will process your images and show you the result
4. **Download**: Save the result image to your device

## Deployment

### Deploy to Vercel

The easiest way to deploy this application is using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

### Environment Variables

No environment variables are required for the basic setup. The application uses the public Kolors Virtual Try-On API through Gradio.

For production deployment with custom API endpoints, you can add:

```env
NEXT_PUBLIC_API_ENDPOINT=your-custom-endpoint
```

## Project Structure

```
trylebs/
├── app/
│   ├── api/
│   │   └── tryon/
│   │       └── route.ts          # API endpoint for virtual try-on
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── ImageUpload.tsx           # Image upload component
│   ├── LanguageSwitcher.tsx      # Language toggle component
│   └── LoadingSpinner.tsx        # Loading indicator
├── lib/
│   ├── translations.ts           # i18n translations
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── package.json                 # Dependencies
```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- Maximum file size: 10MB per image

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Limitations

- The AI model is hosted on Hugging Face and may have rate limits
- Processing time depends on server load (typically 5-15 seconds)
- Best results with clear, well-lit photos
- Works best with upper body clothing items

## Future Enhancements

- [ ] User authentication and history
- [ ] Multiple clothing categories (tops, dresses, etc.)
- [ ] Social sharing features
- [ ] Advanced editing options
- [ ] Integration with e-commerce platforms
- [ ] Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, please contact: support@trylebs.ai

## Acknowledgments

- Powered by [Kolors Virtual Try-On](https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On)
- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ for the Middle East fashion community
