import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HomePage from '../pages/HomePage';
import MergePage from '../pages/MergePage';
import SplitPage from '../pages/SplitPage';
import CompressPage from '../pages/CompressPage';
import PdfToWordPage from '../pages/PdfToWordPage';
import WordToPdfPage from '../pages/WordToPdfPage';
import PowerpointToPdfPage from '../pages/PowerpointToPdfPage';
import ExcelToPdfPage from '../pages/ExcelToPdfPage';
import PdfToJpgPage from '../pages/PdfToJpgPage';
import JpgToPdfPage from '../pages/JpgToPdfPage';
import SignPage from '../pages/SignPage';
import WatermarkPage from '../pages/WatermarkPage';
import RotatePage from '../pages/RotatePage';
import HtmlToPdfPage from '../pages/HtmlToPdfPage';
import UnlockPage from '../pages/UnlockPage';
import ProtectPage from '../pages/ProtectPage';
import PageNumbersPage from '../pages/PageNumbersPage';
import RepairPage from '../pages/RepairPage';
import EditPdfPage from '../pages/EditPdfPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import HowToEditPdfPage from '../pages/info/HowToEditPdfPage';
import WhyUsePdfPage from '../pages/info/WhyUsePdfPage';
import BlogIndexPage from '../src/pages/blog/BlogIndexPage';
import BlogPostPage from '../src/pages/blog/BlogPostPage';

const App = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/merge" element={<MergePage />} />
        <Route path="/split" element={<SplitPage />} />
        <Route path="/compress" element={<CompressPage />} />
        <Route path="/pdf-to-word" element={<PdfToWordPage />} />
        <Route path="/word-to-pdf" element={<WordToPdfPage />} />
        <Route path="/powerpoint-to-pdf" element={<PowerpointToPdfPage />} />
        <Route path="/excel-to-pdf" element={<ExcelToPdfPage />} />
        <Route path="/pdf-to-jpg" element={<PdfToJpgPage />} />
        <Route path="/jpg-to-pdf" element={<JpgToPdfPage />} />
        <Route path="/sign" element={<SignPage />} />
        <Route path="/watermark" element={<WatermarkPage />} />
        <Route path="/rotate" element={<RotatePage />} />
        <Route path="/html-to-pdf" element={<HtmlToPdfPage />} />
        <Route path="/unlock" element={<UnlockPage />} />
        <Route path="/protect" element={<ProtectPage />} />
        <Route path="/page-numbers" element={<PageNumbersPage />} />
        <Route path="/repair" element={<RepairPage />} />
        <Route path="/edit-pdf" element={<EditPdfPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/how-to-edit-pdf" element={<HowToEditPdfPage />} />
        <Route path="/why-use-pdf" element={<WhyUsePdfPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;