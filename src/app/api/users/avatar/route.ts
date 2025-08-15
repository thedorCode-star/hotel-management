import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ Avatar upload request received');
    
    const formData = await request.formData();
    const avatar = formData.get('avatar') as File;
    const userId = formData.get('userId') as string;

    console.log('🖼️ Form data received:', {
      hasAvatar: !!avatar,
      hasUserId: !!userId,
      avatarType: avatar?.type,
      avatarSize: avatar?.size,
      avatarName: avatar?.name
    });

    if (!avatar || !userId) {
      return NextResponse.json(
        { message: 'Avatar file and user ID are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!avatar.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (avatar.size > maxSize) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    console.log('📁 Uploads directory:', uploadsDir);
    
    if (!existsSync(uploadsDir)) {
      console.log('📁 Creating uploads directory...');
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = avatar.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    
    console.log('📁 File path:', filePath);

    // Convert File to Buffer and save
    console.log('💾 Saving file...');
    const bytes = await avatar.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log('✅ File saved successfully');

    // Return the public URL
    const avatarUrl = `/uploads/avatars/${fileName}`;
    console.log('🔗 Avatar URL:', avatarUrl);

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatarUrl
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { message: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
