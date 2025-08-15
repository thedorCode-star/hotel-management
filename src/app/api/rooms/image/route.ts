import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('🏨 Room image upload request received');
    
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const roomNumber = formData.get('roomNumber') as string;

    console.log('🏨 Form data received:', {
      hasImage: !!image,
      hasRoomNumber: !!roomNumber,
      imageType: image?.type,
      imageSize: image?.size,
      imageName: image?.name
    });

    if (!image || !roomNumber) {
      return NextResponse.json(
        { message: 'Image file and room number are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'rooms');
    console.log('📁 Uploads directory:', uploadsDir);
    
    if (!existsSync(uploadsDir)) {
      console.log('📁 Creating uploads directory...');
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = image.name.split('.').pop();
    const fileName = `room-${roomNumber}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    
    console.log('📁 File path:', filePath);

    // Convert File to Buffer and save
    console.log('💾 Saving file...');
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log('✅ File saved successfully');

    // Return the public URL
    const imageUrl = `/uploads/rooms/${fileName}`;
    console.log('🔗 Room image URL:', imageUrl);

    return NextResponse.json({
      message: 'Room image uploaded successfully',
      imageUrl
    });

  } catch (error) {
    console.error('Error uploading room image:', error);
    return NextResponse.json(
      { message: 'Failed to upload room image' },
      { status: 500 }
    );
  }
}
