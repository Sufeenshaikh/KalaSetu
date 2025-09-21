import React, { useState, useEffect } from 'react';
import { getArtisanById, updateArtisan } from '../services/firestoreService';
import { generateArtisanStory, enhanceProductImage } from '../services/geminiService';
import type { Artisan } from '../types';
import Button from './Button';
import Spinner from './Spinner';

interface ArtisanProfileManagerProps {
  artisanId: string;
}

const ArtisanProfileManager: React.FC<ArtisanProfileManagerProps> = ({ artisanId }) => {
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [formData, setFormData] = useState<Partial<Artisan>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  useEffect(() => {
    const fetchArtisan = async () => {
      setLoading(true);
      const data = await getArtisanById(artisanId);
      if (data) {
        setArtisan(data);
        setFormData(data);
      } else {
        // Artisan not found, must be a new registration.
        // Initialize a blank form for them to fill out.
        const defaultProfile: Artisan = {
          id: artisanId,
          name: '',
          region: '',
          bio: '',
          story: '',
          image: '', // No default avatar
        };
        setArtisan(defaultProfile);
        setFormData(defaultProfile);
      }
      setLoading(false);
    };
    fetchArtisan();
  }, [artisanId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhance = async () => {
    if (!formData.image) return;
    setIsEnhancing(true);
    try {
      const match = formData.image.match(/^data:(.+);base64,(.+)$/);
      if (!match) throw new Error("Invalid image format");
      const mimeType = match[1];
      const base64Data = match[2];
      const enhancedImage = await enhanceProductImage(base64Data, mimeType);
      setFormData({ ...formData, image: enhancedImage });
    } catch (error) {
      console.error("Failed to enhance image:", error);
      alert("Image enhancement failed.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!formData.bio) {
        alert("Please provide some context about yourself in the 'Bio' section to generate a story.");
        return;
    }
    setIsGenerating(true);
    try {
      const newStory = await generateArtisanStory(formData.bio);
      setFormData({ ...formData, story: newStory });
    } catch (error)      {
      console.error("Failed to generate story:", error);
      alert("Story generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const savedArtisan = await updateArtisan(artisanId, formData);
      if (savedArtisan) {
        setArtisan(savedArtisan);
        setFormData(savedArtisan);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!artisan) return <p>Could not load artisan profile.</p>

  return (
    <div className="bg-background/50 p-6 rounded-lg mb-8 border border-accent/50">
      <h2 className="text-2xl font-heading font-bold text-secondary mb-6">Manage My Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center gap-6">
            {/* Image Upload */}
            <div className="w-full">
                <label className="block text-sm font-medium text-text-primary mb-2 text-center">Profile Picture</label>
                <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-accent/50 mx-auto">
                    {formData.image ? (
                        <img src={formData.image} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs text-center text-gray-500 p-2">Upload an image</span>
                    )}
                </div>
                <div className="mt-4 text-center">
                    <input type="file" id="image-upload-profile" className="hidden" accept="image/*" onChange={handleImageChange} />
                    <Button type="button" variant="outline" className="text-sm" onClick={() => document.getElementById('image-upload-profile')?.click()}>Upload Image</Button>
                    {formData.image && (
                         <Button type="button" onClick={handleEnhance} disabled={isEnhancing} className="text-sm ml-2">
                             {isEnhancing ? 'Enhancing...' : '✨ Enhance'}
                         </Button>
                    )}
                </div>
            </div>

            {/* Text Fields */}
            <div className="w-full space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary">Full Name</label>
                  <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-text-primary">Region</label>
                  <input type="text" name="region" id="region" value={formData.region || ''} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-text-primary">Bio / Short Description</label>
                  <p className="text-xs text-text-secondary mb-1">A brief, one-line description about you. This will be used as context for the AI story generator.</p>
                  <input type="text" name="bio" id="bio" value={formData.bio || ''} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
            </div>
        </div>
        
        {/* Story Section */}
        <div>
          <label htmlFor="story" className="block text-sm font-medium text-text-primary mb-1">My Story</label>
          <textarea name="story" id="story" value={formData.story || ''} onChange={handleInputChange} required rows={7} className="block w-full border border-gray-600 bg-secondary text-white placeholder-gray-400 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"></textarea>
          <div className="mt-2 text-right">
              <Button type="button" onClick={handleGenerateStory} variant="outline" className="text-sm py-2 px-4" disabled={isGenerating}>
                 {isGenerating ? 'Generating...' : '✨ Write My Story with AI'}
              </Button>
          </div>
        </div>

        <div className="text-right mt-6 border-t pt-6">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArtisanProfileManager;