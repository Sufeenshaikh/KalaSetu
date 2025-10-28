import React, { useState } from 'react';
import { products as initialProducts } from '../data/products';
import { generateECommerceImage } from '../services/geminiService';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import type { Product } from '../types';

type ProductWithStatus = Product & {
  status: 'pending' | 'generating' | 'done';
  newImageUrl?: string;
};

const AdminBulkImageGenerator: React.FC = () => {
  const [products, setProducts] = useState<ProductWithStatus[]>(
    initialProducts.map(p => ({ ...p, status: 'pending' }))
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalCode, setFinalCode] = useState('');

  const handleGenerateImages = async () => {
    setIsProcessing(true);
    setFinalCode('');

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'generating' } : p));
        const newImageUrl = await generateECommerceImage(product.title);
        // FIX: Explicitly typed 'updatedProduct' as 'ProductWithStatus' to resolve a TypeScript type inference error. The compiler was incorrectly widening the type of the 'status' property to 'string' instead of the literal 'done', causing a type mismatch when updating the component's state.
        const updatedProduct: ProductWithStatus = { ...product, images: [newImageUrl], status: 'done', newImageUrl };
        setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
        return updatedProduct;
      })
    );

    const codeString = `export const products = ${JSON.stringify(
        updatedProducts.map(({ id, title, category, region, price, description, images, artisanId, artisanName }) => ({
            id, title, category, region, price, description, images, artisanId, artisanName
        })), null, 2
    )};`;

    setFinalCode(codeString);
    setIsProcessing(false);
  };
  
  const copyToClipboard = () => {
      navigator.clipboard.writeText(finalCode).then(() => {
          alert("Copied to clipboard!");
      }).catch(err => {
          console.error("Failed to copy:", err);
      })
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto bg-surface p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-heading font-bold text-secondary">Bulk Image Generator</h1>
        <p className="text-text-secondary mt-2 mb-6">
          Use this tool to generate a new e-commerce style product image for every item in your `products.js` file. The final code can be copied and pasted to update your mock data.
        </p>
        <div className="text-center mb-8">
          <Button onClick={handleGenerateImages} disabled={isProcessing}>
            {isProcessing ? 'Generating Images...' : 'Start Image Generation'}
          </Button>
        </div>
        
        <div className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="bg-background/50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
              <div className="flex items-center">
                <div className="relative w-16 h-16 mr-4">
                    <img src={product.newImageUrl || product.images[0]} alt={product.title} className="w-16 h-16 rounded-md object-cover" />
                    {product.status === 'generating' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{product.title}</h4>
                  <p className={`text-sm font-medium ${
                      product.status === 'done' ? 'text-emerald-500' : 'text-text-secondary'
                  }`}>Status: {product.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {finalCode && (
            <div className="mt-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-heading font-bold text-secondary">Generation Complete</h2>
                    <Button onClick={copyToClipboard} variant="outline">Copy Code</Button>
                </div>
                <p className="text-text-secondary mb-4">Copy the code below and replace the content of your `data/products.js` file.</p>
                <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
                    <code>
                        {finalCode}
                    </code>
                </pre>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminBulkImageGenerator;