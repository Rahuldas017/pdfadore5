
import React from 'react';
import { Tool } from './types';
import { 
  DocumentTextIcon, 
  ListBulletIcon, 
  SparklesIcon,
  MergeIcon,
  SplitIcon,
  CompressIcon,
  WordIcon,
  PowerPointIcon,
  ExcelIcon,
  JpgIcon,
  SignIcon,
  WatermarkIcon,
  RotateIcon,
  UnlockIcon,
  LockIcon,
  PageNumberIcon,
  RepairIcon,
  HtmlIcon,
  EditIcon,
  AiEditIcon,
} from './components/icons/IconComponents';

const iconClass = "w-10 h-10 text-slate-700 dark:text-slate-300";

export const TOOLS: Tool[] = [
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Add text, images, or whiteout to your PDF document.',
    path: '/edit-pdf',
    icon: <EditIcon className={iconClass} />,
  },
  { id: 'merge', title: 'Merge PDF', description: 'Combine PDFs in the order you want.', path: '/merge', icon: <MergeIcon className={iconClass}/> },
  { id: 'split', title: 'Split PDF', description: 'Separate one page or a whole set for easy conversion.', path: '/split', icon: <SplitIcon className={iconClass}/> },
  { id: 'compress', title: 'Compress PDF', description: 'Reduce file size while optimizing for max PDF quality.', path: '/compress', icon: <CompressIcon className={iconClass}/> },
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Easily convert your PDF files into DOCX documents.', path: '/pdf-to-word', icon: <WordIcon className={iconClass}/> },
  { id: 'pdf-to-excel', title: 'PDF to Excel', description: 'Pull data straight from PDFs into Excel spreadsheets.', path: '/pdf-to-excel', icon: <ExcelIcon className={iconClass}/> },
  { id: 'word-to-pdf', title: 'Word to PDF', description: 'Make DOC and DOCX files easy to read by converting to PDF.', path: '/word-to-pdf', icon: <WordIcon className={iconClass}/> },
  { id: 'powerpoint-to-pdf', title: 'PowerPoint to PDF', description: 'Make PPT and PPTX slideshows easy to view by converting to PDF.', path: '/powerpoint-to-pdf', icon: <PowerPointIcon className={iconClass}/> },
  { id: 'excel-to-pdf', title: 'Excel to PDF', description: 'Make EXCEL spreadsheets easy to read by converting to PDF.', path: '/excel-to-pdf', icon: <ExcelIcon className={iconClass}/> },
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Convert each PDF page into a JPG or extract all images.', path: '/pdf-to-jpg', icon: <JpgIcon className={iconClass}/> },
  { id: 'jpg-to-pdf', title: 'Image to PDF', description: 'Convert JPG and PNG images to PDF. Adjust orientation and margins.', path: '/jpg-to-pdf', icon: <JpgIcon className={iconClass}/> },
  { id: 'sign', title: 'Sign PDF', description: 'Sign yourself or send signature requests to others.', path: '/sign', icon: <SignIcon className={iconClass}/> },
  { id: 'watermark', title: 'Watermark', description: 'Stamp an image or text over your PDF in seconds.', path: '/watermark', icon: <WatermarkIcon className={iconClass}/> },
  { id: 'rotate', title: 'Rotate PDF', description: 'Rotate your PDFs the way you need them.', path: '/rotate', icon: <RotateIcon className={iconClass}/> },
  { id: 'html-to-pdf', title: 'HTML to PDF', description: 'Convert webpages in HTML to PDF.', path: '/html-to-pdf', icon: <HtmlIcon className={iconClass} /> },
  { id: 'unlock', title: 'Unlock PDF', description: 'Remove PDF password security, giving you the freedom to use them.', path: '/unlock', icon: <UnlockIcon className={iconClass}/> },
  { id: 'protect', title: 'Protect PDF', description: 'Protect PDF files with a password.', path: '/protect', icon: <LockIcon className={iconClass}/> },
  { id: 'page-numbers', title: 'Page Numbers', description: 'Add page numbers into your PDF files.', path: '/page-numbers', icon: <PageNumberIcon className={iconClass}/> },
  { id: 'repair', title: 'Repair PDF', description: 'Repair a damaged PDF and recover data.', path: '/repair', icon: <RepairIcon className={iconClass}/> },
];

export const INFO_PAGES = [
    { path: '/info/how-to-edit-pdf', title: 'How to Edit a PDF'},
    { path: '/info/why-use-pdf', title: 'Why Use the PDF Format?'},
    { path: '/about', title: 'About Us'},
    { path: '/contact', title: 'Contact Us'},
    { path: '/blog', title: 'Blog'},
    { path: '/privacy-policy', title: 'Privacy Policy'},
    { path: '/disclaimer', title: 'Disclaimer'},
];
