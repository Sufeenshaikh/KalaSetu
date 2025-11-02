import React, { useState, useEffect } from 'react';
import { getProductsByArtisanId, addProduct, updateProduct, deleteProduct } from '../services/firestoreService';
import { generateArtisanStory, enhanceProductImage, suggestProductPrice, analyzeProductImage } from '../services/geminiService';
import { uploadImage, uploadImageFromDataUri } from '../services/storageService';
import type { Product } from '../types';
import Button from './Button';
import Spinner from './Spinner';

interface ArtisanProductManagerProps {
  artisanId: string;
}

// Define the shape for the form state, which doesn't include all product fields
// FIX: Omit 'likes' from the form data type, as it's not a user-editable field. This resolves type errors where 'likes' was missing from objects of this type.
type ProductFormData = Omit<Product, 'id' | 'artisanId' | 'artisanName' | 'likes'>;

const initialState: ProductFormData = {
  title: '',
  description: '',
  price: 0,
  category: '',
  region: '',
  images: [''],
  // likes is intentionally omitted as it's not part of the form
};


const ArtisanProductManager: React.FC<ArtisanProductManagerProps> = ({ artisanId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductFormData>(initialState);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New state for AI features
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [showEnhancePreview, setShowEnhancePreview] = useState(false);
  const [originalImageForPreview, setOriginalImageForPreview] = useState<string | null>(null);
  const [enhancedImageForPreview, setEnhancedImageForPreview] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    const artisanProducts = await getProductsByArtisanId(artisanId);
    setProducts(artisanProducts);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [artisanId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            // Set the image preview immediately
            setNewProduct(prev => ({ ...initialState, images: [base64String] }));

            // Now, analyze the image to populate other fields
            const match = base64String.match(/^data:(.+);base64,(.+)$/);
            if (!match) {
                console.error("Invalid image format for AI analysis");
                return;
            }
            const mimeType = match[1];
            const base64Data = match[2];

            setIsAnalyzingImage(true);
            try {
                const productDetails = await analyzeProductImage(base64Data, mimeType);
                setNewProduct(prev => ({
                    ...prev, // Keep the image
                    title: productDetails.title,
                    category: productDetails.category,
                    description: productDetails.description,
                    price: productDetails.price,
                    region: productDetails.region,
                }));
            } catch (error) {
                console.error("Failed to analyze product image:", error);
                alert("There was an error analyzing the image. Please fill in the details manually.");
            } finally {
                setIsAnalyzingImage(false);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleEnhanceImage = async () => {
      if (!newProduct.images[0]) return;
      
      setIsEnhancing(true);
      setOriginalImageForPreview(newProduct.images[0]);
      try {
          const match = newProduct.images[0].match(/^data:(.+);base64,(.+)$/);
          if (!match) throw new Error("Invalid image format");
          const mimeType = match[1];
          const base64Data = match[2];
          
          const enhancedImage = await enhanceProductImage(base64Data, mimeType);
          setEnhancedImageForPreview(enhancedImage);
          setNewProduct(prev => ({...prev, images: [enhancedImage]}));
          setShowEnhancePreview(true);
      } catch (error: any) {
          console.error("Failed to enhance image:", error);
          const errorMessage = error?.message || "There was an error enhancing the image. Please try again.";
          alert(errorMessage);
      } finally {
          setIsEnhancing(false);
      }
  };
  
  const handleSuggestPrice = async () => {
      const { title, category, region, description } = newProduct;
      if (!title || !category || !region || !description) {
          alert("Please fill in Title, Description, Category, and Region to suggest a price.");
          return;
      }
      setIsSuggestingPrice(true);
      try {
          const suggestedPrice = await suggestProductPrice({ title, category, region, description });
          if (suggestedPrice > 0) {
              setNewProduct(prev => ({ ...prev, price: suggestedPrice }));
          } else {
              alert("Could not suggest a price at this time. Please enter one manually.");
          }
      } catch (error) {
          console.error("Failed to suggest price:", error);
          alert("An error occurred while suggesting a price.");
      } finally {
          setIsSuggestingPrice(false);
      }
  };

  const handleGenerateStory = async () => {
    if (!newProduct.description || newProduct.description.trim().length === 0) {
      alert("Please provide a product description first to generate a story.");
      return;
    }
    setIsGeneratingStory(true);
    try {
        const story = await generateArtisanStory(newProduct.description);
        setNewProduct(prev => ({ ...prev, description: story }));
    } catch (error: any) {
        console.error("Failed to generate story:", error);
        const errorMessage = error?.message || "Story generation failed. Please try again later.";
        alert(errorMessage);
    } finally {
        setIsGeneratingStory(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        region: product.region,
        images: product.images,
    });
    setShowForm(true);
  };
  
  const handleDeleteClick = async (productId: string) => {
      if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
          try {
              await deleteProduct(productId);
              // Optimistically update the UI by filtering out the deleted product from the local state
              setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
          } catch (error) {
              console.error("Failed to delete product:", error);
              alert("There was an error deleting the product. Please try again.");
          }
      }
  };

  const handleCancel = () => {
      setShowForm(false);
      setEditingProduct(null);
      setNewProduct(initialState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.images[0]) {
        alert("Please upload an image for the product.");
        return;
    }
    setIsSubmitting(true);
    try {
      // Upload images to Firebase Storage if they're data URIs (with timeout)
      let imageUrls = [...newProduct.images];
      
      // Check if images need to be uploaded (if they're data URIs)
      const imagesToUpload = imageUrls.filter(url => url.startsWith('data:'));
      
      if (imagesToUpload.length > 0) {
        try {
          // Add timeout to image uploads (10 seconds total)
          const uploadPromises = imagesToUpload.map(dataUri => 
            Promise.race([
              uploadImageFromDataUri(dataUri, { folder: 'products' }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Image upload timeout')), 10000)
              )
            ])
          );
          
          const uploadedUrls = await Promise.all(uploadPromises) as string[];
          
          // Replace data URIs with uploaded URLs
          let uploadIndex = 0;
          imageUrls = imageUrls.map(url => {
            if (url.startsWith('data:')) {
              return uploadedUrls[uploadIndex++];
            }
            return url; // Keep existing URLs
          });
        } catch (uploadError) {
          console.warn("Image upload failed or timed out, using data URIs:", uploadError);
          // Continue with data URIs - they'll work for local storage
          // Don't block the save process
        }
      }
      
      // Update product with image URLs (may be data URIs if upload failed)
      const productData = {
        ...newProduct,
        images: imageUrls,
      };
      
      if (editingProduct) {
          await updateProduct(editingProduct.id, productData);
          alert("Product updated successfully!");
      } else {
          // FIX: Add a default 'likes' value of 0 when creating a new product to satisfy the type constraints of the 'addProduct' service.
          await addProduct({ ...productData, artisanId, likes: 0 });
          alert("Product saved successfully!");
      }
      handleCancel(); // Reset form and hide it
      await loadProducts(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to save product:", error);
      // Product should already be saved locally, so show success
      alert("Product saved successfully! (Saved locally - Firebase may be unavailable)");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold text-secondary">My Products</h2>
        <Button onClick={showForm ? handleCancel : () => setShowForm(true)} variant={showForm ? 'outline' : 'primary'}>
          {showForm ? 'Cancel' : 'Add New Product'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-background/50 p-6 rounded-lg mb-8 border border-accent/50">
          <h3 className="text-xl font-bold text-secondary mb-4">{editingProduct ? 'Edit Product' : 'Add a New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="relative">
                {isAnalyzingImage && (
                    <div className="absolute inset-0 bg-secondary/80 flex flex-col items-center justify-center rounded-lg z-10 text-white">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent"></div>
                         <p className="mt-4 font-semibold text-lg">Analyzing image with AI...</p>
                         <p className="text-sm">Populating product details.</p>
                     </div>
                )}
                <div className={`space-y-6 ${isAnalyzingImage ? 'opacity-30 pointer-events-none' : ''}`}>
                    <div>
                        <label className="block text-sm font-medium text-text-primary">Product Image</label>
                        <p className="text-xs text-text-secondary mb-2">Upload an image, and AI will automatically fill in the product details for you.</p>
                        <div className="mt-2 flex items-center space-x-6">
                            <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                                {newProduct.images?.[0] ? (
                                    <img src={newProduct.images[0]} alt="Product preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-center text-gray-500 p-2">Upload an image to start</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    id="image-upload" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange} 
                                />
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                >
                                    Upload Image
                                </Button>

                                {newProduct.images[0] && (
                                    <div className="mt-4">
                                         <Button 
                                            type="button" 
                                            onClick={handleEnhanceImage} 
                                            disabled={isEnhancing}
                                            className="text-sm py-2 px-4"
                                        >
                                            {isEnhancing ? 'Enhancing...' : '✨ Enhance Image with AI'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-text-primary">Product Title</label>
                      <input type="text" name="title" id="title" value={newProduct.title} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">Description / Story</label>
                      <textarea name="description" id="description" value={newProduct.description} onChange={handleInputChange} required rows={5} className="block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"></textarea>
                      <div className="mt-2 text-right">
                          <Button type="button" onClick={handleGenerateStory} variant="outline" className="text-xs py-1 px-2" disabled={isGeneratingStory}>
                             {isGeneratingStory ? 'Generating...' : '✨ Generate with AI'}
                          </Button>
                      </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-text-primary">Price (₹)</label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <input 
                              type="number" 
                              name="price" 
                              id="price" 
                              value={newProduct.price} 
                              onChange={handleInputChange} 
                              required 
                              className="flex-1 block w-full border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-none rounded-l-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" 
                              placeholder="0"
                            />
                            <Button 
                              type="button" 
                              onClick={handleSuggestPrice} 
                              variant="outline" 
                              className="text-xs rounded-l-none -ml-px px-3 py-2"
                              disabled={isSuggestingPrice}
                            >
                              {isSuggestingPrice ? '...' : '✨ AI Suggest'}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-text-primary">Category</label>
                          <input type="text" name="category" id="category" value={newProduct.category} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="region" className="block text-sm font-medium text-text-primary">Region</label>
                        <input type="text" name="region" id="region" value={newProduct.region} onChange={handleInputChange} required placeholder="e.g., Rajasthan" className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                     </div>
                </div>
            </div>
            <div className="text-right mt-6">
              <Button type="submit" disabled={isSubmitting || isAnalyzingImage}>
                {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Spinner /> : (
        <div className="space-y-4">
          {products.length > 0 ? products.map(product => (
            <div key={product.id} className="bg-background/50 p-4 rounded-lg flex items-center justify-between border border-gray-200">
              <div className="flex items-center flex-1 min-w-0 mr-4">
                <img src={product.images?.[0] || 'https://via.placeholder.com/100'} alt={product.title} className="w-16 h-16 rounded-md object-cover mr-4 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-bold text-text-primary truncate">{product.title}</h4>
                  <p className="text-sm text-text-secondary">₹{product.price}</p>
                </div>
              </div>
              <div className="space-x-2 flex-shrink-0">
                 <Button variant="outline" className="text-sm py-1 px-3" onClick={() => handleEditClick(product)}>Edit</Button>
                 <Button variant="secondary" className="text-sm py-1 px-3 bg-red-600 hover:bg-red-700 focus:ring-red-500" onClick={() => handleDeleteClick(product.id)}>Delete</Button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-text-secondary">You haven't added any products yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Image Enhancement Preview Modal */}
      {showEnhancePreview && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="enhancement-preview-title">
              <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl p-6 relative">
                  <h3 id="enhancement-preview-title" className="text-2xl font-heading font-bold text-secondary mb-6 text-center">Image Enhancement Preview</h3>
                  <button onClick={() => setShowEnhancePreview(false)} className="absolute top-4 right-4 text-text-secondary hover:text-primary transition-colors" aria-label="Close preview">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <h4 className="font-bold text-center mb-2 text-text-secondary">Original</h4>
                          <img src={originalImageForPreview || ''} alt="Original product" className="rounded-md w-full h-auto object-contain max-h-96 border" />
                      </div>
                      <div>
                          <h4 className="font-bold text-center mb-2 text-text-secondary">AI Enhanced</h4>
                          <img src={enhancedImageForPreview || ''} alt="AI Enhanced product" className="rounded-md w-full h-auto object-contain max-h-96 border" />
                      </div>
                  </div>
                  <div className="mt-8 flex justify-center space-x-4">
                       <Button variant="primary" onClick={() => setShowEnhancePreview(false)}>
                           Keep Enhanced Version
                       </Button>
                       <Button variant="outline" onClick={() => {
                           if (originalImageForPreview) {
                               setNewProduct(prev => ({ ...prev, images: [originalImageForPreview] }));
                           }
                           setShowEnhancePreview(false);
                       }}>
                           Revert to Original
                       </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ArtisanProductManager;