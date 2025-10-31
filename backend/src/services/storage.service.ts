import { storage } from './firebase.service';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  static async uploadFile(
    file: Express.Multer.File,
    path: string,
    metadata?: { [key: string]: string }
  ): Promise<string> {
    try {
      const bucket = storage.bucket();
      const fileName = `${path}/${uuidv4()}-${file.originalname}`;
      const blob = bucket.file(fileName);

      // Create write stream
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          metadata: metadata
        }
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
          reject(error);
        });

        blobStream.on('finish', async () => {
          // Make the file public
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async deleteFile(fileUrl: string) {
    try {
      const bucket = storage.bucket();
      const fileName = fileUrl.split('/').pop();
      if (!fileName) throw new Error('Invalid file URL');

      await bucket.file(fileName).delete();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  static async uploadMultipleFiles(
    files: Express.Multer.File[],
    path: string,
    metadata?: { [key: string]: string }
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file, path, metadata)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }
}