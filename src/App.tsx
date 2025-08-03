import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MergePage from './pages/MergePage';
import UnlockPage from './pages/UnlockPage';
import SplitPage from './pages/SplitPage';
import CompressPage from './pages/CompressPage';
import PdfToWordPage from './pages/PdfToWordPage';
import PdfToExcelPage from './pages/PdfToExcelPage';
import WordToPdfPage from './pages/WordToPdfPage';
import PowerpointToPdfPage from './pages/PowerpointToPdfPage';
import ExcelToPdfPage from './pages/ExcelToPdfPage';
import PdfToJpgPage from './pages/PdfToJpgPage';
import JpgToPdfPage from './pages/JpgToPdfPage';
import SignPage from './pages/SignPage';
import WatermarkPage from './pages/WatermarkPage';
import RotatePage from './pages/RotatePage';
import HtmlToPdfPage from './pages/HtmlToPdfPage';
import ProtectPage from './pages/ProtectPage';
import PageNumbersPage from './pages/PageNumbersPage';
import RepairPage from './pages/RepairPage';
import EditPdfPage from './pages/EditPdfPage';
import HowToEditPdfPage from './pages/info/HowToEditPdfPage';
import WhyUsePdfPage from './pages/info/WhyUsePdfPage';
import SitemapPage from './pages/SitemapPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import BlogIndexPage from './pages/blog/BlogIndexPage';
import BlogPostPage from './pages/blog/BlogPostPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red' }}>Error: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/merge" element={<MergePage />} />
          <Route path="/unlock" element={<UnlockPage />} />
          <Route path="/split" element={<SplitPage />} />
          <Route path="/compress" element={<CompressPage />} />
          <Route path="/pdf-to-word" element={<PdfToWordPage />} />
          <Route path="/pdf-to-excel" element={<PdfToExcelPage />} />
          <Route path="/word-to-pdf" element={<WordToPdfPage />} />
          <Route path="/powerpoint-to-pdf" element={<PowerpointToPdfPage />} />
          <Route path="/excel-to-pdf" element={<ExcelToPdfPage />} />
          <Route path="/pdf-to-jpg" element={<PdfToJpgPage />} />
          <Route path="/jpg-to-pdf" element={<JpgToPdfPage />} />
          <Route path="/sign" element={<SignPage />} />
          <Route path="/watermark" element={<WatermarkPage />} />
          <Route path="/rotate" element={<RotatePage />} />
          <Route path="/html-to-pdf" element={<HtmlToPdfPage />} />
          <Route path="/protect" element={<ProtectPage />} />
          <Route path="/page-numbers" element={<PageNumbersPage />} />
          <Route path="/repair" element={<RepairPage />} />
          <Route path="/edit-pdf" element={<EditPdfPage />} />
          <Route path="/info/how-to-edit-pdf" element={<HowToEditPdfPage />} />
          <Route path="/info/why-use-pdf" element={<WhyUsePdfPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </ErrorBoundary>
);
export default App;